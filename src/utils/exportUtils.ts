import { CommentData } from '@/types';

export const exportToCSV = (comments: CommentData[]): string => {
  const headers = [
    'Author',
    'Comment',
    'Published At',
    'Likes',
    'Reply Count',
    'Channel URL',
    'Parent ID',
  ];

  const rows = comments.map(comment => [
    comment.authorDisplayName,
    comment.textDisplay.replace(/"/g, '""'), // Escape quotes
    comment.publishedAt,
    comment.likeCount.toString(),
    comment.replyCount.toString(),
    comment.authorChannelUrl,
    comment.parentId || '',
  ]);

  // Add replies as separate rows
  comments.forEach(comment => {
    if (comment.replies) {
      comment.replies.forEach(reply => {
        rows.push([
          reply.authorDisplayName,
          reply.textDisplay.replace(/"/g, '""'),
          reply.publishedAt,
          reply.likeCount.toString(),
          '0', // Replies don't have nested replies
          reply.authorChannelUrl,
          comment.id,
        ]);
      });
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const exportToJSON = (comments: CommentData[]): string => {
  return JSON.stringify(comments, null, 2);
};

export const downloadFile = (content: string, fileName: string, type: 'csv' | 'json') => {
  const blob = new Blob([content], { type: `text/${type};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
