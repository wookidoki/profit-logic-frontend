import { useState, useCallback } from 'react';
import { projectApi } from '../api/projectApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

export function useCalculate() {
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (data: CalculateRequest) => {
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
      setError(extractErrorMessage(err, '계산 요청에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, calculate, reset };
}
