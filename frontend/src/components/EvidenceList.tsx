import React from 'react';
import { Evidence } from '../services/api';
import { getEvidenceDirectionInfo, getEvidenceStrengthInfo } from '../utils/bayesian';

interface EvidenceListProps {
  evidence: Evidence[];
  onDelete?: (evidenceId: number) => void;
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence, onDelete }) => {
  if (evidence.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No evidence added yet. Add evidence using the form below.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item, index) => {
        const directionInfo = getEvidenceDirectionInfo(item.direction);
        const strengthInfo = getEvidenceStrengthInfo(item.strength);
        const hasSource = !!(item.source_url || item.source_title);
        const isExtractedFromUrl = !!item.source_url && item.source_url.startsWith('http');

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{ borderLeftColor: directionInfo.color }}
          >
            {/* Evidence Number and Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">Evidence #{index + 1}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              {onDelete && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Assessment Badges - More Prominent */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Assessment
              </div>
              <div className="flex gap-2 flex-wrap">
                <span
                  className="px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm"
                  style={{
                    backgroundColor: directionInfo.bgColor,
                    color: directionInfo.color,
                  }}
                >
                  {directionInfo.label} the Claim
                </span>
                <span
                  className="px-3 py-1.5 rounded-md text-sm font-semibold border-2 shadow-sm"
                  style={{
                    borderColor: strengthInfo.color,
                    color: strengthInfo.color,
                    backgroundColor: 'white',
                  }}
                >
                  {strengthInfo.label} Strength
                </span>
                <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Likelihood Ratio: {item.likelihood_ratio.toFixed(2)}
                </span>
                <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  Confidence: {Math.round(item.confidence_score * 100)}%
                </span>
              </div>
            </div>

            {/* Evidence Text */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Evidence Text
              </div>
              <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-200">
                {item.text}
              </p>
            </div>

            {/* Source Information - Much More Prominent */}
            {hasSource ? (
              <div className="mt-4 pt-4 border-t-2 border-gray-300 bg-blue-50 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                    Source
                  </span>
                  {isExtractedFromUrl && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 rounded">
                      Extracted from URL
                    </span>
                  )}
                </div>
                {item.source_title && (
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    {item.source_title}
                  </p>
                )}
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:text-blue-900 break-all underline font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {item.source_url}
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t-2 border-gray-300 bg-yellow-50 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-yellow-900 uppercase tracking-wide">
                    Manually Entered
                  </span>
                </div>
                <p className="text-xs text-yellow-800 mt-1">
                  This evidence was manually entered by the user
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

