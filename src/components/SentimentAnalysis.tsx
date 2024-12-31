'use client';

import React from 'react';
import { CommentData } from '@/types';

interface SentimentAnalysisProps {
  comments: CommentData[];
}

interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  overallScore: number;
}

export default function SentimentAnalysis({ comments }: SentimentAnalysisProps) {
  const analyzeSentiment = (text: string): number => {
    const positiveWords = new Set([
      'good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'best', 'fantastic',
      'wonderful', 'perfect', 'beautiful', 'happy', 'thanks', 'thank', 'helpful',
      'nice', 'well', 'super', 'cool', 'brilliant', '👍', '❤️', '😊', '🙂', '😄'
    ]);

    const negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'poor', 'disappointed',
      'waste', 'boring', 'stupid', 'useless', 'wrong', 'annoying', 'dislike',
      'worse', 'fail', 'failed', 'disappointing', 'awful', '👎', '😠', '😡', '😤', '😒'
    ]);

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.has(word)) score += 1;
      if (negativeWords.has(word)) score -= 1;
    });

    // Normalize score between -1 and 1
    return score === 0 ? 0 : score / Math.max(Math.abs(score), 1);
  };

  const calculateSentimentStats = (comments: CommentData[]): SentimentStats => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let totalScore = 0;

    comments.forEach(comment => {
      const score = analyzeSentiment(comment.textDisplay);
      totalScore += score;

      if (score > 0.2) positive++;
      else if (score < -0.2) negative++;
      else neutral++;
    });

    return {
      positive,
      negative,
      neutral,
      overallScore: comments.length > 0 ? totalScore / comments.length : 0
    };
  };

  const stats = calculateSentimentStats(comments);
  const total = comments.length;
  const getScoreColor = (score: number) => {
    if (score > 0.2) return 'text-green-600';
    if (score < -0.2) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score > 0.2) return '😊';
    if (score < -0.2) return '😟';
    return '😐';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
      
      {/* Overall Sentiment Score */}
      <div className="mb-6 text-center">
        <div className={`text-3xl font-bold ${getScoreColor(stats.overallScore)}`}>
          {getScoreEmoji(stats.overallScore)}
          <span className="ml-2">
            {(stats.overallScore * 100).toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Overall Sentiment Score</p>
      </div>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600">
            {((stats.positive / total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Positive</div>
          <div className="text-lg">😊</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-yellow-600">
            {((stats.neutral / total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Neutral</div>
          <div className="text-lg">😐</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600">
            {((stats.negative / total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Negative</div>
          <div className="text-lg">😟</div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="h-4 rounded-full overflow-hidden bg-gray-200 flex">
        <div 
          className="bg-green-500 h-full"
          style={{ width: `${(stats.positive / total) * 100}%` }}
        />
        <div 
          className="bg-yellow-500 h-full"
          style={{ width: `${(stats.neutral / total) * 100}%` }}
        />
        <div 
          className="bg-red-500 h-full"
          style={{ width: `${(stats.negative / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
