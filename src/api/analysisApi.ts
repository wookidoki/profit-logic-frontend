import api from './axios';
import type { ResponseData, ProjectAnalysisResponse } from '../types';

export const analysisApi = {
  /** 프로젝트 종합 분석 (CostDetail + TimeLog + BEP 통합) */
  getAnalysis: (projectId: number) =>
    api.get<ResponseData<ProjectAnalysisResponse>>(`/v1/projects/${projectId}/analysis`),
};
