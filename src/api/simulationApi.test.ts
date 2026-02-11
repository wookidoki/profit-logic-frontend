import { describe, it, expect, vi, beforeEach } from 'vitest';
import { simulationApi } from './simulationApi';
import api from './axios';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('simulationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('save → POST /v1/simulations', async () => {
    const req = { project_id: 10, scenario_name: '기본', result_json: '{"bep":18}' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: {} } });

    await simulationApi.save(req);
    expect(api.post).toHaveBeenCalledWith('/v1/simulations', req);
  });

  it('getByProject → GET /v1/simulations/project/:projectId', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } });

    await simulationApi.getByProject(10);
    expect(api.get).toHaveBeenCalledWith('/v1/simulations/project/10');
  });

  it('delete → DELETE /v1/simulations/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    await simulationApi.delete(5);
    expect(api.delete).toHaveBeenCalledWith('/v1/simulations/5');
  });
});
