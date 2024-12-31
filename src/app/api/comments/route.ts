import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const youtube = google.youtube('v3');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { message: 'Video ID is required' },
        { status: 400 }
      );
    }

    const auth = process.env.YOUTUBE_API_KEY;
    if (!auth) {
      return NextResponse.json(
        { message: 'YouTube API key is not configured' },
        { status: 500 }
      );
    }

    // First, get video statistics to get the total comment count
    const videoResponse = await youtube.videos.list({
      key: auth,
      part: ['snippet', 'statistics'],
      id: [videoId],
    });

    const videoInfo = videoResponse.data.items?.[0];
    if (!videoInfo) {
      return NextResponse.json({ 
        message: 'Video not found',
        error: 'Video not found'
      }, { status: 404 });
    }

    const totalCommentCount = videoInfo.statistics?.commentCount || '0';

    // Fetch top-level comments
    const response = await youtube.commentThreads.list({
      key: auth,
      part: ['snippet', 'replies'],
      videoId: videoId,
      maxResults: 100,
      order: 'relevance',
    });

    if (!response.data.items) {
      return NextResponse.json({ comments: [], totalComments: 0 });
    }

    const comments = response.data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        textDisplay: snippet.textDisplay,
        authorDisplayName: snippet.authorDisplayName,
        authorProfileImageUrl: snippet.authorProfileImageUrl,
        likeCount: snippet.likeCount,
        replyCount: item.snippet.totalReplyCount,
        publishedAt: snippet.publishedAt,
        replies: item.replies?.comments?.map((reply: any) => ({
          id: reply.id,
          textDisplay: reply.snippet.textDisplay,
          authorDisplayName: reply.snippet.authorDisplayName,
          authorProfileImageUrl: reply.snippet.authorProfileImageUrl,
          likeCount: reply.snippet.likeCount,
          replyCount: 0,
          publishedAt: reply.snippet.publishedAt,
        })) || [],
      };
    });

    // Calculate total replies for the fetched comments
    const repliesCount = comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0);
    const fetchedCommentsCount = comments.length + repliesCount;

    return NextResponse.json({ 
      comments,
      totalComments: parseInt(totalCommentCount),
      fetchedComments: fetchedCommentsCount,
      videoInfo: {
        title: videoInfo.snippet?.title,
        channelTitle: videoInfo.snippet?.channelTitle,
        publishedAt: videoInfo.snippet?.publishedAt,
        thumbnailUrl: videoInfo.snippet?.thumbnails?.high?.url,
        viewCount: videoInfo.statistics?.viewCount,
        likeCount: videoInfo.statistics?.likeCount,
      }
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch comments',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
