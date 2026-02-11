import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatApi } from './chatApi';
import api from './axios';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('send → POST /v1/chat', async () => {
    const req = { project_id: 10, question: '손익분기점 알려줘' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await chatApi.send(req);
    expect(api.post).toHaveBeenCalledWith('/v1/chat', req);
  });

  it('getHistory → GET /v1/chat/history/:projectId', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

    await chatApi.getHistory(10);
    expect(api.get).toHaveBeenCalledWith('/v1/chat/history/10');
  });
});
