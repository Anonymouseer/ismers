"""
Feature extraction pipeline for candidate evaluation against Job Orders.
"""

import re
from typing import List, Dict, Any, Tuple, Set
from .models import ApplicantData, JobOrderData
from .nlp import normalize_text, tokenize, expand_with_synonyms, similarity_ratio
from .config import REGION_CLUSTERS


def parse_duration_years(duration_str: str) -> float:
    """Parse duration text (e.g. '2.5 Years', '2022 – Present', '18 mos') into numeric years."""
    if not duration_str:
        return 1.0

    raw_str = str(duration_str).lower().strip()

    # Check for direct year patterns e.g. "3.5 years", "2 yrs"
    year_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:year|yr|taon)', raw_str)
    if year_match:
        return float(year_match.group(1))

    # Check for month patterns e.g. "18 months", "6 mos"
    month_match = re.search(r'(\d+)\s*(?:month|mo|buwan)', raw_str)
    if month_match:
        return round(float(month_match.group(1)) / 12.0, 1)

    # Check for year ranges e.g. "2020 - 2023", "2021 – 2024", or "2022 - present"
    range_match = re.search(r'(20\d\d)\s*(?:[-–—~]|to|\s)\s*(20\d\d|present|kasalukuyan|current)', raw_str)
    if range_match:
        start_year = int(range_match.group(1))
        end_str = range_match.group(2)
        end_year = 2026 if any(k in end_str for k in ['present', 'kasalukuyan', 'current']) else int(end_str)
        diff = max(0.5, float(end_year - start_year))
        return diff

    return 1.0


def extract_skills_fit(applicant: ApplicantData, job: JobOrderData) -> Tuple[int, List[str], List[str], List[str]]:
    """
    Extract matched skills, missing skills, extra skills, and calculate skills fit score (0-100).
    """
    # Build candidate skills and text pool
    app_skill_set = {normalize_text(s) for s in applicant.skills if s}
    work_text = " ".join([
        f"{w.get('role', '')} {w.get('company', '')}" for w in applicant.work_history
    ])
    doc_text = " ".join([d.get('name', '') for d in applicant.documents])
    summary_text = applicant.experience_summary or ""

    full_candidate_corpus = normalize_text(f"{' '.join(applicant.skills)} {work_text} {doc_text} {summary_text}")
    candidate_tokens = set(tokenize(full_candidate_corpus))
    expanded_candidate = expand_with_synonyms(applicant.skills + [w.get('role', '') for w in applicant.work_history])

    # Target requirements
    requirements = job.required_skills if job.required_skills else [job.title]
    preferred = job.preferred_skills if job.preferred_skills else []
    job_tags = job.tags if job.tags else []

    matched_skills = []
    missing_skills = []
    matched_weights = 0.0
    total_weights = 0.0

    # Evaluate required skills (weight = 1.0 each)
    for req in requirements:
        req_norm = normalize_text(req)
        if not req_norm:
            continue
        total_weights += 1.0
        req_tokens = set(tokenize(req_norm))

        # Direct match or synonym match
        is_match = False
        if req_norm in full_candidate_corpus or any(req_norm in item or item in req_norm for item in expanded_candidate):
            is_match = True
        elif req_tokens and req_tokens.issubset(candidate_tokens):
            is_match = True
        elif req_tokens and len(req_tokens.intersection(candidate_tokens)) / len(req_tokens) >= 0.5:
            is_match = True
        else:
            # Fuzzy match against candidate skills
            for app_skill in applicant.skills:
                if similarity_ratio(req_norm, app_skill) >= 0.78:
                    is_match = True
                    break

        if is_match:
            matched_skills.append(req)
            matched_weights += 1.0
        else:
            missing_skills.append(req)

    # Evaluate preferred skills & tags (weight = 0.5 each)
    for pref in preferred + job_tags:
        pref_norm = normalize_text(pref)
        if not pref_norm:
            continue
        total_weights += 0.5
        pref_tokens = set(tokenize(pref_norm))

        is_match = False
        if pref_norm in full_candidate_corpus or any(pref_norm in item for item in expanded_candidate):
            is_match = True
        elif pref_tokens and len(pref_tokens.intersection(candidate_tokens)) >= 1:
            is_match = True

        if is_match:
            if pref not in matched_skills:
                matched_skills.append(pref)
            matched_weights += 0.5

    # Base skill score calculation
    if total_weights > 0:
        ratio = matched_weights / total_weights
    else:
        ratio = 0.5

    # Calibrate score to standard 40-99 range
    if ratio >= 0.95:
        score = int(round(94 + (ratio - 0.95) * 100))
    elif ratio >= 0.70:
        score = int(round(82 + (ratio - 0.70) * 48))
    elif ratio >= 0.40:
        score = int(round(68 + (ratio - 0.40) * 46))
    else:
        score = int(round(45 + ratio * 55))

    score = min(99, max(40, score))

    # Extra candidate skills not in job order
    extra_skills = [
        s for s in applicant.skills
        if not any(similarity_ratio(s, req) > 0.7 for req in requirements)
    ][:4]

    return score, matched_skills, missing_skills, extra_skills


def extract_experience_fit(applicant: ApplicantData, job: JobOrderData) -> Tuple[int, float, str]:
    """
    Compute candidate relevant experience tenure, role alignment, and score (0-100).
    """
    total_years = 0.0
    relevant_roles_count = 0
    job_title_tokens = set(tokenize(job.title))

    work_summaries = []

    for w in applicant.work_history:
        role = w.get("role", "")
        company = w.get("company", "")
        duration = w.get("duration", "")
        years = parse_duration_years(duration)
        total_years += years

        # Check role relevance
        role_tokens = set(tokenize(role))
        if role_tokens.intersection(job_title_tokens) or any(similarity_ratio(role, job.title) > 0.65 for _ in [1]):
            relevant_roles_count += 1
            total_years += 0.5  # Bonus for direct title relevance

        if role and company:
            work_summaries.append(f"{role} at {company} ({duration or f'{years} yrs'})")

    if total_years == 0.0 and applicant.experience_summary:
        total_years = parse_duration_years(applicant.experience_summary)

    # If no work history recorded, assign minimum baseline
    if total_years == 0.0:
        total_years = 1.0

    min_required = max(1.0, job.min_exp_years)
    tenure_ratio = total_years / min_required

    # Calculate experience score
    if tenure_ratio >= 1.5:
        score = min(98, int(round(90 + min(8, (tenure_ratio - 1.5) * 5))))
    elif tenure_ratio >= 1.0:
        score = int(round(82 + (tenure_ratio - 1.0) * 16))
    elif tenure_ratio >= 0.6:
        score = int(round(70 + (tenure_ratio - 0.6) * 30))
    else:
        score = int(round(50 + tenure_ratio * 33))

    score = min(98, max(45, score))
    formatted_work = "; ".join(work_summaries[:2]) if work_summaries else "Entry-level talent with relevant vocational background."

    return score, round(total_years, 1), formatted_work


def extract_location_fit(applicant: ApplicantData, job: JobOrderData) -> int:
    """
    Compute geographic and proximity alignment score (0-100).
    """
    job_loc = normalize_text(job.location or "Metro Manila")
    app_city = normalize_text(applicant.city_address or "")
    app_prov = normalize_text(applicant.provincial_address or "")
    app_combined = f"{app_city} {app_prov}".strip()

    if not app_combined or not job_loc:
        return 85  # Neutral default

    # Direct city or province substring match
    if job_loc in app_combined or any(part in job_loc for part in app_city.split()):
        return 96

    # Cluster / region match
    for region, locations in REGION_CLUSTERS.items():
        job_in_region = any(loc in job_loc for loc in locations)
        app_in_region = any(loc in app_combined for loc in locations)

        if job_in_region and app_in_region:
            return 92

    return 75  # Different region / requires relocation


def extract_certifications_fit(applicant: ApplicantData) -> Tuple[int, List[str]]:
    """
    Compute pre-employment statutory readiness and professional certifications score (0-100).
    """
    verified = []
    score_points = 60  # Base score

    # Check documents
    doc_names = [normalize_text(d.get("name", "")) for d in applicant.documents]
    full_docs_str = " ".join(doc_names)

    if any(k in full_docs_str for k in ["tesda", "nc ii", "nc 2", "certificate"]):
        verified.append("TESDA NC II Certified")
        score_points += 15

    if any(k in full_docs_str for k in ["medical", "fit to work", "health"]):
        verified.append("Class A Medical Fit-to-Work")
        score_points += 10
    else:
        verified.append("Pre-Employment Medical Ready")

    if any(k in full_docs_str for k in ["nbi", "police"]):
        verified.append("NBI Cleared")
        score_points += 10
    else:
        verified.append("NBI Clearance in Progress")

    # Statutory numbers
    if applicant.statutory_numbers:
        has_sss = bool(applicant.statutory_numbers.get("sss"))
        has_tin = bool(applicant.statutory_numbers.get("tin"))
        if has_sss and has_tin:
            verified.append("Statutory IDs Complete (SSS/TIN)")
            score_points += 5

    return min(99, score_points), verified[:4]
