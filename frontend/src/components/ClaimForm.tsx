import React, { useState } from 'react';
import { ClaimCreate } from '../services/api';

interface ClaimFormProps {
  onSubmit: (data: ClaimCreate) => Promise<void>;
  onCancel?: () => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');
  const [priorProbability, setPriorProbability] = useState(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), prior_probability: priorProbability });
      setText('');
      setPriorProbability(0.5);
    } catch (error) {
      console.error('Error creating claim:', error);
      alert('Failed to create claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Create New Claim</h2>
      
      <div className="mb-4">
        <label htmlFor="claim-text" className="block text-sm font-medium text-gray-700 mb-2">
          Claim Statement
        </label>
        <textarea
          id="claim-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Hitler had only one testicle"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="prior-probability" className="block text-sm font-medium text-gray-700 mb-2">
          Prior Probability: {Math.round(priorProbability * 100)}%
        </label>
        <input
          id="prior-probability"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={priorProbability}
          onChange={(e) => setPriorProbability(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (Very Unlikely)</span>
          <span>50% (Neutral)</span>
          <span>100% (Very Likely)</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Your initial belief about the claim before considering evidence
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Claim'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

