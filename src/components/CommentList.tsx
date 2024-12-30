import { useState } from 'react';
import { CommentData } from '@/types';

interface CommentListProps {
  comments: CommentData[];
}

export default function CommentList({ comments }: CommentListProps) {
  const [sortBy, setSortBy] = useState<'replies' | 'likes'>('replies');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const filteredComments = comments.filter(
    comment => !selectedAuthor || comment.authorDisplayName === selectedAuthor
  );

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'replies') {
      return (b.replyCount || 0) - (a.replyCount || 0);
    }
    return (b.likeCount || 0) - (a.likeCount || 0);
  });

  const uniqueAuthors = Array.from(
    new Set(comments.map(comment => comment.authorDisplayName))
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'replies' | 'likes')}
            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="replies">Reply Count</option>
            <option value="likes">Like Count</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by author:</label>
          <select
            value={selectedAuthor || ''}
            onChange={(e) => setSelectedAuthor(e.target.value || null)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All authors</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-white rounded-lg shadow border border-gray-200"
          >
            <div className="flex items-start space-x-4">
              {comment.authorProfileImageUrl && (
                <img
                  src={comment.authorProfileImageUrl}
                  alt={comment.authorDisplayName}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    {comment.authorDisplayName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{comment.textDisplay}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>👍 {comment.likeCount || 0}</span>
                  <span>💬 {comment.replyCount || 0} replies</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
