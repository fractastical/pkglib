/** Utility functions for Bayesian calculations on the frontend. */

export interface ProbabilityPoint {
  step: number;
  probability: number;
  evidence_id: number | null;
}

/**
 * Format probability as percentage with specified decimal places.
 */
export function formatProbability(probability: number, decimals: number = 1): string {
  return `${(probability * 100).toFixed(decimals)}%`;
}

/**
 * Get color for probability value (red for low, yellow for medium, green for high).
 */
export function getProbabilityColor(probability: number): string {
  if (probability < 0.33) {
    return '#ef4444'; // red
  } else if (probability < 0.67) {
    return '#f59e0b'; // yellow/amber
  } else {
    return '#10b981'; // green
  }
}

/**
 * Get interpretation text for probability.
 */
export function getProbabilityInterpretation(probability: number): string {
  if (probability < 0.1) {
    return 'Very unlikely';
  } else if (probability < 0.33) {
    return 'Unlikely';
  } else if (probability < 0.5) {
    return 'Somewhat unlikely';
  } else if (probability < 0.67) {
    return 'Somewhat likely';
  } else if (probability < 0.9) {
    return 'Likely';
  } else {
    return 'Very likely';
  }
}

/**
 * Get strength label and color for evidence.
 */
export function getEvidenceStrengthInfo(strength: string): { label: string; color: string } {
  switch (strength) {
    case 'strong':
      return { label: 'Strong', color: '#10b981' };
    case 'moderate':
      return { label: 'Moderate', color: '#f59e0b' };
    case 'weak':
      return { label: 'Weak', color: '#6b7280' };
    default:
      return { label: 'Unknown', color: '#6b7280' };
  }
}

/**
 * Get direction label and color for evidence.
 */
export function getEvidenceDirectionInfo(direction: string): { label: string; color: string; bgColor: string } {
  if (direction === 'for') {
    return {
      label: 'Supporting',
      color: '#10b981',
      bgColor: '#d1fae5',
    };
  } else {
    return {
      label: 'Opposing',
      color: '#ef4444',
      bgColor: '#fee2e2',
    };
  }
}

