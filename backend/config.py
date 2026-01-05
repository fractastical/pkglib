"""Configuration and priors management for the debate evidence analyzer."""

import os
from typing import Optional

# Default Bayesian prior probability (neutral starting point)
DEFAULT_PRIOR = 0.5

# Evidence strength thresholds for likelihood ratios
WEAK_EVIDENCE_LR = 1.5  # Likelihood ratio between 1.0 and 1.5
MODERATE_EVIDENCE_LR = 3.0  # Likelihood ratio between 1.5 and 3.0
STRONG_EVIDENCE_LR = 10.0  # Likelihood ratio > 10.0

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./debate_evidence.db")

# Web search API configuration (optional - can use web scraping as fallback)
SEARCH_API_KEY = os.getenv("SEARCH_API_KEY", None)
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID", None)

# API configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

