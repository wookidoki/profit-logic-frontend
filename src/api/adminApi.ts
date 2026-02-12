import api from './axios';
import type { ResponseData } from '../types';

export interface AdminStats {
  userCount: number;
  projectCount: number;
  postCount: number;
  commentCount: number;
  reportCount: number;
  chatCount: number;
}

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
  bizType: string | null;
  projectCount: number;
  createdAt: string;
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
