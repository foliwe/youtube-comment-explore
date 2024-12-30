import { CommentData } from '@/types';
import { FilterOptions } from '@/components/AdvancedFilters';

export const filterComments = (comments: CommentData[], filters: FilterOptions): CommentData[] => {
  return comments.filter(comment => {
    // Date Range Filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const commentDate = new Date(comment.publishedAt);
      if (filters.dateRange.start && commentDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && commentDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    // Comment Length Filter
    const commentLength = comment.textDisplay.length;
    if (commentLength < filters.commentLength.min || commentLength > filters.commentLength.max) {
      return false;
    }

    // Minimum Likes Filter
    if (comment.likeCount < filters.minLikes) {
      return false;
    }

    // Links Filter
    if (filters.hasLinks !== null) {
      const hasLinks = /https?:\/\/[^\s]+/.test(comment.textDisplay);
      if (hasLinks !== filters.hasLinks) {
        return false;
      }
    }

    // Hashtags Filter
    if (filters.hasHashtags !== null) {
      const hasHashtags = /#[^\s]+/.test(comment.textDisplay);
      if (hasHashtags !== filters.hasHashtags) {
        return false;
      }
    }

    // Mentions Filter
    if (filters.hasMentions !== null) {
      const hasMentions = /@[^\s]+/.test(comment.textDisplay);
      if (hasMentions !== filters.hasMentions) {
        return false;
      }
    }

    // Verified User Filter (if API provides this information)
    if (filters.isVerified !== null) {
      // This would need to be implemented based on the YouTube API response structure
      // For now, we'll skip this filter
    }

    // Text Search Filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const textLower = comment.textDisplay.toLowerCase();
      if (!textLower.includes(searchLower)) {
        return false;
      }
    }

    // Tags Filter
    if (filters.tags.length > 0) {
      const commentTags = extractTags(comment.textDisplay);
      if (!filters.tags.some(tag => commentTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
};

const extractTags = (text: string): string[] => {
  const hashtagRegex = /#[^\s]+/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map(tag => tag.toLowerCase());
};
