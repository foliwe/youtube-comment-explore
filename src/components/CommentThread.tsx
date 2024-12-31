import React from 'react';
import { CommentData } from '@/types';
import CommentAnalysisDisplay from './CommentAnalysis';

interface CommentThreadProps {
  comment: CommentData;
  isReply?: boolean;
  onAuthorClick: (author: string) => void;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
  onCommentClick: (comment: string | null) => void;
  selectedComment: string | null;
  analyzing: boolean;
  commentAnalysis: any;
  authorFilter: string | null;
  onReply?: (parentId: string) => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  isReply = false,
  onAuthorClick,
  formatDate,
  formatNumber,
  onCommentClick,
  selectedComment,
  analyzing,
  commentAnalysis,
  authorFilter,
  onReply,
}) => {
  const isSelected = selectedComment === comment.textDisplay;
  const isHighlighted = authorFilter === comment.authorDisplayName;

  const handleCommentClick = () => {
    onCommentClick(isSelected ? null : comment.textDisplay);
  };

  const handleAuthorClick = () => {
    onAuthorClick(comment.authorDisplayName);
  };

  return (
    <div className={`${isHighlighted ? 'bg-blue-200 p-4 rounded-lg' : ''}`}>
      <div className="flex space-x-3">
        {/* Author Image */}
        <img
          src={comment.authorProfileImageUrl}
          alt={comment.authorDisplayName}
          className="h-10 w-10 rounded-full"
        />

        {/* Comment Content */}
        <div className="flex-1 space-y-1">
          {/* Author and Date */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAuthorClick}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              {comment.authorDisplayName}
            </button>
            <span className="text-sm text-gray-500">
              {formatDate(comment.publishedAt)}
            </span>
          </div>

          {/* Comment Text */}
          <div 
            className="text-sm text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded p-1"
            onClick={handleCommentClick}
          >
            {comment.textDisplay}
          </div>

          {/* Likes Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>👍 {formatNumber(comment.likeCount)}</span>
          </div>

          {/* Analysis Section */}
          {isSelected && (
            <div className="mt-2 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentClick(null);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close analysis"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {analyzing ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Analyzing comment...</p>
                </div>
              ) : (
                commentAnalysis && (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <CommentAnalysisDisplay analysis={commentAnalysis} />
                  </div>
                )
              )}
            </div>
          )}

          {/* Reply Button */}
          {!isReply && onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              isReply={true}
              onAuthorClick={onAuthorClick}
              formatDate={formatDate}
              formatNumber={formatNumber}
              onCommentClick={onCommentClick}
              selectedComment={selectedComment}
              analyzing={analyzing}
              commentAnalysis={commentAnalysis}
              authorFilter={authorFilter}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
