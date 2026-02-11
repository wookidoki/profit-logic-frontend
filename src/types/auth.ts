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
