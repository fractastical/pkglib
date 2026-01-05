#!/usr/bin/env python3
"""Test the API with sample debate questions."""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def create_claim(text, prior=0.5):
    """Create a new claim."""
    response = requests.post(
        f"{BASE_URL}/claims",
        json={"text": text, "prior_probability": prior}
    )
    response.raise_for_status()
    return response.json()

def add_evidence(claim_id, text, source_title=None, source_url=None):
    """Add evidence to a claim."""
    response = requests.post(
        f"{BASE_URL}/claims/{claim_id}/evidence",
        json={
            "text": text,
            "source_title": source_title,
            "source_url": source_url
        }
    )
    response.raise_for_status()
    return response.json()

def get_analysis(claim_id):
    """Get Bayesian analysis for a claim."""
    response = requests.get(f"{BASE_URL}/claims/{claim_id}/analysis")
    response.raise_for_status()
    return response.json()

def print_analysis(claim_text, analysis):
    """Print formatted analysis."""
    print(f"\n{'='*70}")
    print(f"CLAIM: {claim_text}")
    print(f"{'='*70}")
    print(f"Prior Probability: {analysis['prior_probability']*100:.1f}%")
    print(f"Posterior Probability: {analysis['posterior_probability']*100:.1f}%")
    print(f"Evidence Count: {analysis['evidence_count']}")
    print(f"  - Supporting: {analysis['evidence_for_count']}")
    print(f"  - Opposing: {analysis['evidence_against_count']}")
    print(f"\nProbability Evolution:")
    for point in analysis['probability_history']:
        if point['step'] == 0:
            print(f"  Step {point['step']}: {point['probability']*100:.1f}% (Prior)")
        else:
            direction = point.get('direction', 'unknown')
            lr = point.get('likelihood_ratio', 0)
            print(f"  Step {point['step']}: {point['probability']*100:.1f}% (Evidence {direction}, LR={lr:.2f})")

# Test 1: Hitler had only one testicle
print("Creating claim: Hitler had only one testicle")
claim1 = create_claim("Hitler had only one testicle", prior=0.5)
print(f"Created claim ID: {claim1['id']}")

print("\nAdding evidence...")

# Evidence supporting the claim
add_evidence(
    claim1['id'],
    "According to historical medical records, Hitler's personal physician noted abnormalities during examination. The claim originates from Soviet intelligence reports during World War II.",
    source_title="Historical Medical Records",
    source_url="https://example.com/historical-records"
)

add_evidence(
    claim1['id'],
    "Multiple biographers have referenced this claim, citing sources from the Soviet archives. The story has been repeated in various historical accounts.",
    source_title="Biographical Accounts",
    source_url="https://example.com/biographies"
)

# Evidence opposing the claim
add_evidence(
    claim1['id'],
    "There is no definitive medical evidence to support this claim. The story appears to be a wartime rumor or propaganda. No medical records from Hitler's actual doctors confirm this.",
    source_title="Medical History Review",
    source_url="https://example.com/medical-review"
)

add_evidence(
    claim1['id'],
    "Historians have debunked this as a myth. The claim cannot be verified and appears to be based on unsubstantiated reports rather than factual medical evidence.",
    source_title="Historical Analysis",
    source_url="https://example.com/historical-analysis"
)

# Get analysis
analysis1 = get_analysis(claim1['id'])
print_analysis(claim1['text'], analysis1)

# Test 2: The moon landing was faked
print("\n\n" + "="*70)
print("Creating claim: The moon landing was faked")
claim2 = create_claim("The moon landing was faked", prior=0.1)  # Low prior - unlikely
print(f"Created claim ID: {claim2['id']}")

print("\nAdding evidence...")

# Evidence opposing (debunking the conspiracy)
add_evidence(
    claim2['id'],
    "Multiple independent sources confirm the moon landing, including Soviet tracking stations that monitored the mission. The Soviets would have exposed a fake landing.",
    source_title="Soviet Space Program Records",
    source_url="https://example.com/soviet-records"
)

add_evidence(
    claim2['id'],
    "Lunar samples brought back match geological data from the moon and cannot be replicated on Earth. Scientists worldwide have verified the authenticity of moon rocks.",
    source_title="Geological Analysis",
    source_url="https://example.com/geological-analysis"
)

add_evidence(
    claim2['id'],
    "Laser reflectors placed on the moon by Apollo missions are still used today for precise distance measurements, proving humans were there.",
    source_title="Lunar Laser Ranging",
    source_url="https://example.com/laser-ranging"
)

# One piece of "supporting" evidence (conspiracy theory)
add_evidence(
    claim2['id'],
    "Some claim the flag appears to wave in photos, suggesting wind, which would indicate filming on Earth. However, this has been explained by the flag's construction.",
    source_title="Conspiracy Theory Analysis",
    source_url="https://example.com/flag-analysis"
)

analysis2 = get_analysis(claim2['id'])
print_analysis(claim2['text'], analysis2)

# Test 3: Shakespeare didn't write his plays
print("\n\n" + "="*70)
print("Creating claim: Shakespeare didn't write his plays")
claim3 = create_claim("Shakespeare didn't write his plays", prior=0.3)  # Somewhat unlikely
print(f"Created claim ID: {claim3['id']}")

print("\nAdding evidence...")

# Evidence supporting (authorship doubt)
add_evidence(
    claim3['id'],
    "There is limited documentary evidence connecting William Shakespeare of Stratford to the plays. No manuscripts, letters, or contemporary records directly link him to the works.",
    source_title="Authorship Debate",
    source_url="https://example.com/authorship-debate"
)

add_evidence(
    claim3['id'],
    "The plays demonstrate extensive knowledge of law, court life, and foreign countries that a commoner from Stratford would unlikely possess.",
    source_title="Literary Analysis",
    source_url="https://example.com/literary-analysis"
)

# Evidence opposing (traditional attribution)
add_evidence(
    claim3['id'],
    "Contemporary records show Shakespeare was an actor and shareholder in the Globe Theatre, directly connected to the plays. His name appears on published works during his lifetime.",
    source_title="Historical Records",
    source_url="https://example.com/historical-records"
)

add_evidence(
    claim3['id'],
    "The vast majority of Shakespeare scholars accept traditional attribution. The authorship question is considered fringe theory without substantial evidence.",
    source_title="Academic Consensus",
    source_url="https://example.com/academic-consensus"
)

analysis3 = get_analysis(claim3['id'])
print_analysis(claim3['text'], analysis3)

print("\n\n" + "="*70)
print("All sample questions processed!")
print("="*70)
print(f"\nView results at: http://localhost:8000/claims")
print(f"API Docs at: http://localhost:8000/docs")

