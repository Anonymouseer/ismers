"""
Lightweight REST API microservice for Python Candidate Scoring & Ranking Engine.
Runs with zero external dependencies using Python's standard library http.server.
"""

import sys
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any

from .models import ScoringWeights
from .ranker import CandidateRanker
from .cli import parse_applicant, parse_job_order


class ScoringRequestHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Scoring API endpoints."""

    def _set_headers(self, status_code: int = 200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            self._set_headers(200)
            response = {
                "status": "healthy",
                "service": "PRIMEPOWER Python AI Scoring & Ranking Engine",
                "version": "1.0.0",
                "runtime": f"Python {sys.version.split()[0]}",
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        if self.path == "/evaluate":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Empty request body"}).encode("utf-8"))
                return

            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body.decode("utf-8"))
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": f"Invalid JSON payload: {str(e)}"}).encode("utf-8"))
                return

            try:
                weights_dict = payload.get("weights")
                weights = ScoringWeights(**weights_dict) if weights_dict else None
                ranker = CandidateRanker(weights)

                raw_applicants = payload.get("applicants", [])
                raw_jobs = payload.get("job_orders") or payload.get("jobOrders", [])

                applicants = [parse_applicant(a) for a in raw_applicants]
                job_orders = [parse_job_order(j) for j in raw_jobs]

                ranked_reqs = ranker.rank_all_requisitions(applicants, job_orders)

                response = {
                    "requisitions": ranked_reqs,
                    "totalRequisitions": len(ranked_reqs),
                    "totalCandidatesScored": len(applicants),
                    "engine": "Python 3.11 Scoring & Ranking Microservice",
                }

                self._set_headers(200)
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": f"Scoring execution error: {str(e)}"}).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def log_message(self, format, *args):
        # Keep logs professional
        sys.stderr.write(f"[AI-Engine] {self.address_string()} - {format % args}\n")


def run_server(host: str = "127.0.0.1", port: int = 8001):
    server_address = (host, port)
    httpd = HTTPServer(server_address, ScoringRequestHandler)
    print(f"PRIMEPOWER AI Scoring Engine running on http://{host}:{port}", file=sys.stderr)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down AI Scoring Engine...", file=sys.stderr)
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start Python Scoring & Ranking REST Microservice")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface")
    parser.add_argument("--port", type=int, default=8001, help="Port number")
    args = parser.parse_args()
    run_server(host=args.host, port=args.port)
