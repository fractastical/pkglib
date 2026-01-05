"""FastAPI application with endpoints for debate evidence analysis."""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from backend.models.database import (
    Claim, Evidence, Analysis, get_db, init_db,
    EvidenceDirection, EvidenceStrength
)
from backend.services.evidence_extractor import EvidenceExtractor
from backend.services.classifier import EvidenceClassifier
from backend.services.bayesian_calculator import BayesianCalculator
from backend.config import DEFAULT_PRIOR, CORS_ORIGINS

# Initialize database
init_db()

app = FastAPI(title="Debate Evidence Analyzer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response
class ClaimCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    prior_probability: Optional[float] = Field(default=DEFAULT_PRIOR, ge=0.0, le=1.0)


class EvidenceCreate(BaseModel):
    text: str = Field(..., min_length=1)
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    direction: Optional[EvidenceDirection] = None  # If provided, skip classification
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    strength: Optional[EvidenceStrength] = None


class EvidenceFromURL(BaseModel):
    url: str


class EvidenceResponse(BaseModel):
    id: int
    text: str
    direction: str
    strength: str
    likelihood_ratio: float
    confidence_score: float
    source_url: Optional[str]
    source_title: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ClaimResponse(BaseModel):
    id: int
    text: str
    prior_probability: float
    created_at: datetime
    updated_at: datetime
    evidence: List[EvidenceResponse] = []

    class Config:
        from_attributes = True


class AnalysisResponse(BaseModel):
    posterior_probability: float
    prior_probability: float
    evidence_count: int
    evidence_for_count: int
    evidence_against_count: int
    probability_history: List[dict]


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Debate Evidence Analyzer API", "version": "1.0.0"}


@app.post("/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(claim_data: ClaimCreate, db: Session = Depends(get_db)):
    """Create a new claim/debate."""
    claim = Claim(
        text=claim_data.text,
        prior_probability=claim_data.prior_probability
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@app.get("/claims/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: int, db: Session = Depends(get_db)):
    """Get a claim with all its evidence."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


@app.get("/claims", response_model=List[ClaimResponse])
def list_claims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all claims."""
    claims = db.query(Claim).offset(skip).limit(limit).all()
    return claims


@app.post("/claims/{claim_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def add_evidence(
    claim_id: int,
    evidence_data: EvidenceCreate,
    db: Session = Depends(get_db)
):
    """Add evidence to a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Classify evidence if direction not provided
    if evidence_data.direction is None:
        direction, confidence, strength = EvidenceClassifier.classify(
            claim.text,
            evidence_data.text,
            evidence_data.source_title
        )
    else:
        direction = evidence_data.direction
        confidence = evidence_data.confidence or 0.5
        strength = evidence_data.strength or EvidenceStrength.MODERATE
    
    # Calculate likelihood ratio
    lr = BayesianCalculator.calculate_likelihood_ratio(direction, confidence, strength)
    
    # Create evidence
    evidence = Evidence(
        claim_id=claim_id,
        text=evidence_data.text,
        direction=direction,
        strength=strength,
        likelihood_ratio=lr,
        confidence_score=confidence,
        source_url=evidence_data.source_url,
        source_title=evidence_data.source_title
    )
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    # Update analysis
    update_analysis(claim_id, db)
    
    return evidence


@app.post("/claims/{claim_id}/evidence/from-url", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def add_evidence_from_url(
    claim_id: int,
    url_data: EvidenceFromURL,
    db: Session = Depends(get_db)
):
    """Extract and add evidence from a URL."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Extract evidence from URL
    extracted = EvidenceExtractor.extract_evidence_from_url(url_data.url)
    if not extracted:
        raise HTTPException(status_code=400, detail="Could not extract evidence from URL")
    
    # Classify evidence
    direction, confidence, strength = EvidenceClassifier.classify(
        claim.text,
        extracted["text"],
        extracted["title"]
    )
    
    # Calculate likelihood ratio
    lr = BayesianCalculator.calculate_likelihood_ratio(direction, confidence, strength)
    
    # Create evidence
    evidence = Evidence(
        claim_id=claim_id,
        text=extracted["text"],
        direction=direction,
        strength=strength,
        likelihood_ratio=lr,
        confidence_score=confidence,
        source_url=extracted["url"],
        source_title=extracted["title"]
    )
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    # Update analysis
    update_analysis(claim_id, db)
    
    return evidence


@app.get("/claims/{claim_id}/analysis", response_model=AnalysisResponse)
def get_analysis(claim_id: int, db: Session = Depends(get_db)):
    """Get Bayesian analysis for a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Get all evidence
    evidence_list = db.query(Evidence).filter(Evidence.claim_id == claim_id).order_by(Evidence.created_at).all()
    
    # Calculate cumulative posterior
    analysis = BayesianCalculator.calculate_cumulative_posterior(
        claim.prior_probability,
        evidence_list
    )
    
    return analysis


def update_analysis(claim_id: int, db: Session):
    """Update or create analysis record for a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        return
    
    evidence_list = db.query(Evidence).filter(Evidence.claim_id == claim_id).order_by(Evidence.created_at).all()
    
    analysis_result = BayesianCalculator.calculate_cumulative_posterior(
        claim.prior_probability,
        evidence_list
    )
    
    # Update or create analysis record
    analysis = db.query(Analysis).filter(Analysis.claim_id == claim_id).first()
    if analysis:
        analysis.posterior_probability = analysis_result["posterior_probability"]
        analysis.evidence_count = analysis_result["evidence_count"]
        analysis.evidence_for_count = analysis_result["evidence_for_count"]
        analysis.evidence_against_count = analysis_result["evidence_against_count"]
    else:
        analysis = Analysis(
            claim_id=claim_id,
            posterior_probability=analysis_result["posterior_probability"],
            evidence_count=analysis_result["evidence_count"],
            evidence_for_count=analysis_result["evidence_for_count"],
            evidence_against_count=analysis_result["evidence_against_count"]
        )
        db.add(analysis)
    
    db.commit()


@app.delete("/claims/{claim_id}")
def delete_claim(claim_id: int, db: Session = Depends(get_db)):
    """Delete a claim and all its evidence."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    db.delete(claim)
    db.commit()
    return {"message": "Claim deleted"}


@app.delete("/evidence/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    """Delete a piece of evidence."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    claim_id = evidence.claim_id
    db.delete(evidence)
    db.commit()
    
    # Update analysis
    update_analysis(claim_id, db)
    
    return {"message": "Evidence deleted"}

