const krwFormatter = new Intl.NumberFormat('ko-KR');

export function formatKRW(value: number | null | undefined): string {
  if (value == null) return '0원';
  return krwFormatter.format(Math.round(value)) + '원';
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '0.00%';
  return value.toFixed(2) + '%';
}

export function formatQuantity(value: number | null | undefined): string {
  if (value == null) return '0개';
  return krwFormatter.format(Math.ceil(value)) + '개';
}
