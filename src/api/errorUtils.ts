import type { AxiosError } from 'axios';

interface ApiErrorData {
  message?: string;
}

export function extractErrorMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as AxiosError<ApiErrorData>;
    return axiosErr.response?.data?.message ?? fallback;
  }
  if (error instanceof Error && error.message === 'Network Error') {
    return '네트워크 연결을 확인해주세요.';
  }
  return fallback;
}
