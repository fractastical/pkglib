"""NLP-based classifier to determine if evidence supports or opposes a claim."""

import re
from typing import Tuple, Optional
from backend.models.database import EvidenceDirection, EvidenceStrength
from backend.services.bayesian_calculator import BayesianCalculator


class EvidenceClassifier:
    """Classify evidence as supporting or opposing a claim."""

    # Keywords that suggest supporting evidence
    SUPPORTING_KEYWORDS = [
        "confirm", "prove", "evidence", "demonstrate", "show", "indicate",
        "suggest", "support", "verify", "validate", "establish", "found",
        "discovered", "revealed", "confirmed", "proven", "true", "correct",
        "accurate", "fact", "indeed", "actually", "really", "certainly"
    ]

    # Keywords that suggest opposing evidence
    OPPOSING_KEYWORDS = [
        "refute", "disprove", "contradict", "deny", "reject", "dispute",
        "challenge", "debunk", "false", "incorrect", "wrong", "untrue",
        "myth", "rumor", "speculation", "unfounded", "baseless", "no evidence",
        "lack of evidence", "cannot confirm", "unverified", "disputed"
    ]

    # Negation words that flip the meaning
    NEGATION_WORDS = [
        "not", "no", "never", "none", "neither", "nobody", "nothing",
        "nowhere", "without", "lack", "absence", "fail", "cannot"
    ]

    @staticmethod
    def classify(
        claim: str,
        evidence_text: str,
        source_title: Optional[str] = None
    ) -> Tuple[EvidenceDirection, float, EvidenceStrength]:
        """
        Classify evidence as for or against the claim.
        
        Returns:
            Tuple of (direction, confidence_score, strength)
        """
        # Combine evidence text and source title
        full_text = f"{evidence_text} {source_title or ''}".lower()
        
        # Count supporting and opposing keyword matches
        supporting_score = 0
        opposing_score = 0
        
        # Check for supporting keywords
        for keyword in EvidenceClassifier.SUPPORTING_KEYWORDS:
            matches = len(re.findall(r'\b' + re.escape(keyword) + r'\b', full_text))
            supporting_score += matches
        
        # Check for opposing keywords
        for keyword in EvidenceClassifier.OPPOSING_KEYWORDS:
            matches = len(re.findall(r'\b' + re.escape(keyword) + r'\b', full_text))
            opposing_score += matches
        
        # Check for negation patterns that might flip meaning
        negation_count = sum(
            len(re.findall(r'\b' + re.escape(neg) + r'\b', full_text))
            for neg in EvidenceClassifier.NEGATION_WORDS
        )
        
        # Adjust scores based on negation
        if negation_count > 0:
            # Negation near supporting keywords flips to opposing
            if supporting_score > 0:
                opposing_score += negation_count * 0.5
                supporting_score *= 0.7
        
        # Determine direction
        if supporting_score > opposing_score:
            direction = EvidenceDirection.FOR
            base_confidence = min(0.9, 0.5 + (supporting_score - opposing_score) / 10.0)
        elif opposing_score > supporting_score:
            direction = EvidenceDirection.AGAINST
            base_confidence = min(0.9, 0.5 + (opposing_score - supporting_score) / 10.0)
        else:
            # Neutral - default to moderate confidence against (conservative)
            direction = EvidenceDirection.AGAINST
            base_confidence = 0.5
        
        # Adjust confidence based on text length and keyword density
        total_keywords = supporting_score + opposing_score
        text_length = len(evidence_text.split())
        
        if text_length > 0:
            keyword_density = total_keywords / text_length
            # Higher keyword density increases confidence
            confidence = min(0.95, base_confidence + keyword_density * 2)
        else:
            confidence = base_confidence
        
        # Ensure minimum confidence
        confidence = max(0.3, confidence)
        
        # Determine strength based on score difference
        score_diff = abs(supporting_score - opposing_score)
        if score_diff >= 5:
            strength = EvidenceStrength.STRONG
        elif score_diff >= 2:
            strength = EvidenceStrength.MODERATE
        else:
            strength = EvidenceStrength.WEAK
        
        return direction, confidence, strength

    @staticmethod
    def classify_with_likelihood_ratio(
        claim: str,
        evidence_text: str,
        source_title: Optional[str] = None
    ) -> Tuple[EvidenceDirection, float, EvidenceStrength, float]:
        """
        Classify evidence and calculate likelihood ratio.
        
        Returns:
            Tuple of (direction, confidence_score, strength, likelihood_ratio)
        """
        direction, confidence, strength = EvidenceClassifier.classify(
            claim, evidence_text, source_title
        )
        
        lr = BayesianCalculator.calculate_likelihood_ratio(
            direction, confidence, strength
        )
        
        return direction, confidence, strength, lr

