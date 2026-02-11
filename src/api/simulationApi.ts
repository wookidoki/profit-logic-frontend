import api from './axios';
import type { ResponseData, Simulation, SimulationCreateRequest } from '../types';

export const simulationApi = {
  /** 시뮬레이션 저장 */
  save: (data: SimulationCreateRequest) =>
    api.post<ResponseData<Simulation>>('/v1/simulations', data),

  /** 프로젝트별 시뮬레이션 목록 */
  getByProject: (projectId: number) =>
    api.get<ResponseData<Simulation[]>>(`/v1/simulations/project/${projectId}`),

  /** 시뮬레이션 삭제 */
  delete: (simulationId: number) =>
    api.delete<ResponseData<void>>(`/v1/simulations/${simulationId}`),
};
