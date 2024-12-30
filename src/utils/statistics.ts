import { CommentData } from '@/types';

export interface CommentStats {
  totalComments: number;
  totalLikes: number;
  totalReplies: number;
  averageLikes: number;
  averageReplies: number;
  commentsByDate: { [key: string]: number };
  commentLengthDistribution: { [key: string]: number };
  topCommenters: Array<{ author: string; count: number }>;
  engagementByHour: { [key: number]: number };
  replyChainLengths: { [key: number]: number };
}

export const calculateStatistics = (comments: CommentData[]): CommentStats => {
  const stats: CommentStats = {
    totalComments: 0,
    totalLikes: 0,
    totalReplies: 0,
    averageLikes: 0,
    averageReplies: 0,
    commentsByDate: {},
    commentLengthDistribution: {},
    topCommenters: [],
    engagementByHour: {},
    replyChainLengths: {},
  };

  // Author frequency map
  const authorFrequency: { [key: string]: number } = {};

  comments.forEach(comment => {
    stats.totalComments++;
    stats.totalLikes += comment.likeCount;
    stats.totalReplies += comment.replyCount;

    // Comments by date
    const date = new Date(comment.publishedAt).toLocaleDateString();
    stats.commentsByDate[date] = (stats.commentsByDate[date] || 0) + 1;

    // Comment length distribution
    const lengthCategory = categorizeLengthBucket(comment.textDisplay.length);
    stats.commentLengthDistribution[lengthCategory] = 
      (stats.commentLengthDistribution[lengthCategory] || 0) + 1;

    // Author frequency
    authorFrequency[comment.authorDisplayName] = 
      (authorFrequency[comment.authorDisplayName] || 0) + 1;

    // Engagement by hour
    const hour = new Date(comment.publishedAt).getHours();
    stats.engagementByHour[hour] = (stats.engagementByHour[hour] || 0) + 1;

    // Reply chain lengths
    const replyCount = comment.replies?.length || 0;
    stats.replyChainLengths[replyCount] = 
      (stats.replyChainLengths[replyCount] || 0) + 1;

    // Process replies
    if (comment.replies) {
      comment.replies.forEach(reply => {
        stats.totalComments++;
        stats.totalLikes += reply.likeCount;

        const replyDate = new Date(reply.publishedAt).toLocaleDateString();
        stats.commentsByDate[replyDate] = (stats.commentsByDate[replyDate] || 0) + 1;

        const replyLengthCategory = categorizeLengthBucket(reply.textDisplay.length);
        stats.commentLengthDistribution[replyLengthCategory] = 
          (stats.commentLengthDistribution[replyLengthCategory] || 0) + 1;

        authorFrequency[reply.authorDisplayName] = 
          (authorFrequency[reply.authorDisplayName] || 0) + 1;

        const replyHour = new Date(reply.publishedAt).getHours();
        stats.engagementByHour[replyHour] = 
          (stats.engagementByHour[replyHour] || 0) + 1;
      });
    }
  });

  // Calculate averages
  stats.averageLikes = stats.totalLikes / stats.totalComments;
  stats.averageReplies = stats.totalReplies / comments.length;

  // Get top commenters
  stats.topCommenters = Object.entries(authorFrequency)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
};

const categorizeLengthBucket = (length: number): string => {
  if (length < 50) return '0-50';
  if (length < 100) return '51-100';
  if (length < 200) return '101-200';
  if (length < 500) return '201-500';
  return '500+';
};
