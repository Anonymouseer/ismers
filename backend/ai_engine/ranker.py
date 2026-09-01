"""
Candidate ranking, status classification, and requisition result aggregation.
"""

from typing import List, Dict, Any, Optional
from .models import (
    ApplicantData,
    JobOrderData,
    ScoredCandidate,
    JobRankingResult,
    ScoringWeights,
)
from .config import THRESHOLD_PRIORITY, THRESHOLD_QUALIFIED, STATUS_PRIORITY, STATUS_QUALIFIED, STATUS_EVALUATING
from .scorer import CandidateScorer
from .explainer import generate_recommendation_narrative


class CandidateRanker:
    """Ranks and categorizes candidate applicants against job requisitions."""

    def __init__(self, weights: Optional[ScoringWeights] = None):
        self.scorer = CandidateScorer(weights)

    def rank_candidates_for_job(
        self,
        applicants: List[ApplicantData],
        job: JobOrderData,
        top_n: int = 15
    ) -> JobRankingResult:
        """
        Evaluate, rank, and format candidates for a specific Job Order requisition.
        """
        scored_list = []

        for app in applicants:
            eval_res = self.scorer.evaluate_candidate(app, job)

            # Determine candidate status
            score = eval_res["overall_score"]
            if score >= THRESHOLD_PRIORITY:
                status = STATUS_PRIORITY
            elif score >= THRESHOLD_QUALIFIED:
                status = STATUS_QUALIFIED
            else:
                status = STATUS_EVALUATING

            # Synthesize recommendation
            narrative = generate_recommendation_narrative(
                name=app.name,
                job_title=job.title,
                match_score=score,
                skills_fit=eval_res["skills_fit"],
                experience_fit=eval_res["experience_fit"],
                matched_skills=eval_res["matched_skills"],
                missing_skills=eval_res["missing_skills"],
                years_exp=eval_res["years_exp"],
                verified_certs=eval_res["verified_certifications"],
            )

            scored_list.append({
                "app": app,
                "eval": eval_res,
                "status": status,
                "narrative": narrative,
                "overall_score": score,
                "years_num": eval_res["years_num"],
                "skills_fit": eval_res["skills_fit"],
            })

        # Multi-factor sort: score desc, then experience desc, then skills fit desc
        scored_list.sort(
            key=lambda item: (
                item["overall_score"],
                item["years_num"],
                item["skills_fit"]
            ),
            reverse=True
        )

        ranked_candidates = []
        for idx, item in enumerate(scored_list[:top_n], start=1):
            app = item["app"]
            ev = item["eval"]

            cand = ScoredCandidate(
                rank=idx,
                id=f"AI-APP-{app.id}",
                reg_id=app.reg_id,
                name=app.name,
                match_score=ev["overall_score"],
                breakdown=ev["breakdown"],
                skills_fit=ev["skills_fit"],
                experience_fit=ev["experience_fit"],
                location_fit=ev["location_fit"],
                years_exp=ev["years_exp"],
                matched_skills=ev["matched_skills"],
                missing_skills=ev["missing_skills"],
                extra_skills=ev["extra_skills"],
                verified_certifications=ev["verified_certifications"],
                work_history=ev["work_history"],
                ai_recommendation=item["narrative"],
                status=item["status"],
            )
            ranked_candidates.append(cand.to_dict())

        return JobRankingResult(
            client=job.client,
            industry=job.category or "Manpower & Operations",
            job_ref=job.ref or f"JO-{job.id}",
            job_title=job.title,
            headcount=job.headcount,
            filled=job.filled,
            site=job.location or "Metro Manila, NCR",
            min_exp=f"{job.min_exp_years}+ Years Relevant Experience" if job.min_exp_years > 0 else "1+ Year Experience",
            salary=job.rate or "P610.00 / Day",
            role_overview=job.description or f"Operational requisition for {job.title} at {job.client}.",
            required_skills=job.required_skills if job.required_skills else [job.title, "Operational Reliability"],
            preferred_skills=job.preferred_skills if job.preferred_skills else ["TESDA NC II Certified", "Safety Protocol Knowledge"],
            candidates=ranked_candidates,
        )

    def rank_all_requisitions(
        self,
        applicants: List[ApplicantData],
        job_orders: List[JobOrderData],
        candidates_per_job: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Evaluate and rank candidates for all active job requisitions.
        """
        results = []
        for job in job_orders:
            res = self.rank_candidates_for_job(applicants, job, top_n=candidates_per_job)
            results.append(res.to_dict())
        return results
