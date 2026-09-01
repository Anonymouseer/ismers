"""
Data structures and schema definitions for candidate scoring and ranking.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional


@dataclass
class ScoringWeights:
    skills: float = 0.45
    experience: float = 0.35
    location: float = 0.15
    certifications: float = 0.05

    def normalize(self) -> "ScoringWeights":
        total = self.skills + self.experience + self.location + self.certifications
        if total <= 0:
            return ScoringWeights()
        return ScoringWeights(
            skills=round(self.skills / total, 4),
            experience=round(self.experience / total, 4),
            location=round(self.location / total, 4),
            certifications=round(self.certifications / total, 4),
        )


@dataclass
class ScoreBreakdown:
    skills_fit: int
    experience_fit: int
    location_fit: int
    certifications_fit: int
    overall_score: int

    def to_dict(self) -> Dict[str, int]:
        return asdict(self)


@dataclass
class WorkHistoryItem:
    role: str = ""
    company: str = ""
    duration: str = ""
    years: float = 0.0


@dataclass
class EducationItem:
    level: str = ""
    school: str = ""
    degree: str = ""
    years: str = ""


@dataclass
class DocumentItem:
    name: str = ""
    file_name: str = ""
    verified: bool = True


@dataclass
class ApplicantData:
    id: Any
    reg_id: str
    name: str
    skills: List[str] = field(default_factory=list)
    work_history: List[Dict[str, Any]] = field(default_factory=list)
    education: List[Dict[str, Any]] = field(default_factory=list)
    city_address: str = ""
    provincial_address: str = ""
    documents: List[Dict[str, Any]] = field(default_factory=list)
    experience_summary: str = ""
    category: str = ""
    target_job_id: Optional[str] = None
    statutory_numbers: Optional[Dict[str, str]] = None
    pre_employment_checklist: Optional[Dict[str, bool]] = None


@dataclass
class JobOrderData:
    id: Any
    ref: str
    client: str
    title: str
    category: str = ""
    headcount: int = 1
    filled: int = 0
    location: str = "Metro Manila, NCR"
    rate: str = "P610.00 / Day"
    min_exp_years: float = 1.0
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    description: str = ""


@dataclass
class ScoredCandidate:
    rank: int
    id: str
    reg_id: str
    name: str
    match_score: int
    breakdown: Dict[str, int]
    skills_fit: int
    experience_fit: int
    location_fit: int
    years_exp: str
    matched_skills: List[str]
    missing_skills: List[str]
    extra_skills: List[str]
    verified_certifications: List[str]
    work_history: str
    ai_recommendation: str
    status: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rank": self.rank,
            "id": self.id,
            "regId": self.reg_id,
            "name": self.name,
            "matchScore": self.match_score,
            "breakdown": self.breakdown,
            "skillsFit": self.skills_fit,
            "experienceFit": self.experience_fit,
            "locationFit": self.location_fit,
            "yearsExp": self.years_exp,
            "matchedSkills": self.matched_skills,
            "missingSkills": self.missing_skills,
            "extraSkills": self.extra_skills,
            "verifiedCertifications": self.verified_certifications,
            "workHistory": self.work_history,
            "aiRecommendation": self.ai_recommendation,
            "status": self.status,
        }


@dataclass
class JobRankingResult:
    client: str
    industry: str
    job_ref: str
    job_title: str
    headcount: int
    filled: int
    site: str
    min_exp: str
    salary: str
    role_overview: str
    required_skills: List[str]
    preferred_skills: List[str]
    candidates: List[Dict[str, Any]]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "client": self.client,
            "industry": self.industry,
            "jobRef": self.job_ref,
            "jobTitle": self.job_title,
            "headcount": self.headcount,
            "filled": self.filled,
            "site": self.site,
            "minExp": self.min_exp,
            "salary": self.salary,
            "roleOverview": self.role_overview,
            "requiredSkills": self.required_skills,
            "preferredSkills": self.preferred_skills,
            "candidates": self.candidates,
        }
