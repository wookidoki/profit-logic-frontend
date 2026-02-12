import api from './axios';
import type { ResponseData, Project } from '../types';
import type {
  CategoryInfo,
  CreatorCategory,
  ScriptTemplate,
  ScriptAnalysisRequest,
  ScriptAnalysisResponse,
} from '../types/script';

export interface ScriptSaveRequest {
  category: CreatorCategory;
  inputs: Record<string, unknown>;
  title?: string;
}

export const scriptApi = {
  /** 카테고리 목록 조회 */
  getCategories: () =>
    api.get<ResponseData<CategoryInfo[]>>('/v1/scripts/categories'),

  /** 카테고리별 템플릿 조회 */
  getTemplate: (category: CreatorCategory) =>
    api.get<ResponseData<ScriptTemplate>>(`/v1/scripts/templates/${category}`),

  /** 스크립트 분석 실행 */
  analyze: (data: ScriptAnalysisRequest) =>
    api.post<ResponseData<ScriptAnalysisResponse>>('/v1/scripts/analyze', data),

  /** 스크립트 분석 결과를 프로젝트로 저장 */
  saveAsProject: (data: ScriptSaveRequest) =>
    api.post<ResponseData<Project>>('/v1/scripts/save-project', data),
};
