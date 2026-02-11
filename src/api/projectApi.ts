import api from './axios';
import type { ResponseData, Project, ProjectCreateRequest, ProjectUpdateRequest } from '../types';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

export const projectApi = {
  /** 수익성 계산 (비인증) */
  calculate: (data: CalculateRequest) =>
    api.post<ResponseData<CalculateResponse>>('/v1/analysis/calculate', data),

  /** AI 자연어 파싱 (비인증) */
  aiParse: (text: string) =>
    api.post<ResponseData<CalculateRequest>>('/v1/ai/parse', { text }),

  /** 프로젝트 생성 */
  create: (data: ProjectCreateRequest) =>
    api.post<ResponseData<Project>>('/v1/projects', data),

  /** 내 프로젝트 목록 */
  getAll: () =>
    api.get<ResponseData<Project[]>>('/v1/projects'),

  /** 프로젝트 상세 */
  getById: (id: number) =>
    api.get<ResponseData<Project>>(`/v1/projects/${id}`),

  /** 프로젝트 수정 */
  update: (id: number, data: ProjectUpdateRequest) =>
    api.put<ResponseData<Project>>(`/v1/projects/${id}`, data),

  /** 프로젝트 삭제 */
  delete: (id: number) =>
    api.delete<ResponseData<void>>(`/v1/projects/${id}`),
};
