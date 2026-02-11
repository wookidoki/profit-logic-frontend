/** 백엔드 통합 응답 래퍼 (ResponseData<T>) */
export interface ResponseData<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
}

/** Spring Page 응답 */
export interface Page<T> {
  content: T[];
  total_pages: number;
  total_elements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
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

/** 프로젝트 응답 (ProjectResponse) */
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

/** 게시글 응답 (BoardPostResponse) */
export interface BoardPost {
  id: number;
  title: string;
  content: string;
  author_nickname: string;
  author_id: number;
  project_id: number | null;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

/** 게시글 작성 요청 */
export interface BoardPostCreateRequest {
  title: string;
  content: string;
  project_id?: number;
}

/** 댓글 응답 (CommentResponse) */
export interface Comment {
  id: number;
  content: string;
  author_nickname: string;
  author_id: number;
  created_at: string;
}

/** 댓글 작성 요청 */
export interface CommentCreateRequest {
  content: string;
}

/** 채팅 메시지 응답 (ChatResponse) */
export interface ChatMessage {
  id: number;
  question: string;
  answer: string;
  tokens_used: number;
  created_at: string;
}

/** 채팅 요청 */
export interface ChatRequest {
  project_id: number;
  question: string;
}

/** 시뮬레이션 응답 (SimulationResponse) */
export interface Simulation {
  id: number;
  project_id: number;
  scenario_name: string;
  result_json: string;
  created_at: string;
}

/** 시뮬레이션 생성 요청 */
export interface SimulationCreateRequest {
  project_id: number;
  scenario_name: string;
  result_json: string;
}
