import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { SignupRequest, LoginRequest } from '../types/finance';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.signup(data);
      navigate('/login');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      const result = response.data.data;
      if (result) {
        storeLogin(result.access_token, result.email, result.nickname);
        navigate('/');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? '로그인에 실패했습니다.');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  return { signup, login, logout, loading, error };
}
