# Debate Evidence Analyzer

A web application that extracts, analyzes, and visualizes evidence for historical or contemporary debate claims using Bayesian probability calculations.

## Features

- **Evidence Extraction**: Extract evidence from web URLs or add manually
- **Automatic Classification**: NLP-based classification of evidence as supporting or opposing
- **Bayesian Analysis**: Calculate cumulative probability using Bayesian inference with configurable priors
- **Visual Analytics**: Interactive charts showing how probability evolves with each piece of evidence
- **Elegant UI**: Modern, responsive interface with color-coded evidence and probability visualizations

## Architecture

- **Backend**: Python/FastAPI with SQLite database
- **Frontend**: React/TypeScript with Tailwind CSS
- **Evidence Processing**: Web scraping, NLP classification, Bayesian calculations

## Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the API server:
```bash
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Create a Claim**: Enter a claim statement (e.g., "Hitler had only one testicle") and set your prior probability
2. **Add Evidence**: 
   - Manually enter evidence text with optional source information
   - Or provide a URL to automatically extract evidence
3. **View Analysis**: See the Bayesian probability calculation update in real-time as you add evidence
4. **Explore**: View the probability evolution chart and evidence breakdown

## Bayesian Model

The system uses Bayesian inference to update probabilities:

- **Prior Probability**: Your initial belief (default: 50%)
- **Likelihood Ratio**: LR = P(E|H) / P(E|¬H) for each piece of evidence
- **Posterior Probability**: Updated belief after considering evidence
- **Cumulative Updates**: Each new piece of evidence updates the posterior, which becomes the new prior

## API Endpoints

- `POST /claims` - Create a new claim
- `GET /claims` - List all claims
- `GET /claims/{id}` - Get a claim with evidence
- `POST /claims/{id}/evidence` - Add evidence manually
- `POST /claims/{id}/evidence/from-url` - Extract evidence from URL
- `GET /claims/{id}/analysis` - Get Bayesian analysis
- `DELETE /claims/{id}` - Delete a claim
- `DELETE /evidence/{id}` - Delete evidence

## Configuration

Set environment variables for optional features:

- `SEARCH_API_KEY` - API key for web search (optional)
- `SEARCH_ENGINE_ID` - Search engine ID (optional)
- `DATABASE_URL` - Database connection string (default: SQLite)
- `API_HOST` - API host (default: 0.0.0.0)
- `API_PORT` - API port (default: 8000)
- `CORS_ORIGINS` - CORS allowed origins (default: http://localhost:3000)

## Example

Try analyzing the claim: "Hitler had only one testicle"

1. Create the claim with a neutral prior (50%)
2. Add evidence from various sources
3. Watch the Bayesian probability update as evidence accumulates
4. See how supporting vs. opposing evidence affects the final probability
