/** 사업 유형 */
export type BizType = 'CREATOR' | 'SELLER' | 'DEVELOPER';

/** 사용자 */
export interface User {
  id: number;
  email: string;
  bizType: BizType;
  createdAt: string;
  updatedAt: string;
}

/** 프로젝트 (사업 단위) */
export interface Project {
  id: number;
  userId: number;
  title: string;
  price: number;
  variableCost: number;
  fixedCost: number;
  workHours: number;
  hourlyWage: number;
  createdAt: string;
  updatedAt: string;
}

/** 시뮬레이션 기록 */
export interface Simulation {
  id: number;
  projectId: number;
  scenarioName: string;
  marginRate: number;
  isViable: boolean;
  createdAt: string;
}

/** 계산 요청 DTO */
export interface CalculateRequest {
  price: number;
  variableCost: number;
  fixedCost: number;
  workHours: number;
  hourlyWage: number;
  targetProfit: number;
}

/** 계산 응답 DTO */
export interface CalculateResponse {
  breakEvenPoint: number;
  operatingProfit: number;
  economicProfit: number;
  targetQuantity: number;
  marginRate: number;
  contributionMargin: number;
  isViable: boolean;
}

/** 에러 응답 */
export interface ErrorResponse {
  status: number;
  message: string;
  errors: string[];
  timestamp: string;
}
