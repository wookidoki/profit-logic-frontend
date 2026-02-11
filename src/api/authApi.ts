import api from './axios';
import type { ResponseData } from '../types';
import type { SignupRequest, LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  signup: (data: SignupRequest) =>
    api.post<ResponseData<null>>('/v1/auth/signup', data),

  login: (data: LoginRequest) =>
    api.post<ResponseData<LoginResponse>>('/v1/auth/login', data),
};
