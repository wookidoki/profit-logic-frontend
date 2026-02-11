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
