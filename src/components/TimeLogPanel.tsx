import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { timeLogApi } from '../api/timeLogApi';
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

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, totalRes] = await Promise.all([
        timeLogApi.getByProject(projectId),
        timeLogApi.getTotal(projectId),
      ]);
      if (logsRes.data.success && logsRes.data.data) {
        setLogs(logsRes.data.data);
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
    fetchData();
  }, [fetchData]);

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

  if (loading) return <LoadingText>작업시간 로딩 중...</LoadingText>;

  return (
    <Panel>
      <PanelHeader>
        <PanelLeft>
          <PanelTitle>작업시간 기록</PanelTitle>
          <TotalBadge>누적 {totalHours.toFixed(1)}시간</TotalBadge>
        </PanelLeft>
        <AddButton onClick={() => setShowForm(true)}>+ 시간 기록</AddButton>
      </PanelHeader>

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

/* ── 시간 기록 인라인 폼 ── */

interface TimeLogFormProps {
  onSubmit: (data: TimeLogCreateRequest) => Promise<void>;
  onCancel: () => void;
}

function TimeLogForm({ onSubmit, onCancel }: TimeLogFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [taskName, setTaskName] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [logDate, setLogDate] = useState(today);
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return alert('작업명을 입력해주세요.');
    const hours = Number(hoursSpent);
    if (!hours || hours < 0.1 || hours > 24) return alert('작업시간은 0.1~24시간 사이로 입력해주세요.');
    if (!logDate) return alert('날짜를 선택해주세요.');

    setSubmitting(true);
    try {
      await onSubmit({
        task_name: taskName.trim(),
        hours_spent: hours,
        log_date: logDate,
        memo: memo.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard>
      <FormTitle>작업시간 기록</FormTitle>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup $flex={2}>
            <Label>작업명</Label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="예: 캐릭터 디자인 작업"
            />
          </FormGroup>
          <FormGroup>
            <Label>작업시간</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              placeholder="예: 3.5"
            />
          </FormGroup>
          <FormGroup>
            <Label>날짜</Label>
            <Input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>메모 (선택)</Label>
          <Input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 표정 변형 5종 완성"
          />
        </FormGroup>

        <FormActions>
          <CancelButton type="button" onClick={onCancel}>취소</CancelButton>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '기록'}
          </SubmitButton>
        </FormActions>
      </Form>
    </FormCard>
  );
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

const AddButton = styled.button`
  padding: 0.375rem 0.875rem;
  background: #4361ee;
  color: #fff;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;

  p {
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const EmptySub = styled.span`
  font-size: 0.8125rem;
  color: #adb5bd;
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

const DeleteBtn = styled.button`
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 4px;
  font-size: 0.6875rem;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

/* ── 폼 ── */

const FormCard = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1.25rem;
`;

const FormTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div<{ $flex?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: ${({ $flex }) => $flex || 1};
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6c757d;
`;

const Input = styled.input`
  padding: 0.5rem 0.625rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    border-color: #adb5bd;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
