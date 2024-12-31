'use client';

import { useState, useMemo } from 'react';
import { CommentData } from '@/types';
import { analyzeComment, CommentAnalysis } from '@/utils/commentAnalysis';
import CommentAnalysisDisplay from '@/components/CommentAnalysis';
import AdvancedFilters, { FilterOptions } from '@/components/AdvancedFilters';
import { filterComments } from '@/utils/filterComments';
import { calculateStatistics, CommentStats } from '@/utils/statistics';
import Statistics from '@/components/Statistics';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import { exportToCSV, exportToJSON, downloadFile } from '@/utils/exportUtils';
import CommentThread from '@/components/CommentThread';

type SortOrder = 'newest' | 'oldest';

const COMMENTS_PER_PAGE = 10;

export default function Home() {
  const [url, setUrl] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchStats, setFetchStats] = useState<{ totalComments: number; fetchedComments: number } | null>(null);
  const [stats, setStats] = useState<{ totalComments: number; fetchedComments: number } | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [authorFilter, setAuthorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [commentAnalysis, setCommentAnalysis] = useState<CommentAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    commentLength: { min: 0, max: 1000 },
    minLikes: 0,
    hasLinks: null,
    hasHashtags: null,
    hasMentions: null,
    isVerified: null,
    searchText: '',
    tags: [],
  });
  const [showStats, setShowStats] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFetchStats(null);
    setAuthorFilter('');
    setCurrentPage(1);
    setAdvancedFilters({
      dateRange: { start: '', end: '' },
      commentLength: { min: 0, max: 1000 },
      minLikes: 0,
      hasLinks: null,
      hasHashtags: null,
      hasMentions: null,
      isVerified: null,
      searchText: '',
      tags: [],
    });
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const response = await fetch(`/api/comments?videoId=${videoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch comments');
      }

      setComments(data.comments);
      setFetchStats({
        totalComments: data.totalComments,
        fetchedComments: data.fetchedComments
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const filteredAndSortedComments = useMemo(() => {
    let filtered = [...comments];
    
    // Apply author filter
    if (authorFilter) {
      const searchTerm = authorFilter.toLowerCase();
      filtered = filtered.filter(comment => {
        const matchesMainComment = comment.authorDisplayName.toLowerCase().includes(searchTerm);
        const matchesReplies = comment.replies?.some(reply => 
          reply.authorDisplayName.toLowerCase().includes(searchTerm)
        );
        return matchesMainComment || matchesReplies;
      });
    }

    // Apply advanced filters
    filtered = filterComments(filtered, advancedFilters);

    // Apply sort
    return filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [comments, sortOrder, authorFilter, advancedFilters]);

  const paginatedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
    return filteredAndSortedComments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
  }, [filteredAndSortedComments, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedComments.length / COMMENTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={index} className="bg-yellow-200">{part}</span> : 
        part
    );
  };

  const handleAuthorClick = (authorName: string) => {
    setAuthorFilter(authorName);
    setCurrentPage(1);
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const AuthorName = ({ name }: { name: string }) => (
    <button
      onClick={() => handleAuthorClick(name)}
      className="hover:text-blue-600 hover:underline focus:outline-none"
    >
      {highlightText(name, authorFilter)}
    </button>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const showEllipsis = totalPages > 7;
    let startPage = 1;
    let endPage = totalPages;

    if (showEllipsis) {
      if (currentPage <= 4) {
        endPage = 5;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
        >
          ←
        </button>
        
        {showEllipsis && startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1 ? 'bg-blue-500 text-white' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              1
            </button>
            <span className="text-gray-500">...</span>
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === number ? 'bg-blue-500 text-white' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        ))}

        {showEllipsis && endPage < totalPages && (
          <>
            <span className="text-gray-500">...</span>
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages ? 'bg-blue-500 text-white' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
        >
          →
        </button>
      </div>
    );
  };

  const handleCommentClick = async (commentText: string) => {
    setSelectedComment(commentText);
    setAnalyzing(true);
    try {
      const analysis = await analyzeComment(commentText);
      setCommentAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing comment:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const commentStats = useMemo(() => {
    if (!comments.length) return null;
    return calculateStatistics(comments);
  }, [comments]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-lg mx-auto ">

          
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              YouTube Comment Explorer
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    YouTube Video URL
                  </label>
                  <div className="relative">
                    <input
                      id="url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {url && (
                      <button
                        onClick={() => setUrl('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear URL"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Fetch Comments'}
                </button>
              </form>

              {fetchStats && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-500">Total Comments</p>
                      <p className="mt-1 text-2xl font-semibold text-blue-600">{formatNumber(fetchStats.totalComments)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-500">Fetched Comments</p>
                      <p className="mt-1 text-2xl font-semibold text-green-600">{formatNumber(fetchStats.fetchedComments)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  ⚠️
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
         

          
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 w-full">
                      <label htmlFor="author-search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search by Author
                      </label>
                      <div className="relative">
                        <input
                          id="author-search"
                          type="text"
                          value={authorFilter}
                          onChange={(e) => {
                            setAuthorFilter(e.target.value);
                            setCurrentPage(1);
                            if (e.target.value) {
                              document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          placeholder="Enter author name..."
                          className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {authorFilter && (
                          <button
                            onClick={() => setAuthorFilter('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Clear author filter"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex space-x-2">
                      <button
                        onClick={toggleSortOrder}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span>Sort by: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                        <span className="text-gray-400">
                          {sortOrder === 'newest' ? '↓' : '↑'}
                        </span>
                      </button>
                      <button
                        onClick={() => setShowStats(!showStats)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
                        <span className="text-gray-400">📊</span>
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const csvContent = exportToCSV(filteredAndSortedComments);
                            downloadFile(csvContent, 'youtube-comments.csv', 'csv');
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span>Export CSV</span>
                          <span className="text-gray-400">📄</span>
                        </button>
                        <button
                          onClick={() => {
                            const jsonContent = exportToJSON(filteredAndSortedComments);
                            downloadFile(jsonContent, 'youtube-comments.json', 'json');
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span>Export JSON</span>
                          <span className="text-gray-400">📋</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <AdvancedFilters
                    onFilterChange={(filters) => {
                      setAdvancedFilters(filters);
                      setCurrentPage(1);
                      // Check if any filter is active
                      const hasActiveFilter = Object.entries(filters).some(([key, value]) => {
                        if (key === 'dateRange') return value.start || value.end;
                        if (key === 'commentLength') return value.min > 0 || value.max < 1000;
                        if (key === 'tags') return value.length > 0;
                        return value !== null && value !== 0 && value !== '';
                      });
                      if (hasActiveFilter) {
                        document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    onReset={() => {
                      setAdvancedFilters({
                        dateRange: { start: '', end: '' },
                        commentLength: { min: 0, max: 1000 },
                        minLikes: 0,
                        hasLinks: null,
                        hasHashtags: null,
                        hasMentions: null,
                        isVerified: null,
                        searchText: '',
                        tags: [],
                      });
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(advancedFilters).some(([key, value]) => {
                    if (key === 'dateRange') return value.start || value.end;
                    if (key === 'commentLength') return value.min > 0 || value.max < 1000;
                    if (key === 'tags') return value.length > 0;
                    return value !== null && value !== 0 && value !== '';
                  }) && (
                    <div className="w-full">
                      <div className="text-sm text-gray-500 mb-2">Active Filters:</div>
                      <div className="flex flex-wrap gap-2">
                        {advancedFilters.dateRange.start && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            From: {new Date(advancedFilters.dateRange.start).toLocaleDateString()}
                          </span>
                        )}
                        {advancedFilters.dateRange.end && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            To: {new Date(advancedFilters.dateRange.end).toLocaleDateString()}
                          </span>
                        )}
                        {(advancedFilters.commentLength.min > 0 || advancedFilters.commentLength.max < 1000) && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Length: {advancedFilters.commentLength.min}-{advancedFilters.commentLength.max}
                          </span>
                        )}
                        {advancedFilters.minLikes > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Min Likes: {advancedFilters.minLikes}
                          </span>
                        )}
                        {advancedFilters.hasLinks !== null && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {advancedFilters.hasLinks ? 'Has Links' : 'No Links'}
                          </span>
                        )}
                        {advancedFilters.hasHashtags !== null && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {advancedFilters.hasHashtags ? 'Has Hashtags' : 'No Hashtags'}
                          </span>
                        )}
                        {advancedFilters.hasMentions !== null && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {advancedFilters.hasMentions ? 'Has Mentions' : 'No Mentions'}
                          </span>
                        )}
                        {advancedFilters.searchText && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Search: {advancedFilters.searchText}
                          </span>
                        )}
                        {advancedFilters.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Tag: {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {(authorFilter || filteredAndSortedComments.length !== comments.length) && (
                  <div className="mt-2 text-sm text-gray-500">
                    Showing {filteredAndSortedComments.length} matching comments
                  </div>
                )}
              </div>
          

          
              {comments.length > 0 && (
                <>
                

                  {/* Statistics Section */}
                  {showStats && commentStats && (
                    <div className="mb-6">
                      <Statistics 
                        stats={commentStats} 
                        onAuthorClick={(author) => {
                          setAuthorFilter(author);
                          setCurrentPage(1);
                          document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                      <div className="mt-6">
                        <SentimentAnalysis comments={comments} />
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div id="comments-section" className="space-y-6">
                    {paginatedComments.map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        onAuthorClick={handleAuthorClick}
                        formatDate={formatDate}
                        formatNumber={formatNumber}
                        onCommentClick={handleCommentClick}
                        selectedComment={selectedComment}
                        analyzing={analyzing}
                        commentAnalysis={commentAnalysis}
                        authorFilter={authorFilter}
                      />
                    ))}
                  </div>

                  <Pagination />
                </> 
              )}
         

        </div>
    </div>
  );
}
