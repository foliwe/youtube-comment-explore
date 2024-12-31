import React from 'react';
import { CommentData } from '@/types';
import CommentAnalysisDisplay from '@/components/CommentAnalysis';

interface CommentThreadProps {
  comment: CommentData;
  onAuthorClick: (author: string) => void;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
  onCommentClick: (text: string) => void;
  selectedComment: string | null;
  analyzing: boolean;
  commentAnalysis: any;
  authorFilter: string | null;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onAuthorClick,
  formatDate,
  formatNumber,
  onCommentClick,
  selectedComment,
  analyzing,
  commentAnalysis,
  authorFilter,
}) => {
  const AuthorName = ({ name }: { name: string }) => (
    <button
      onClick={() => onAuthorClick(name)}
      className={`group relative hover:text-blue-600 focus:outline-none ${
        authorFilter === name ? 'bg-yellow-100 px-2 py-1 rounded-full font-semibold text-yellow-800' : ''
      }`}
    >
      {name}
      {authorFilter === name && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        </span>
      )}
      <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
        {authorFilter === name ? 'Clear filter' : 'Filter by author'}
      </span>
    </button>
  );

  const renderComment = (comment: CommentData, isReply = false) => (
    <div className={`flex items-start space-x-3 ${isReply ? 'mt-4' : ''}`}>
      {comment.authorProfileImageUrl && (
        <img
          src={comment.authorProfileImageUrl}
          alt={comment.authorDisplayName}
          className={`rounded-full ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-medium text-gray-900 ${isReply ? 'text-sm' : ''}`}>
            <AuthorName name={comment.authorDisplayName} />
          </h3>
          <span className="text-sm text-gray-500">
            {formatDate(comment.publishedAt)}
          </span>
        </div>
        <p
          className={`text-gray-700 mt-1 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
            isReply ? 'text-sm' : ''
          }`}
          onClick={() => onCommentClick(comment.textDisplay)}
        >
          {comment.textDisplay}
        </p>
        {selectedComment === comment.textDisplay && (
          <div className="mt-2">
            {analyzing ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Analyzing comment...</p>
              </div>
            ) : (
              commentAnalysis && <CommentAnalysisDisplay analysis={commentAnalysis} />
            )}
          </div>
        )}
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <span>👍 {formatNumber(comment.likeCount)}</span>
          {!isReply && <span>💬 {formatNumber(comment.replyCount)} replies</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {renderComment(comment)}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
          {comment.replies.map((reply) => (
            <div key={reply.id}>{renderComment(reply, true)}
              {selectedComment === reply.textDisplay && (
                <div className="mt-2 ml-11">
                  {analyzing ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      <p className="mt-2 text-sm text-gray-500">Analyzing comment...</p>
                    </div>
                  ) : (
                    commentAnalysis && <CommentAnalysisDisplay analysis={commentAnalysis} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
