#!/bin/bash
# Run the backend API server

cd "$(dirname "$0")"
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

