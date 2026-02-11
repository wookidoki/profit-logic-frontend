import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectApi } from './projectApi';
import api from './axios';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('projectApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculate → POST /v1/analysis/calculate', async () => {
    const mockData = { price: 10000, variable_cost: 5000, fixed_cost: 100000, work_hours: 160, hourly_wage: 9860, target_profit: 0 };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await projectApi.calculate(mockData);
    expect(api.post).toHaveBeenCalledWith('/v1/analysis/calculate', mockData);
  });

  it('aiParse → POST /v1/ai/parse', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await projectApi.aiParse('쿠키 3000원 변동비 1000원');
    expect(api.post).toHaveBeenCalledWith('/v1/ai/parse', { text: '쿠키 3000원 변동비 1000원' });
  });

  it('create → POST /v1/projects', async () => {
    const req = { title: '테스트', price: 1000, variable_cost: 500, fixed_cost: 50000, work_hours: 160, hourly_wage: 9860 };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: { id: 1 } } });

    await projectApi.create(req);
    expect(api.post).toHaveBeenCalledWith('/v1/projects', req);
  });

  it('getAll → GET /v1/projects', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

    await projectApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/v1/projects');
  });

  it('getById → GET /v1/projects/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: {} } });

    await projectApi.getById(5);
    expect(api.get).toHaveBeenCalledWith('/v1/projects/5');
  });

  it('update → PUT /v1/projects/:id', async () => {
    const req = { title: '수정', price: 2000, variable_cost: 1000, fixed_cost: 60000, work_hours: 200, hourly_wage: 10000, is_public: true };
    vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: {} } });

    await projectApi.update(5, req);
    expect(api.put).toHaveBeenCalledWith('/v1/projects/5', req);
  });

  it('delete → DELETE /v1/projects/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await projectApi.delete(5);
    expect(api.delete).toHaveBeenCalledWith('/v1/projects/5');
  });
});
