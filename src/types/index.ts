export interface CommentData {
  id: string;
  textDisplay: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  likeCount: number;
  replyCount: number;
  publishedAt: string;
  replies?: CommentData[];
}
