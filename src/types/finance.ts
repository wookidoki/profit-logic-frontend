/** 계산 요청 DTO (POST /v1/projects/calculate) */
export interface CalculateRequest {
  price: number;
  variable_cost: number;
  fixed_cost: number;
  work_hours: number;
  hourly_wage: number;
  target_profit: number;
}

/** 계산 응답 DTO */
export interface CalculateResponse {
  break_even_point: number;
  operating_profit: number;
  economic_profit: number;
  target_quantity: number;
  margin_rate: number;
  contribution_margin: number;
  is_viable: boolean;
}

/** 회원가입 요청 */
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  access_token: string;
  email: string;
  nickname: string;
}

/** AI 자연어 파싱 요청 */
export interface AiParseRequest {
  text: string;
}
