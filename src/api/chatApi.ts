import api from './axios';
import type { ResponseData } from '../types';
import type { ChatRequest, ChatResponse } from '../types/chat';

export const chatApi = {
  send: (data: ChatRequest) =>
    api.post<ResponseData<ChatResponse>>('/v1/chat', data),

  getHistory: (projectId: number) =>
    api.get<ResponseData<ChatResponse[]>>(`/v1/chat/history/${projectId}`),
};
