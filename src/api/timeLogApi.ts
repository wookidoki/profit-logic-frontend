import api from './axios';
import type { ResponseData, TimeLog, TimeLogCreateRequest } from '../types';

export const timeLogApi = {
  /** 프로젝트별 작업시간 목록 (날짜 범위 필터 선택) */
  getByProject: (projectId: number, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return api.get<ResponseData<TimeLog[]>>(
      `/v1/projects/${projectId}/timelogs${qs ? `?${qs}` : ''}`,
    );
  },

  /** 프로젝트 전체 누적 시간 */
  getTotal: (projectId: number) =>
    api.get<ResponseData<number>>(`/v1/projects/${projectId}/timelogs/total`),

  /** 작업시간 추가 */
  create: (projectId: number, data: TimeLogCreateRequest) =>
    api.post<ResponseData<TimeLog>>(`/v1/projects/${projectId}/timelogs`, data),

  /** 작업시간 삭제 */
  delete: (timeLogId: number) =>
    api.delete<ResponseData<void>>(`/v1/timelogs/${timeLogId}`),
};
