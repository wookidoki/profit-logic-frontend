import api from './axios';
import type { ResponseData, CostDetail, CostDetailCreateRequest, CsvUploadResponse } from '../types';

export const costApi = {
  /** 프로젝트별 비용 목록 */
  getByProject: (projectId: number) =>
    api.get<ResponseData<CostDetail[]>>(`/v1/projects/${projectId}/costs`),

  /** 비용 추가 */
  create: (projectId: number, data: CostDetailCreateRequest) =>
    api.post<ResponseData<CostDetail>>(`/v1/projects/${projectId}/costs`, data),

  /** CSV 파일로 비용 일괄 업로드 */
  uploadCsv: (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ResponseData<CsvUploadResponse>>(
      `/v1/projects/${projectId}/costs/csv`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  /** 비용 삭제 */
  delete: (costDetailId: number) =>
    api.delete<ResponseData<void>>(`/v1/costs/${costDetailId}`),
};
