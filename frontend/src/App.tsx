import React, { useState, useEffect } from 'react';
import { Claim, Evidence, Analysis, claimsApi, evidenceApi, analysisApi } from './services/api';
import { ClaimForm } from './components/ClaimForm';
import { EvidenceList } from './components/EvidenceList';
import { EvidenceAdder } from './components/EvidenceAdder';
import { BayesianVisualization } from './components/BayesianVisualization';
import './App.css';

function App() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    if (selectedClaim) {
      loadAnalysis(selectedClaim.id);
    }
  }, [selectedClaim]);

  const loadClaims = async () => {
    try {
      const data = await claimsApi.list();
      setClaims(data);
      if (data.length > 0 && !selectedClaim) {
        setSelectedClaim(data[0]);
      }
    } catch (error) {
      console.error('Error loading claims:', error);
    }
  };

  const loadAnalysis = async (claimId: number) => {
    try {
      const data = await analysisApi.get(claimId);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  };

  const handleCreateClaim = async (data: { text: string; prior_probability?: number }) => {
    const newClaim = await claimsApi.create(data);
    setClaims([...claims, newClaim]);
    setSelectedClaim(newClaim);
  };

  const handleAddEvidence = async (data: { text: string; source_url?: string; source_title?: string }) => {
    if (!selectedClaim) return;
    await evidenceApi.add(selectedClaim.id, data);
    await refreshClaim();
  };

  const handleAddEvidenceFromUrl = async (url: string) => {
    if (!selectedClaim) return;
    await evidenceApi.addFromUrl(selectedClaim.id, url);
    await refreshClaim();
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    await evidenceApi.delete(evidenceId);
    await refreshClaim();
  };

  const handleDeleteClaim = async (claimId: number) => {
    await claimsApi.delete(claimId);
    const updatedClaims = claims.filter((c) => c.id !== claimId);
    setClaims(updatedClaims);
    if (selectedClaim?.id === claimId) {
      setSelectedClaim(updatedClaims.length > 0 ? updatedClaims[0] : null);
    }
  };

  const refreshClaim = async () => {
    if (!selectedClaim) return;
    try {
      const updatedClaim = await claimsApi.get(selectedClaim.id);
      setSelectedClaim(updatedClaim);
      await loadAnalysis(selectedClaim.id);
    } catch (error) {
      console.error('Error refreshing claim:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Debate Evidence Analyzer</h1>
          <p className="text-gray-600 mt-1">Analyze evidence using Bayesian probability</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Claims List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Claims</h2>
              {claims.length === 0 ? (
                <p className="text-gray-500 text-sm">No claims yet. Create one to get started.</p>
              ) : (
                <div className="space-y-2">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedClaim?.id === claim.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{claim.text}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {claim.evidence.length} evidence
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this claim?')) {
                              handleDeleteClaim(claim.id);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ClaimForm onSubmit={handleCreateClaim} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedClaim ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedClaim.text}</h2>
                  <p className="text-sm text-gray-600">
                    Prior Probability: {Math.round(selectedClaim.prior_probability * 100)}%
                  </p>
                </div>

                {analysis && <BayesianVisualization analysis={analysis} />}

                {/* Evidence Source Summary */}
                {selectedClaim.evidence.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Evidence Sources</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">From URLs</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {selectedClaim.evidence.filter(e => e.source_url && e.source_url.startsWith('http')).length}
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="text-xs text-gray-600 mb-1">Manual Entry</div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {selectedClaim.evidence.filter(e => !e.source_url || !e.source_url.startsWith('http')).length}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">With Sources</div>
                        <div className="text-2xl font-bold text-green-700">
                          {selectedClaim.evidence.filter(e => e.source_url || e.source_title).length}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Total Pieces</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {selectedClaim.evidence.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <EvidenceAdder
                  onAdd={handleAddEvidence}
                  onAddFromUrl={handleAddEvidenceFromUrl}
                  claimText={selectedClaim.text}
                />

                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-4">Evidence ({selectedClaim.evidence.length})</h2>
                  <EvidenceList
                    evidence={selectedClaim.evidence}
                    onDelete={handleDeleteEvidence}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select a claim from the sidebar or create a new one to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

