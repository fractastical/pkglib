"""Database models for claims, evidence, and sources."""

from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import enum

from backend.config import DATABASE_URL

Base = declarative_base()


class EvidenceDirection(enum.Enum):
    """Direction of evidence relative to the claim."""
    FOR = "for"
    AGAINST = "against"


class EvidenceStrength(enum.Enum):
    """Strength classification of evidence."""
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"


class Claim(Base):
    """A claim or debate topic to analyze."""
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    prior_probability = Column(Float, default=0.5)  # User's prior belief
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evidence = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")


class Evidence(Base):
    """A piece of evidence for or against a claim."""
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    text = Column(Text, nullable=False)
    direction = Column(Enum(EvidenceDirection), nullable=False)
    strength = Column(Enum(EvidenceStrength), nullable=False)
    likelihood_ratio = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.5)  # Classifier confidence
    source_url = Column(String, nullable=True)
    source_title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="evidence")


class Analysis(Base):
    """Bayesian analysis results for a claim."""
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False, unique=True)
    posterior_probability = Column(Float, nullable=False)
    evidence_count = Column(Integer, default=0)
    evidence_for_count = Column(Integer, default=0)
    evidence_against_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    claim = relationship("Claim")


# Create database engine and session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize the database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

