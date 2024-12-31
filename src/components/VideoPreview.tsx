'use client';

import React from 'react';

interface VideoInfo {
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
}

interface VideoPreviewProps {
  videoId: string;
  videoInfo: VideoInfo;
}

export default function VideoPreview({ videoId, videoInfo }: VideoPreviewProps) {
  if (!videoId || !videoInfo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Video Player */}
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {videoInfo.title}
          </h2>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{videoInfo.channelTitle}</span>
          </div>

          <div className="text-sm text-gray-600">
            {formatDate(videoInfo.publishedAt)}
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">👁️</span>
              <span>{formatNumber(videoInfo.viewCount)} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">👍</span>
              <span>{formatNumber(videoInfo.likeCount)} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
