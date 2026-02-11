import { useState } from 'react';
import styled from 'styled-components';
import {
  InlineFormCard, FormRow, FormGroup, FormLabelSm,
  FormInputSm, FormActions, SecondaryButton, PrimaryButtonSm,
} from '../styles/shared';
import type { TimeLogCreateRequest } from '../types';

interface Props {
  onSubmit: (data: TimeLogCreateRequest) => Promise<void>;
  onCancel: () => void;
}

export default function TimeLogForm({ onSubmit, onCancel }: Props) {
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
    <InlineFormCard>
      <FormTitle>작업시간 기록</FormTitle>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup $flex={2}>
            <FormLabelSm>작업명</FormLabelSm>
            <FormInputSm
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="예: 캐릭터 디자인 작업"
            />
          </FormGroup>
          <FormGroup>
            <FormLabelSm>작업시간</FormLabelSm>
            <FormInputSm
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
            <FormLabelSm>날짜</FormLabelSm>
            <FormInputSm
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <FormLabelSm>메모 (선택)</FormLabelSm>
          <FormInputSm
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 표정 변형 5종 완성"
          />
        </FormGroup>

        <FormActions>
          <SecondaryButton type="button" onClick={onCancel}>취소</SecondaryButton>
          <PrimaryButtonSm type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '기록'}
          </PrimaryButtonSm>
        </FormActions>
      </Form>
    </InlineFormCard>
  );
}

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
