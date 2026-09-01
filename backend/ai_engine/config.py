"""
Scoring configuration, default weights, and threshold constants.
"""

# Default multi-factor evaluation weights (sum = 1.0)
DEFAULT_WEIGHTS = {
    "skills": 0.45,         # Skill matrix alignment & keyword overlap
    "experience": 0.35,     # Work history relevance, role matching & tenure
    "location": 0.15,       # Proximity, city/region match & shift compatibility
    "certifications": 0.05, # Verified credentials (TESDA NC II, PRC, NBI, Fit-to-Work)
}

# Candidate match classification thresholds
THRESHOLD_PRIORITY = 85.0   # Priority Shortlist / High-Priority Match
THRESHOLD_QUALIFIED = 75.0  # Qualified / Recommended Match
THRESHOLD_REVIEW = 60.0     # Under Review / Conditional Match

# Status labels
STATUS_PRIORITY = "Recommended"
STATUS_QUALIFIED = "Qualified"
STATUS_EVALUATING = "Under Review"

# Major Philippine regions and urban centers for proximity matching
REGION_CLUSTERS = {
    "ncr": ["metro manila", "manila", "quezon city", "taguig", "makati", "pasig", "mandaluyong", "paranaque", "pasay", "las pinas", "muntinlupa", "marikina", "caloocan", "malabon", "navotas", "valenzuela", "san juan", "pateros", "bgc", "ortigas", "alabang"],
    "calabarzon": ["cavite", "laguna", "batangas", "rizal", "quezon", "calamba", "santa rosa", "binan", "dasmarinas", "imus", "bacoor", "lipa", "antipolo", "carmona", "silang"],
    "central_luzon": ["pampanga", "bulacan", "bataan", "zambales", "tarlac", "nueva ecija", "clark", "angeles", "subic", "san fernando", "malolos", "meycauayan"],
    "western_visayas": ["aklan", "boracay", "iloilo", "bacolod", "negros occidental", "capiz", "antique", "guimaras"],
    "central_visayas": ["cebu", "cebu city", "mandaue", "lapu-lapu", "bohol", "tagbilaran", "negros oriental", "dumaguete"],
    "davao_region": ["davao", "davao city", "davao del sur", "tagum", "panabo", "digos"],
    "northern_mindanao": ["cagayan de oro", "misamis oriental", "bukidnon", "iligan"],
}
