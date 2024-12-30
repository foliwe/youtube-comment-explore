import { useState, useEffect } from 'react';
import { CommentAnalysis } from '@/utils/commentAnalysis';

interface CommentAnalysisProps {
  analysis: CommentAnalysis;
}

export default function CommentAnalysisDisplay({ analysis }: CommentAnalysisProps) {
  const getSentimentEmoji = (score: number) => {
    if (score > 0) return '😊';
    if (score < 0) return '😞';
    return '😐';
  };

  const getSentimentColor = (score: number) => {
    if (score > 0) return 'text-green-600';
    if (score < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTopWords = () => {
    return Object.entries(analysis.wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Sentiment Analysis */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment Analysis</h4>
        <div className="flex items-center space-x-4">
          <span className="text-2xl">{getSentimentEmoji(analysis.sentiment.score)}</span>
          <div>
            <p className={`font-medium ${getSentimentColor(analysis.sentiment.score)}`}>
              Score: {analysis.sentiment.score}
            </p>
            {analysis.sentiment.positive.length > 0 && (
              <p className="text-sm text-green-600">
                Positive words: {analysis.sentiment.positive.join(', ')}
              </p>
            )}
            {analysis.sentiment.negative.length > 0 && (
              <p className="text-sm text-red-600">
                Negative words: {analysis.sentiment.negative.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toxicity Analysis */}
      {analysis.toxicity && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Warnings</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(analysis.toxicity).map(([key, value]) => (
              <div
                key={key}
                className={`p-2 rounded ${
                  value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
              >
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}: {value ? '⚠️' : '✅'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word Frequency */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Words</h4>
        <div className="flex flex-wrap gap-2">
          {getTopWords().map(([word, count]) => (
            <span
              key={word}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {word} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* Topics/Hashtags */}
      {analysis.topics.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
