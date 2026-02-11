import { describe, it, expect, vi, beforeEach } from 'vitest';
import { communityApi } from './communityApi';
import api from './axios';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('communityApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPosts → GET /v1/community/posts (기본 page=0, size=10)', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { content: [] } } });

    await communityApi.getPosts();
    expect(api.get).toHaveBeenCalledWith('/v1/community/posts', {
      params: { page: 0, size: 10, sort: 'createdAt,desc' },
    });
  });

  it('getPosts → 커스텀 페이지네이션 전달', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { content: [] } } });

    await communityApi.getPosts(2, 20);
    expect(api.get).toHaveBeenCalledWith('/v1/community/posts', {
      params: { page: 2, size: 20, sort: 'createdAt,desc' },
    });
  });

  it('getPost → GET /v1/community/posts/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: {} } });

    await communityApi.getPost(10);
    expect(api.get).toHaveBeenCalledWith('/v1/community/posts/10');
  });

  it('createPost → POST /v1/community/posts', async () => {
    const req = { title: '제목', content: '내용' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await communityApi.createPost(req);
    expect(api.post).toHaveBeenCalledWith('/v1/community/posts', req);
  });

  it('deletePost → DELETE /v1/community/posts/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await communityApi.deletePost(10);
    expect(api.delete).toHaveBeenCalledWith('/v1/community/posts/10');
  });

  it('getComments → GET /v1/community/posts/:id/comments', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

    await communityApi.getComments(10);
    expect(api.get).toHaveBeenCalledWith('/v1/community/posts/10/comments');
  });

  it('createComment → POST /v1/community/posts/:id/comments', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await communityApi.createComment(10, { content: '댓글' });
    expect(api.post).toHaveBeenCalledWith('/v1/community/posts/10/comments', { content: '댓글' });
  });

  it('deleteComment → DELETE /v1/community/comments/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await communityApi.deleteComment(5);
    expect(api.delete).toHaveBeenCalledWith('/v1/community/comments/5');
  });
});
