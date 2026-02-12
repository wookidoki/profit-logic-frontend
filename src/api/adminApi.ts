import api from './axios';
import type { ResponseData } from '../types';

export interface AdminStats {
  user_count: number;
  project_count: number;
  post_count: number;
  comment_count: number;
  report_count: number;
  chat_count: number;
}

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
  biz_type: string | null;
  project_count: number;
  created_at: string;
}

export const adminApi = {
  getStats: () =>
    api.get<ResponseData<AdminStats>>('/v1/admin/stats'),

  getUsers: () =>
    api.get<ResponseData<AdminUser[]>>('/v1/admin/users'),

  deleteUser: (userId: number) =>
    api.delete<ResponseData<null>>(`/v1/admin/users/${userId}`),

  deletePost: (postId: number) =>
    api.delete<ResponseData<null>>(`/v1/admin/posts/${postId}`),
};
