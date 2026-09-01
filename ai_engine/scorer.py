"""
Multi-factor candidate match scoring engine.
"""

from typing import Dict, Any, Tuple
from .models import ApplicantData, JobOrderData, ScoringWeights, ScoreBreakdown
from .feature_extractor import (
    extract_skills_fit,
    extract_experience_fit,
    extract_location_fit,
    extract_certifications_fit,
)


class CandidateScorer:
    """Evaluates candidate attributes against job order requirements using multi-factor weighted scoring."""

    def __init__(self, weights: ScoringWeights = None):
        self.weights = (weights or ScoringWeights()).normalize()

    def evaluate_candidate(
        self,
        applicant: ApplicantData,
        job: JobOrderData
    ) -> Dict[str, Any]:
        """
        Compute multi-factor score breakdown and extracted features for a candidate.
        """
        # 1. Skills evaluation
        skills_score, matched_skills, missing_skills, extra_skills = extract_skills_fit(applicant, job)

        # 2. Experience evaluation
        exp_score, years_num, work_summary = extract_experience_fit(applicant, job)

        # 3. Location alignment
        loc_score = extract_location_fit(applicant, job)

        # 4. Certifications & Compliance
        cert_score, verified_certs = extract_certifications_fit(applicant)

        # 5. Weighted composite score
        raw_composite = (
            (skills_score * self.weights.skills) +
            (exp_score * self.weights.experience) +
            (loc_score * self.weights.location) +
            (cert_score * self.weights.certifications)
        )
        overall_score = int(round(raw_composite))
        overall_score = min(99, max(30, overall_score))

        breakdown = ScoreBreakdown(
            skills_fit=skills_score,
            experience_fit=exp_score,
            location_fit=loc_score,
            certifications_fit=cert_score,
            overall_score=overall_score,
        )

        return {
            "breakdown": breakdown.to_dict(),
            "overall_score": overall_score,
            "skills_fit": skills_score,
            "experience_fit": exp_score,
            "location_fit": loc_score,
            "certifications_fit": cert_score,
            "years_exp": f"{years_num} Years" if years_num >= 1.0 else "Entry-Level / 1 Yr",
            "years_num": years_num,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "extra_skills": extra_skills,
            "verified_certifications": verified_certs,
            "work_history": work_summary,
        }
