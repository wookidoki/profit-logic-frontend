import api from './axios';
import type { UserProfile, DailyLog, DailyLogMemoRequest } from '../types/mypage';

interface ResponseData<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const myPageApi = {
  getProfile: () =>
    api.get<ResponseData<UserProfile>>('/v1/my-page/profile'),

  getDailyLog: (date: string) =>
    api.get<ResponseData<DailyLog>>(`/v1/my-page/daily-logs/${date}`),

  getDailyLogs: (start: string, end: string) =>
    api.get<ResponseData<DailyLog[]>>('/v1/my-page/daily-logs', {
      params: { start, end },
    }),

  updateMemo: (date: string, data: DailyLogMemoRequest) =>
    api.put<ResponseData<DailyLog>>(`/v1/my-page/daily-logs/${date}/memo`, data),
};
