import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { extractErrorMessage } from '../api/errorUtils';
import { useAuthStore } from '../store/authStore';
import type { SignupRequest, LoginRequest } from '../types/auth';

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
      navigate('/login?signup=success');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '회원가입에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      const result = response.data.data;
      if (result) {
        setError(null);
        storeLogin(result.access_token, result.email, result.nickname, result.role);
        navigate('/');
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.'));
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
