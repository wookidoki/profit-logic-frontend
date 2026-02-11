import api from './axios';
import type {
  ResponseData,
  Page,
  BoardPost,
  BoardPostCreateRequest,
  Comment,
  CommentCreateRequest,
} from '../types';

export const communityApi = {
  /** 게시글 목록 (페이지네이션) */
  getPosts: (page = 0, size = 10) =>
    api.get<ResponseData<Page<BoardPost>>>('/v1/community/posts', {
      params: { page, size, sort: 'createdAt,desc' },
    }),

  /** 게시글 상세 */
  getPost: (postId: number) =>
    api.get<ResponseData<BoardPost>>(`/v1/community/posts/${postId}`),

  /** 게시글 작성 */
  createPost: (data: BoardPostCreateRequest) =>
    api.post<ResponseData<BoardPost>>('/v1/community/posts', data),

  /** 게시글 삭제 */
  deletePost: (postId: number) =>
    api.delete<ResponseData<void>>(`/v1/community/posts/${postId}`),

  /** 댓글 목록 */
  getComments: (postId: number) =>
    api.get<ResponseData<Comment[]>>(`/v1/community/posts/${postId}/comments`),

  /** 댓글 작성 */
  createComment: (postId: number, data: CommentCreateRequest) =>
    api.post<ResponseData<Comment>>(`/v1/community/posts/${postId}/comments`, data),

  /** 댓글 삭제 */
  deleteComment: (commentId: number) =>
    api.delete<ResponseData<void>>(`/v1/community/comments/${commentId}`),
};
