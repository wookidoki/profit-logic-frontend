import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  AddButton, ErrorBanner, LoadingText, DeleteBtn,
  EmptyState, EmptyIcon, EmptySub,
} from '../styles/shared';
import { timeLogApi } from '../api/timeLogApi';
import { getDateRange, filterByDateRange } from '../utils/dateFilter';
import TimeLogForm from './TimeLogForm';
import type { DateFilterType } from '../utils/dateFilter';
import type { TimeLog, TimeLogCreateRequest } from '../types';

interface Props {
  projectId: number;
}

export default function TimeLogPanel({ projectId }: Props) {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  const fetchData = useCallback(async (filter: DateFilterType) => {
    setLoading(true);
    try {
      const range = getDateRange(filter);
      const [logsRes, totalRes] = await Promise.all([
        timeLogApi.getByProject(projectId, range.from, range.to),
        timeLogApi.getTotal(projectId),
      ]);
      if (logsRes.data.success && logsRes.data.data) {
        // 서버 필터 + 클라이언트 fallback
        setLogs(filterByDateRange(logsRes.data.data, range));
      }
      if (totalRes.data.success && totalRes.data.data != null) {
        setTotalHours(totalRes.data.data);
      }
    } catch {
      setError('작업시간 기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData(dateFilter);
  }, [fetchData, dateFilter]);

  const handleDelete = async (logId: number) => {
    if (!confirm('이 작업시간 기록을 삭제하시겠습니까?')) return;
    try {
      await timeLogApi.delete(logId);
      const deleted = logs.find((l) => l.id === logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      if (deleted) setTotalHours((prev) => prev - deleted.hours_spent);
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleCreate = async (data: TimeLogCreateRequest) => {
    try {
      const res = await timeLogApi.create(projectId, data);
      if (res.data.success && res.data.data) {
        setLogs((prev) => [res.data.data!, ...prev]);
        setTotalHours((prev) => prev + res.data.data!.hours_spent);
        setShowForm(false);
      } else {
        alert(res.data.message || '작업시간 추가에 실패했습니다.');
      }
    } catch {
      alert('작업시간 추가에 실패했습니다.');
    }
  };

  // 날짜별 그룹핑
  const grouped = logs.reduce<Record<string, TimeLog[]>>((acc, log) => {
    const date = log.log_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const filteredHours = logs.reduce((sum, l) => sum + l.hours_spent, 0);

  if (loading) return <LoadingText>작업시간 로딩 중...</LoadingText>;

  return (
    <Panel>
      <PanelHeader>
        <PanelLeft>
          <PanelTitle>작업시간 기록</PanelTitle>
          <TotalBadge>누적 {totalHours.toFixed(1)}시간</TotalBadge>
          {dateFilter !== 'all' && (
            <FilteredBadge>필터 {filteredHours.toFixed(1)}시간</FilteredBadge>
          )}
        </PanelLeft>
        <AddButton onClick={() => setShowForm(true)}>+ 시간 기록</AddButton>
      </PanelHeader>

      <FilterBar>
        <FilterButton $active={dateFilter === 'all'} onClick={() => setDateFilter('all')}>
          전체
        </FilterButton>
        <FilterButton $active={dateFilter === 'month'} onClick={() => setDateFilter('month')}>
          이번 달
        </FilterButton>
        <FilterButton $active={dateFilter === 'week'} onClick={() => setDateFilter('week')}>
          이번 주
        </FilterButton>
      </FilterBar>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {showForm && (
        <TimeLogForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {logs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>⏱️</EmptyIcon>
          <p>기록된 작업시간이 없습니다</p>
          <EmptySub>상단의 "시간 기록" 버튼으로 작업시간을 등록해보세요.</EmptySub>
        </EmptyState>
      ) : (
        <LogList>
          {sortedDates.map((date) => (
            <DateGroup key={date}>
              <DateHeader>
                <DateLabel>{formatDate(date)}</DateLabel>
                <DateTotal>
                  {grouped[date].reduce((s, l) => s + l.hours_spent, 0).toFixed(1)}시간
                </DateTotal>
              </DateHeader>
              {grouped[date].map((log) => (
                <LogItem key={log.id}>
                  <LogMain>
                    <TaskName>{log.task_name}</TaskName>
                    <LogMeta>
                      <HoursBadge>{log.hours_spent.toFixed(1)}h</HoursBadge>
                      {log.memo && <Memo>{log.memo}</Memo>}
                    </LogMeta>
                  </LogMain>
                  <DeleteBtn onClick={() => handleDelete(log.id)}>삭제</DeleteBtn>
                </LogItem>
              ))}
            </DateGroup>
          ))}
        </LogList>
      )}
    </Panel>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  return `${month}월 ${day}일 (${dow})`;
}

/* ── styled-components ── */

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const TotalBadge = styled.span`
  padding: 0.25rem 0.625rem;
  background: #4361ee15;
  color: #4361ee;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const FilteredBadge = styled.span`
  padding: 0.25rem 0.625rem;
  background: #06d6a015;
  color: #06d6a0;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.25rem;
  width: fit-content;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.375rem 0.75rem;
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4361ee' : '#6c757d')};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none')};
  transition: all 0.2s;

  &:hover {
    color: #4361ee;
  }
`;

/* ── 로그 리스트 ── */

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DateGroup = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const DateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #f1f3f5;
`;

const DateLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #495057;
`;

const DateTotal = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4361ee;
`;

const LogItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }
`;

const LogMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TaskName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
`;

const LogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HoursBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4361ee;
`;

const Memo = styled.span`
  font-size: 0.75rem;
  color: #adb5bd;
`;


