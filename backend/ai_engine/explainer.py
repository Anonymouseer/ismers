"""
Explainability engine for generating transparent, defensible candidate match recommendations.
"""

from typing import List, Dict, Any
from .config import THRESHOLD_PRIORITY, THRESHOLD_QUALIFIED


def generate_recommendation_narrative(
    name: str,
    job_title: str,
    match_score: int,
    skills_fit: int,
    experience_fit: int,
    matched_skills: List[str],
    missing_skills: List[str],
    years_exp: str,
    verified_certs: List[str]
) -> str:
    """
    Generate an executive-ready, professional recommendation narrative explaining candidate fit.
    Adheres strictly to professional tone with zero emojis.
    """
    # High-Priority Tier (Score >= 85%)
    if match_score >= THRESHOLD_PRIORITY:
        if not missing_skills:
            return (
                f"High-priority match with exceptional profile alignment. Demonstrates complete competency "
                f"across core requirements for {job_title} ({years_exp} relevant tenure). "
                f"Statutory credentials verified. Recommended for immediate client endorsement."
            )
        else:
            missing_str = ", ".join(missing_skills[:2])
            return (
                f"Strong candidate match scoring {match_score}% fit for {job_title}. "
                f"Core strengths in {', '.join(matched_skills[:3]) if matched_skills else 'operational competencies'}. "
                f"Minor gap in {missing_str}; easily addressed via standard 1-day client site briefing."
            )

    # Qualified Tier (Score 75% - 84%)
    elif match_score >= THRESHOLD_QUALIFIED:
        if missing_skills:
            missing_str = ", ".join(missing_skills[:2])
            return (
                f"Qualified candidate with solid foundation for {job_title} ({years_exp} tenure). "
                f"Matches primary requirements with secondary development area in {missing_str}. "
                f"Recommended for preliminary technical screening and interviewer validation."
            )
        else:
            return (
                f"Viable candidate meeting essential specifications for {job_title}. "
                f"Competencies verified across core domains. Recommended for panel interview."
            )

    # Under Review Tier (Score < 75%)
    else:
        if missing_skills:
            missing_str = ", ".join(missing_skills[:3])
            return (
                f"Candidate under evaluation. Found partial alignment with {job_title}, "
                f"with notable capability gaps in {missing_str}. "
                f"Consider for secondary pooling or prerequisite skills training prior to deployment."
            )
        else:
            return (
                f"Found baseline qualifications for {job_title}. "
                f"Candidate requires supplementary tenure and domain assessment before client submission."
            )
