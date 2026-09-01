"""
Comprehensive unit tests for the Python AI Scoring & Ranking Engine.
"""

import unittest
from ai_engine.models import (
    ApplicantData,
    JobOrderData,
    ScoringWeights,
    ScoreBreakdown,
)
from ai_engine.nlp import (
    normalize_text,
    tokenize,
    similarity_ratio,
    expand_with_synonyms,
)
from ai_engine.feature_extractor import (
    parse_duration_years,
    extract_skills_fit,
    extract_experience_fit,
    extract_location_fit,
    extract_certifications_fit,
)
from ai_engine.scorer import CandidateScorer
from ai_engine.ranker import CandidateRanker
from ai_engine.explainer import generate_recommendation_narrative


class TestNLPUtiities(unittest.TestCase):
    def test_normalize_text(self):
        raw = "  Customer Support & Inbound Calling / NCR!  "
        expected = "customer support & inbound calling / ncr"
        self.assertEqual(normalize_text(raw), expected)

    def test_tokenize_filters_stopwords(self):
        tokens = tokenize("Looking for a skilled barista in Manila")
        self.assertIn("barista", tokens)
        self.assertIn("manila", tokens)
        self.assertNotIn("for", tokens)
        self.assertNotIn("a", tokens)

    def test_synonym_expansion(self):
        expanded = expand_with_synonyms(["Opera PMS"])
        self.assertTrue(any("front office" in syn or "hotel" in syn for syn in expanded))

    def test_similarity_ratio(self):
        self.assertGreater(similarity_ratio("Cashiering", "Cashier"), 0.8)
        self.assertEqual(similarity_ratio("Warehouse", "Warehouse"), 1.0)
        self.assertLess(similarity_ratio("Welder", "Barista"), 0.4)


class TestFeatureExtractors(unittest.TestCase):
    def test_parse_duration_years(self):
        self.assertEqual(parse_duration_years("2.5 Years"), 2.5)
        self.assertEqual(parse_duration_years("18 Months"), 1.5)
        self.assertEqual(parse_duration_years("2021 – 2024"), 3.0)

    def test_skills_fit_high_match(self):
        app = ApplicantData(
            id=1,
            reg_id="APP-001",
            name="Test User",
            skills=["Opera PMS", "Guest Check-in", "POS Terminal", "English Communication"],
            work_history=[{"role": "Front Desk Receptionist", "company": "Hotel XYZ", "duration": "2 Years"}],
        )
        job = JobOrderData(
            id=1,
            ref="JO-001",
            client="Resort",
            title="Front Desk Associate",
            required_skills=["Opera PMS", "Guest Check-in", "POS Terminal"],
        )
        score, matched, missing, extra = extract_skills_fit(app, job)
        self.assertGreaterEqual(score, 90)
        self.assertEqual(len(missing), 0)
        self.assertIn("Opera PMS", matched)

    def test_skills_fit_low_match(self):
        app = ApplicantData(
            id=2,
            reg_id="APP-002",
            name="Welder Candidate",
            skills=["SMAW Welding", "Metal Fabrication"],
            work_history=[{"role": "Structural Welder", "company": "Steel Corp", "duration": "3 Years"}],
        )
        job = JobOrderData(
            id=1,
            ref="JO-001",
            client="Resort",
            title="Front Desk Associate",
            required_skills=["Opera PMS", "Guest Check-in", "POS Terminal"],
        )
        score, matched, missing, extra = extract_skills_fit(app, job)
        self.assertLess(score, 65)
        self.assertGreaterEqual(len(missing), 2)

    def test_location_fit_region_match(self):
        app = ApplicantData(
            id=3,
            reg_id="APP-003",
            name="Manila Candidate",
            city_address="Taguig City, Metro Manila",
        )
        job = JobOrderData(
            id=2,
            ref="JO-002",
            client="BPO Client",
            title="Customer Service Representative",
            location="Bonifacio Global City, Taguig",
        )
        score = extract_location_fit(app, job)
        self.assertGreaterEqual(score, 90)


class TestCandidateScorerAndRanker(unittest.TestCase):
    def setUp(self):
        self.job = JobOrderData(
            id=10,
            ref="JO-101",
            client="Apex Logistics",
            title="Warehouse Inventory Specialist",
            location="Calamba, Laguna",
            min_exp_years=2.0,
            required_skills=["Warehouse Management", "Inventory Stock Count", "Forklift Operation"],
            preferred_skills=["TESDA NC II", "Safety Protocol"],
        )

        self.candidate_strong = ApplicantData(
            id=101,
            reg_id="APP-101",
            name="Juan Dela Cruz",
            skills=["Warehouse Management", "Inventory Stock Count", "Forklift Operation", "TESDA NC II"],
            work_history=[
                {"role": "Warehouse Associate", "company": "ABC Logistics", "duration": "3 Years"}
            ],
            city_address="Calamba, Laguna",
            documents=[
                {"name": "TESDA Heavy Equipment NC II"},
                {"name": "Medical Fit-to-Work Clearance"},
                {"name": "NBI Clearance"},
            ],
        )

        self.candidate_moderate = ApplicantData(
            id=102,
            reg_id="APP-102",
            name="Pedro Penduko",
            skills=["Inventory Stock Count", "Data Entry"],
            work_history=[
                {"role": "Store Clerk", "company": "Supermarket", "duration": "1 Year"}
            ],
            city_address="Santa Rosa, Laguna",
            documents=[{"name": "NBI Clearance"}],
        )

        self.candidate_weak = ApplicantData(
            id=103,
            reg_id="APP-103",
            name="Maria Clara",
            skills=["Cashiering", "Customer Service"],
            work_history=[{"role": "Cashier", "company": "Retail Store", "duration": "6 Months"}],
            city_address="Quezon City, Metro Manila",
            documents=[],
        )

    def test_scorer_evaluation(self):
        scorer = CandidateScorer()
        res_strong = scorer.evaluate_candidate(self.candidate_strong, self.job)
        res_weak = scorer.evaluate_candidate(self.candidate_weak, self.job)

        self.assertGreaterEqual(res_strong["overall_score"], 85)
        self.assertLess(res_weak["overall_score"], 70)
        self.assertIn("Warehouse Management", res_strong["matched_skills"])

    def test_ranker_ordering(self):
        ranker = CandidateRanker()
        applicants = [self.candidate_weak, self.candidate_strong, self.candidate_moderate]
        ranking_result = ranker.rank_candidates_for_job(applicants, self.job)

        candidates = ranking_result.candidates
        self.assertEqual(len(candidates), 3)
        # Strongest candidate must be rank #1
        self.assertEqual(candidates[0]["name"], "Juan Dela Cruz")
        self.assertEqual(candidates[0]["rank"], 1)
        self.assertEqual(candidates[0]["status"], "Recommended")

        # Weakest candidate must be rank #3
        self.assertEqual(candidates[2]["name"], "Maria Clara")
        self.assertEqual(candidates[2]["rank"], 3)
        self.assertEqual(candidates[2]["status"], "Under Review")

    def test_custom_weights_calibration(self):
        custom_weights = ScoringWeights(skills=0.70, experience=0.10, location=0.10, certifications=0.10)
        ranker = CandidateRanker(custom_weights)
        res = ranker.rank_candidates_for_job([self.candidate_strong], self.job)
        self.assertGreaterEqual(res.candidates[0]["matchScore"], 85)


if __name__ == "__main__":
    unittest.main()
