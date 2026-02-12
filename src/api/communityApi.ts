import api from './axios';
import type { ResponseData } from '../types';
import type {
  BoardPost,
  BoardPostCreateRequest,
  Comment,
  CommentCreateRequest,
  PageResponse,
} from '../types/community';

export const communityApi = {
  getPosts: (page = 0, size = 10) =>
    api.get<ResponseData<PageResponse<BoardPost>>>(
      `/v1/community/posts?page=${page}&size=${size}`
    ),

  getPost: (postId: number) =>
    api.get<ResponseData<BoardPost>>(`/v1/community/posts/${postId}`),

  createPost: (data: BoardPostCreateRequest) =>
    api.post<ResponseData<BoardPost>>('/v1/community/posts', data),

  deletePost: (postId: number) =>
    api.delete<ResponseData<void>>(`/v1/community/posts/${postId}`),

  getComments: (postId: number) =>
    api.get<ResponseData<Comment[]>>(
      `/v1/community/posts/${postId}/comments`
    ),

  createComment: (postId: number, data: CommentCreateRequest) =>
    api.post<ResponseData<Comment>>(
      `/v1/community/posts/${postId}/comments`,
      data
    ),

  deleteComment: (commentId: number) =>
    api.delete<ResponseData<void>>(`/v1/community/comments/${commentId}`),
};
