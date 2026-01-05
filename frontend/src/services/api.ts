import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Claim {
  id: number;
  text: string;
  prior_probability: number;
  created_at: string;
  updated_at: string;
  evidence: Evidence[];
}

export interface Evidence {
  id: number;
  text: string;
  direction: 'for' | 'against';
  strength: 'weak' | 'moderate' | 'strong';
  likelihood_ratio: number;
  confidence_score: number;
  source_url: string | null;
  source_title: string | null;
  created_at: string;
}

export interface Analysis {
  posterior_probability: number;
  prior_probability: number;
  evidence_count: number;
  evidence_for_count: number;
  evidence_against_count: number;
  probability_history: Array<{
    step: number;
    probability: number;
    evidence_id: number | null;
    direction?: string;
    likelihood_ratio?: number;
  }>;
}

export interface ClaimCreate {
  text: string;
  prior_probability?: number;
}

export interface EvidenceCreate {
  text: string;
  source_url?: string;
  source_title?: string;
  direction?: 'for' | 'against';
  confidence?: number;
  strength?: 'weak' | 'moderate' | 'strong';
}

export const claimsApi = {
  create: async (data: ClaimCreate): Promise<Claim> => {
    const response = await api.post<Claim>('/claims', data);
    return response.data;
  },

  get: async (id: number): Promise<Claim> => {
    const response = await api.get<Claim>(`/claims/${id}`);
    return response.data;
  },

  list: async (): Promise<Claim[]> => {
    const response = await api.get<Claim[]>('/claims');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/claims/${id}`);
  },
};

export const evidenceApi = {
  add: async (claimId: number, data: EvidenceCreate): Promise<Evidence> => {
    const response = await api.post<Evidence>(`/claims/${claimId}/evidence`, data);
    return response.data;
  },

  addFromUrl: async (claimId: number, url: string): Promise<Evidence> => {
    const response = await api.post<Evidence>(`/claims/${claimId}/evidence/from-url`, { url });
    return response.data;
  },

  delete: async (evidenceId: number): Promise<void> => {
    await api.delete(`/evidence/${evidenceId}`);
  },
};

export const analysisApi = {
  get: async (claimId: number): Promise<Analysis> => {
    const response = await api.get<Analysis>(`/claims/${claimId}/analysis`);
    return response.data;
  },
};

