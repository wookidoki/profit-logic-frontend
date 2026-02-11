export type DateFilterType = 'week' | 'month' | 'all';

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

/**
 * 선택된 필터 타입에 따라 날짜 범위를 반환한다.
 * - week: 이번 주 월요일 ~ 오늘
 * - month: 이번 달 1일 ~ 오늘
 * - all: undefined (필터 없음)
 */
export function getDateRange(filter: DateFilterType, today?: Date): DateRange {
  if (filter === 'all') {
    return { from: undefined, to: undefined };
  }

  const now = today ?? new Date();
  const to = formatISO(now);

  if (filter === 'week') {
    const day = now.getDay(); // 0=일, 1=월, ..., 6=토
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    return { from: formatISO(monday), to };
  }

  // month
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: formatISO(firstDay), to };
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 로그를 날짜 범위로 클라이언트 필터링한다.
 * (서버 필터링 실패 시 fallback)
 */
export function filterByDateRange<T extends { log_date: string }>(
  logs: T[],
  range: DateRange,
): T[] {
  if (!range.from && !range.to) return logs;
  return logs.filter((log) => {
    if (range.from && log.log_date < range.from) return false;
    if (range.to && log.log_date > range.to) return false;
    return true;
  });
}
