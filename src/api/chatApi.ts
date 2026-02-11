import api from './axios';
import type { ResponseData, ChatMessage, ChatRequest } from '../types';

export const chatApi = {
  /** 채팅 메시지 전송 */
  send: (data: ChatRequest) =>
    api.post<ResponseData<ChatMessage>>('/v1/chat', data),

  /** 채팅 히스토리 조회 */
  getHistory: (projectId: number) =>
    api.get<ResponseData<ChatMessage[]>>(`/v1/chat/history/${projectId}`),
};
