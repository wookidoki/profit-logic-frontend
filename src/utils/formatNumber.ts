const krwFormatter = new Intl.NumberFormat('ko-KR');

export function formatKRW(value: number): string {
  return krwFormatter.format(Math.round(value)) + '원';
}

export function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}

export function formatQuantity(value: number): string {
  return krwFormatter.format(Math.ceil(value)) + '개';
}
