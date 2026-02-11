import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

export function useCalculate() {
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (data: CalculateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectApi.calculate(data);
      if (response.data.success && response.data.data) {
        setResult(response.data.data);
      } else {
        setError(response.data.message ?? '계산에 실패했습니다.');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? '계산 요청에 실패했습니다.');
      } else {
        setError('계산 요청에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, calculate, reset };
}
