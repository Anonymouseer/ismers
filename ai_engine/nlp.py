"""
NLP text preprocessing, domain synonyms, token matching, and string similarity utilities.
"""

import re
import math
from typing import List, Set, Dict, Tuple


# Domain synonym dictionaries mapping normalized terms to semantic clusters
SYNONYM_CLUSTERS: List[Set[str]] = [
    {"opera pms", "hotel pms", "front office system", "pms system", "hotel front office"},
    {"pos", "pos terminal", "point of sale", "cashiering", "cashier", "cash handling", "cash register"},
    {"tesda", "tesda certified", "nc ii", "nc 2", "national certificate ii", "national certificate"},
    {"customer service", "csr", "call center", "customer support", "client assistance", "guest services"},
    {"housekeeping", "room attendant", "janitorial", "sanitation", "floor care", "linen management"},
    {"barista", "espresso machine", "coffee preparation", "latte art", "beverage crafting"},
    {"food and beverage", "f&b", "food handling", "dining service", "waitstaff", "service crew"},
    {"forklift", "forklift operator", "reach truck", "material handling", "heavy equipment"},
    {"warehouse", "inventory management", "stock replenishment", "dispatch", "logistics", "order picking"},
    {"security", "cctv", "patrol", "access control", "physical security", "guarding"},
    {"data entry", "administrative", "ms excel", "spreadsheet", "clerical", "office management"},
    {"medical fit to work", "fit to work", "medical clearance", "class a medical", "health certificate"},
    {"nbi clearance", "nbi", "police clearance", "statutory clearance", "background cleared"},
    {"first aid", "cpr", "bls", "basic life support", "occupational safety", "dole osh", "bosh"},
    {"welding", "smaw", "gmaw", "tig welding", "mig welding", "fabrication"},
    {"driver", "professional driver license", "delivery driver", "dispatch driver", "lto restriction"},
]

# Common English and Tagalog stopwords to ignore in token matching
STOPWORDS: Set[str] = {
    "a", "an", "the", "and", "or", "of", "to", "in", "for", "with", "on", "at",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "ng", "mga", "sa", "at", "na", "ang", "para", "kay", "ni", "si", "may",
    "nang", "kung", "o", "ito", "iyon", "dito", "doon"
}


def normalize_text(text: str) -> str:
    """Lowercase and clean string."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'[^\w\s\+\#\.\/\&\-]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def tokenize(text: str) -> List[str]:
    """Extract filtered word tokens."""
    cleaned = normalize_text(text)
    words = re.split(r'[\s·,-\/()]+', cleaned)
    return [w for w in words if len(w) > 1 and w not in STOPWORDS]


def extract_ngrams(tokens: List[str], n: int = 2) -> List[str]:
    """Generate n-grams from a list of tokens."""
    if len(tokens) < n:
        return []
    return [" ".join(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]


def expand_with_synonyms(terms: List[str]) -> Set[str]:
    """Expand a list of terms with synonymous phrases."""
    expanded = set()
    for term in terms:
        norm = normalize_text(term)
        if norm:
            expanded.add(norm)
            for cluster in SYNONYM_CLUSTERS:
                if any(syn in norm or norm in syn for syn in cluster):
                    expanded.update(cluster)
    return expanded


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def similarity_ratio(s1: str, s2: str) -> float:
    """Compute string similarity ratio between 0.0 and 1.0."""
    n1, n2 = normalize_text(s1), normalize_text(s2)
    if not n1 or not n2:
        return 0.0
    if n1 == n2:
        return 1.0
    if n1 in n2 or n2 in n1:
        return 0.90
    max_len = max(len(n1), len(n2))
    dist = levenshtein_distance(n1, n2)
    return max(0.0, 1.0 - (dist / max_len))


def token_overlap_score(query_tokens: List[str], target_tokens: List[str]) -> float:
    """Compute Jaccard token overlap between query and target tokens."""
    q_set = set(query_tokens)
    t_set = set(target_tokens)
    if not q_set or not t_set:
        return 0.0
    intersection = q_set.intersection(t_set)
    return len(intersection) / len(q_set)
