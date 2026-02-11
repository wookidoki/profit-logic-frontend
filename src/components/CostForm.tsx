import { useState } from 'react';
import styled from 'styled-components';
import {
  InlineFormCard, FormRow, FormGroup, FormLabelSm,
  FormInputSm, FormSelect, FormActions, SecondaryButton, PrimaryButtonSm,
} from '../styles/shared';
import type { CostDetailCreateRequest, CostCategory, CostType } from '../types';

export const CATEGORY_LABELS: Record<CostCategory, string> = {
  API_USAGE: 'API 사용료',
  SERVER: '서버비',
  TOOL_SUBSCRIPTION: '도구 구독료',
  MATERIAL: '재료비',
  MARKETING: '마케팅비',
  OUTSOURCING: '외주비',
  OTHER: '기타',
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  FIXED: '고정비',
  VARIABLE: '변동비',
};

const CATEGORIES: CostCategory[] = [
  'API_USAGE', 'SERVER', 'TOOL_SUBSCRIPTION', 'MATERIAL', 'MARKETING', 'OUTSOURCING', 'OTHER',
];

interface Props {
  onSubmit: (data: CostDetailCreateRequest) => Promise<void>;
  onCancel: () => void;
}

export default function CostForm({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<CostCategory>('OTHER');
  const [costName, setCostName] = useState('');
  const [costType, setCostType] = useState<CostType>('FIXED');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costName.trim()) return alert('비용명을 입력해주세요.');
    if (!amount || Number(amount) <= 0) return alert('금액은 0보다 커야 합니다.');

    setSubmitting(true);
    try {
      await onSubmit({
        category,
        cost_name: costName.trim(),
        cost_type: costType,
        amount: Number(amount),
        memo: memo.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InlineFormCard>
      <FormTitle>비용 추가</FormTitle>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <FormLabelSm>카테고리</FormLabelSm>
            <FormSelect value={category} onChange={(e) => setCategory(e.target.value as CostCategory)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormLabelSm>유형</FormLabelSm>
            <FormSelect value={costType} onChange={(e) => setCostType(e.target.value as CostType)}>
              <option value="FIXED">고정비</option>
              <option value="VARIABLE">변동비</option>
            </FormSelect>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup $flex={2}>
            <FormLabelSm>비용명</FormLabelSm>
            <FormInputSm
              value={costName}
              onChange={(e) => setCostName(e.target.value)}
              placeholder="예: ChatGPT API 월 사용료"
            />
          </FormGroup>
          <FormGroup>
            <FormLabelSm>금액 (원)</FormLabelSm>
            <FormInputSm
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 30000"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <FormLabelSm>메모 (선택)</FormLabelSm>
          <FormInputSm
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: GPT-4o 기준 월 평균"
          />
        </FormGroup>

        <FormActions>
          <SecondaryButton type="button" onClick={onCancel}>취소</SecondaryButton>
          <PrimaryButtonSm type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '추가'}
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
