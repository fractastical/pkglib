import React, { useState } from 'react';
import { EvidenceCreate } from '../services/api';

interface EvidenceAdderProps {
  onAdd: (data: EvidenceCreate) => Promise<void>;
  onAddFromUrl: (url: string) => Promise<void>;
  claimText: string;
}

export const EvidenceAdder: React.FC<EvidenceAdderProps> = ({ onAdd, onAddFromUrl, claimText }) => {
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'url'>('manual');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        text: text.trim(),
        source_url: sourceUrl.trim() || undefined,
        source_title: sourceTitle.trim() || undefined,
      });
      setText('');
      setSourceUrl('');
      setSourceTitle('');
    } catch (error) {
      console.error('Error adding evidence:', error);
      alert('Failed to add evidence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddFromUrl(sourceUrl.trim());
      setSourceUrl('');
    } catch (error) {
      console.error('Error adding evidence from URL:', error);
      alert('Failed to extract evidence from URL. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Add Evidence</h2>
        <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <span className="font-semibold text-blue-700">Auto-classified</span> using NLP
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <span className="font-semibold">How it works:</span> Evidence is automatically assessed as supporting or opposing the claim, 
            assigned a strength rating (weak/moderate/strong), and used to update the Bayesian probability calculation.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === 'manual'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === 'url'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          From URL
        </button>
      </div>

      {/* Manual Entry Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit}>
          <div className="mb-4">
            <label htmlFor="evidence-text" className="block text-sm font-medium text-gray-700 mb-2">
              Evidence Text <span className="text-gray-500 font-normal">(will be auto-classified)</span>
            </label>
            <textarea
              id="evidence-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Enter evidence that supports or opposes: "${claimText}"`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The system will analyze this text and determine if it supports or opposes the claim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="source-title" className="block text-sm font-medium text-gray-700 mb-2">
                Source Title (optional)
              </label>
              <input
                id="source-title"
                type="text"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g., Wikipedia Article"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="source-url" className="block text-sm font-medium text-gray-700 mb-2">
                Source URL (optional)
              </label>
              <input
                id="source-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Evidence'}
          </button>
        </form>
      )}

      {/* URL Entry Form */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit}>
          <div className="mb-4">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <input
              id="url-input"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-700 font-medium">
                What happens when you submit:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-2">
                <li>Content is extracted from the webpage</li>
                <li>Evidence is automatically classified (supporting/opposing)</li>
                <li>Strength and confidence scores are calculated</li>
                <li>Source URL and title are preserved for reference</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !sourceUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Extracting...' : 'Extract Evidence'}
          </button>
        </form>
      )}
    </div>
  );
};

