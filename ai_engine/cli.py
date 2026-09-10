"""
Command-line interface for the Python AI Scoring & Ranking Engine.
Supports execution via stdin/stdout pipe (used by Laravel sub-process) or file arguments.
"""

import sys
import json
import argparse
from typing import Dict, Any, List

# Ensure standard streams use UTF-8 across all operating systems
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stdin, "reconfigure"):
    try:
        sys.stdin.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .models import ApplicantData, JobOrderData, ScoringWeights
from .ranker import CandidateRanker
from .scorer import CandidateScorer


def parse_applicant(d: Dict[str, Any]) -> ApplicantData:
    return ApplicantData(
        id=d.get("id", ""),
        reg_id=d.get("reg_id") or d.get("regId") or f"APP-{d.get('id', '')}",
        name=d.get("name") or f"{d.get('first_name', '')} {d.get('last_name', '')}".strip() or "Applicant",
        skills=d.get("skills", []),
        work_history=d.get("work_history") or d.get("workHistory") or [],
        education=d.get("education", []),
        city_address=d.get("city_address") or d.get("cityAddress") or d.get("location", ""),
        provincial_address=d.get("provincial_address") or d.get("provincialAddress", ""),
        documents=d.get("documents", []),
        experience_summary=d.get("experience_summary") or d.get("experienceSummary", ""),
        category=d.get("category", ""),
        target_job_id=d.get("target_job_id") or d.get("targetJobId"),
        statutory_numbers=d.get("statutory_numbers") or d.get("statutoryNumbers"),
        pre_employment_checklist=d.get("pre_employment_checklist") or d.get("preEmploymentChecklist"),
    )


def parse_job_order(d: Dict[str, Any]) -> JobOrderData:
    min_exp = 1.0
    if "min_exp_years" in d:
        try:
            min_exp = float(d["min_exp_years"])
        except (ValueError, TypeError):
            min_exp = 1.0

    return JobOrderData(
        id=d.get("id", ""),
        ref=d.get("ref") or d.get("jobRef") or f"JO-{d.get('id', '')}",
        client=d.get("client") or d.get("client_name") or "PRIMEPOWER Client",
        title=d.get("title") or d.get("jobTitle") or "General Staff",
        category=d.get("category") or d.get("industry") or "Operations",
        headcount=int(d.get("headcount") or d.get("total") or 1),
        filled=int(d.get("filled") or 0),
        location=d.get("location") or d.get("site") or "Metro Manila, NCR",
        rate=d.get("rate") or d.get("salary") or "P610.00 / Day",
        min_exp_years=min_exp,
        required_skills=d.get("required_skills") or d.get("requirements") or [],
        preferred_skills=d.get("preferred_skills") or [],
        tags=d.get("tags") or [],
        description=d.get("description") or d.get("role_overview") or "",
    )


def run_self_test() -> int:
    """Run a quick built-in test evaluation."""
    print("Running AI Scoring Engine self-test...", file=sys.stderr)

    sample_applicant = ApplicantData(
        id=101,
        reg_id="APP-2026-001",
        name="Angeline Cortez",
        skills=["Opera PMS", "Guest Check-in", "POS Terminal", "Bilingual English", "Customer Service"],
        work_history=[
            {"role": "Front Desk Receptionist", "company": "Boracay Uptown Hotel", "duration": "2 Years"},
            {"role": "Guest Services Officer", "company": "City Garden Suites", "duration": "1.5 Years"},
        ],
        city_address="Station 1, Boracay, Aklan",
        documents=[
            {"name": "TESDA Front Office NC II Certificate"},
            {"name": "Class A Medical Fit-to-Work Clearance"},
            {"name": "NBI Clearance"},
        ],
    )

    sample_job = JobOrderData(
        id=1,
        ref="JO-001",
        client="Sunrise Hospitality Group",
        title="Front Desk Associate",
        location="Boracay, Aklan",
        min_exp_years=2.0,
        required_skills=["Opera PMS", "Guest Check-in", "POS Terminal", "Front Desk Concierge"],
        preferred_skills=["TESDA NC II", "Night Audit"],
    )

    ranker = CandidateRanker()
    result = ranker.rank_candidates_for_job([sample_applicant], sample_job)

    print(json.dumps(result.to_dict(), indent=2))
    assert len(result.candidates) == 1
    assert result.candidates[0]["matchScore"] >= 85
    assert result.candidates[0]["rank"] == 1
    print("Self-test completed successfully. Match Score:", result.candidates[0]["matchScore"], file=sys.stderr)
    return 0


def main():
    parser = argparse.ArgumentParser(description="PRIMEPOWER Candidate Scoring & Ranking Engine CLI")
    parser.add_argument("--test", action="store_true", help="Run internal self-test")
    parser.add_argument("--input", type=str, help="Path to input JSON file containing applicants and jobOrders")
    parser.add_argument("--output", type=str, help="Path to write output JSON")
    parser.add_argument("--mode", type=str, default="evaluate", choices=["evaluate", "single_score"], help="Execution mode")
    args = parser.parse_args()

    if args.test:
        sys.exit(run_self_test())

    # Read input payload
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        # Read from stdin
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"error": "Empty input payload"}), file=sys.stdout)
            sys.exit(1)
        payload = json.loads(raw)

    # Extract weights if provided
    weights_dict = payload.get("weights")
    weights = ScoringWeights(**weights_dict) if weights_dict else None
    ranker = CandidateRanker(weights)

    # Process payload
    raw_applicants = payload.get("applicants", [])
    raw_jobs = payload.get("job_orders") or payload.get("jobOrders", [])

    applicants = [parse_applicant(a) for a in raw_applicants]
    job_orders = [parse_job_order(j) for j in raw_jobs]

    if not job_orders and raw_applicants:
        # Single candidate scoring mode if specific job is provided
        single_job_raw = payload.get("target_job") or payload.get("targetJob")
        if single_job_raw:
            job = parse_job_order(single_job_raw)
            result = ranker.rank_candidates_for_job(applicants, job)
            output = result.to_dict()
        else:
            output = {"error": "No job order provided for evaluation"}
    else:
        ranked_reqs = ranker.rank_all_requisitions(applicants, job_orders)
        output = {
            "requisitions": ranked_reqs,
            "totalRequisitions": len(ranked_reqs),
            "totalCandidatesScored": len(applicants),
            "engine": "Python 3.11 Scoring & Ranking Engine v1.0",
        }

    output_str = json.dumps(output, ensure_ascii=False)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_str)
    else:
        sys.stdout.write(output_str)


if __name__ == "__main__":
    main()
