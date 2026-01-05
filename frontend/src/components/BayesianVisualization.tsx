import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Analysis } from '../services/api';
import { formatProbability, getProbabilityColor, getProbabilityInterpretation } from '../utils/bayesian';

interface BayesianVisualizationProps {
  analysis: Analysis;
}

export const BayesianVisualization: React.FC<BayesianVisualizationProps> = ({ analysis }) => {
  const chartData = analysis.probability_history.map((point) => ({
    step: point.step,
    probability: point.probability * 100, // Convert to percentage
    label: point.step === 0 ? 'Prior' : `Evidence ${point.step}`,
  }));

  const currentProbability = analysis.posterior_probability;
  const probabilityColor = getProbabilityColor(currentProbability);
  const interpretation = getProbabilityInterpretation(currentProbability);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Bayesian Analysis</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Based on {analysis.evidence_count} evidence piece{analysis.evidence_count !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Posterior Probability</div>
          <div className="text-2xl font-bold" style={{ color: probabilityColor }}>
            {formatProbability(currentProbability)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{interpretation}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Supporting Evidence</div>
          <div className="text-2xl font-bold text-green-700">
            {analysis.evidence_for_count}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Opposing Evidence</div>
          <div className="text-2xl font-bold text-red-700">
            {analysis.evidence_against_count}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Evidence</div>
          <div className="text-2xl font-bold text-gray-700">
            {analysis.evidence_count}
          </div>
        </div>
      </div>

      {/* Probability Gauge */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Current Probability</span>
          <span className="text-lg font-bold" style={{ color: probabilityColor }}>
            {formatProbability(currentProbability)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
          <div
            className="h-6 rounded-full transition-all duration-500"
            style={{
              width: `${currentProbability * 100}%`,
              backgroundColor: probabilityColor,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
            {interpretation}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Probability History Chart */}
      {chartData.length > 1 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Probability Evolution</h3>
          <div className="mb-2 text-sm text-gray-600">
            Shows how probability changes as each piece of evidence is added
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step"
                label={{ value: 'Evidence Step', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelFormatter={(label) => label === '0' ? 'Prior' : `Evidence ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="probability"
                stroke={probabilityColor}
                strokeWidth={2}
                dot={{ fill: probabilityColor, r: 4 }}
                name="Probability (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Prior vs Posterior */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Prior Probability</div>
            <div className="text-xl font-semibold">
              {formatProbability(analysis.prior_probability)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Posterior Probability</div>
            <div className="text-xl font-semibold" style={{ color: probabilityColor }}>
              {formatProbability(analysis.posterior_probability)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Change: {formatProbability(Math.abs(analysis.posterior_probability - analysis.prior_probability))}{' '}
          {analysis.posterior_probability > analysis.prior_probability ? '↑' : '↓'}
        </div>
      </div>
    </div>
  );
};

