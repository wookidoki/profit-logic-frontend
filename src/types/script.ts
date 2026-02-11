import type { CalculateResponse } from './finance';

/** 크리에이터 카테고리 */
export type CreatorCategory =
  | 'WEB_NOVEL'
  | 'SHORT_FORM'
  | 'EMOTICON'
  | 'BLOG'
  | 'INDIE_DEV';

/** 카테고리 정보 */
export interface CategoryInfo {
  category: CreatorCategory;
  display_name: string;
  description: string;
}

/** 스크립트 필드 정의 */
export interface ScriptField {
  field_key: string;
  label: string;
  field_type: string;
  default_value: unknown;
  placeholder: string | null;
  unit: string | null;
  options: string[] | null;
  required: boolean;
  min: number | null;
  max: number | null;
  help_text: string | null;
  auto_calculate: boolean;
  formula: string | null;
}

/** 스크립트 섹션 */
export interface ScriptSection {
  section_title: string;
  fields: ScriptField[];
}

/** 스크립트 템플릿 */
export interface ScriptTemplate {
  category: CreatorCategory;
  display_name: string;
  description: string;
  sections: ScriptSection[];
}

/** 스크립트 분석 요청 */
export interface ScriptAnalysisRequest {
  category: CreatorCategory;
  inputs: Record<string, unknown>;
}

/** 스크립트 분석 응답 */
export interface ScriptAnalysisResponse {
  category: CreatorCategory;
  display_name: string;
  inputs: Record<string, unknown>;
  result: CalculateResponse;
}
