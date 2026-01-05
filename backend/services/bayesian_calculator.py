"""Bayesian probability calculations for evidence analysis."""

from typing import List, Dict, Optional
from backend.models.database import Evidence, EvidenceDirection, EvidenceStrength
from backend.config import (
    DEFAULT_PRIOR,
    WEAK_EVIDENCE_LR,
    MODERATE_EVIDENCE_LR,
    STRONG_EVIDENCE_LR
)


class BayesianCalculator:
    """Calculate Bayesian probabilities from evidence."""

    @staticmethod
    def calculate_likelihood_ratio(
        direction: EvidenceDirection,
        confidence: float,
        strength: Optional[EvidenceStrength] = None
    ) -> float:
        """
        Calculate likelihood ratio for a piece of evidence.
        
        LR = P(E|H) / P(E|¬H)
        
        For supporting evidence: LR > 1
        For opposing evidence: LR < 1 (we'll use 1/LR for calculation)
        """
        # Base likelihood ratio based on strength
        if strength == EvidenceStrength.STRONG:
            base_lr = 10.0
        elif strength == EvidenceStrength.MODERATE:
            base_lr = 3.0
        elif strength == EvidenceStrength.WEAK:
            base_lr = 1.5
        else:
            # Default moderate strength
            base_lr = 2.0

        # Adjust by confidence score (0.0 to 1.0)
        # Confidence of 0.5 = no adjustment, 1.0 = full strength, 0.0 = weak
        adjusted_lr = 1.0 + (base_lr - 1.0) * confidence

        if direction == EvidenceDirection.AGAINST:
            # For opposing evidence, use inverse
            return 1.0 / adjusted_lr
        else:
            return adjusted_lr

    @staticmethod
    def calculate_posterior(
        prior: float,
        likelihood_ratio: float
    ) -> float:
        """
        Calculate posterior probability using Bayes' theorem.
        
        P(H|E) = (LR × P(H)) / (LR × P(H) + P(¬H))
        """
        if prior <= 0 or prior >= 1:
            raise ValueError("Prior probability must be between 0 and 1")

        numerator = likelihood_ratio * prior
        denominator = numerator + (1 - prior)
        
        posterior = numerator / denominator
        
        # Ensure result is between 0 and 1
        return max(0.0, min(1.0, posterior))

    @staticmethod
    def calculate_cumulative_posterior(
        prior: float,
        evidence_list: List[Evidence]
    ) -> Dict:
        """
        Calculate cumulative posterior probability from a list of evidence.
        
        Returns:
            Dictionary with posterior probability, evidence counts, and history
        """
        current_probability = prior
        probability_history = [{"step": 0, "probability": prior, "evidence_id": None}]
        
        evidence_for_count = 0
        evidence_against_count = 0

        for idx, evidence in enumerate(evidence_list, 1):
            lr = evidence.likelihood_ratio
            current_probability = BayesianCalculator.calculate_posterior(
                current_probability,
                lr
            )
            
            probability_history.append({
                "step": idx,
                "probability": current_probability,
                "evidence_id": evidence.id,
                "direction": evidence.direction.value,
                "likelihood_ratio": lr
            })

            if evidence.direction == EvidenceDirection.FOR:
                evidence_for_count += 1
            else:
                evidence_against_count += 1

        return {
            "posterior_probability": current_probability,
            "prior_probability": prior,
            "evidence_count": len(evidence_list),
            "evidence_for_count": evidence_for_count,
            "evidence_against_count": evidence_against_count,
            "probability_history": probability_history
        }

    @staticmethod
    def classify_strength(likelihood_ratio: float) -> EvidenceStrength:
        """Classify evidence strength based on likelihood ratio."""
        abs_lr = abs(likelihood_ratio)
        
        if abs_lr >= STRONG_EVIDENCE_LR or abs_lr <= 1.0 / STRONG_EVIDENCE_LR:
            return EvidenceStrength.STRONG
        elif abs_lr >= MODERATE_EVIDENCE_LR or abs_lr <= 1.0 / MODERATE_EVIDENCE_LR:
            return EvidenceStrength.MODERATE
        else:
            return EvidenceStrength.WEAK

