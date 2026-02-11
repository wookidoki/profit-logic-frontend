/** 백엔드 통합 응답 래퍼 (ResponseData<T>) */
export interface ResponseData<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
}

/** 사업 유형 */
export type BizType = 'CREATOR' | 'SELLER' | 'DEVELOPER';

/** 사용자 역할 */
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

/** 사용자 */
export interface User {
  id: number;
  email: string;
  nickname: string;
  role: Role;
  biz_type: BizType | null;
  created_at: string;
  updated_at: string;
}

/** 프로젝트 (분석 단위) */
export interface Project {
  id: number;
  title: string;
  price: number;
  variable_cost: number;
  fixed_cost: number;
  work_hours: number;
  hourly_wage: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** 프로젝트 생성 요청 */
export interface ProjectCreateRequest {
  title: string;
  price: number;
  variable_cost: number;
  fixed_cost: number;
  work_hours: number;
  hourly_wage: number;
  is_public?: boolean;
}

/** 프로젝트 수정 요청 */
export interface ProjectUpdateRequest {
  title: string;
  price: number;
  variable_cost: number;
  fixed_cost: number;
  work_hours: number;
  hourly_wage: number;
  is_public: boolean;
}

/** 시뮬레이션 기록 */
export interface SimulationLog {
  id: number;
  project_id: number;
  description: string;
  result_json: string;
  created_at: string;
  updated_at: string;
}
