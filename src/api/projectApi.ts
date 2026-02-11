import api from './axios';
import type { ResponseData } from '../types';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

export const projectApi = {
  calculate: (data: CalculateRequest) =>
    api.post<ResponseData<CalculateResponse>>('/v1/projects/calculate', data),

  aiParse: (text: string) =>
    api.post<ResponseData<CalculateRequest>>('/v1/ai/parse', { text }),
};
