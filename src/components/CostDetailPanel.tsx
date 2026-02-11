import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { costApi } from '../api/costApi';
import { formatKRW } from '../utils/formatNumber';
import type { CostDetail, CostDetailCreateRequest, CostCategory, CostType } from '../types';

const CATEGORY_LABELS: Record<CostCategory, string> = {
  API_USAGE: 'API 사용료',
  SERVER: '서버비',
  TOOL_SUBSCRIPTION: '도구 구독료',
  MATERIAL: '재료비',
  MARKETING: '마케팅비',
  OUTSOURCING: '외주비',
  OTHER: '기타',
};

const COST_TYPE_LABELS: Record<CostType, string> = {
  FIXED: '고정비',
  VARIABLE: '변동비',
};

const CATEGORIES: CostCategory[] = [
  'API_USAGE', 'SERVER', 'TOOL_SUBSCRIPTION', 'MATERIAL', 'MARKETING', 'OUTSOURCING', 'OTHER',
];

interface Props {
  projectId: number;
}

export default function CostDetailPanel({ projectId }: Props) {
  const [costs, setCosts] = useState<CostDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await costApi.getByProject(projectId);
      if (res.data.success && res.data.data) {
        setCosts(res.data.data);
      }
    } catch {
      setError('비용 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const handleDelete = async (costId: number) => {
    if (!confirm('이 비용 항목을 삭제하시겠습니까?')) return;
    try {
      await costApi.delete(costId);
      setCosts((prev) => prev.filter((c) => c.id !== costId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleCreate = async (data: CostDetailCreateRequest) => {
    try {
      const res = await costApi.create(projectId, data);
      if (res.data.success && res.data.data) {
        setCosts((prev) => [...prev, res.data.data!]);
        setShowForm(false);
      } else {
        alert(res.data.message || '비용 추가에 실패했습니다.');
      }
    } catch {
      alert('비용 추가에 실패했습니다.');
    }
  };

  // 카테고리별 소계
  const subtotals = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {});

  const totalAmount = costs.reduce((sum, c) => sum + c.amount, 0);

  if (loading) return <LoadingText>비용 목록 로딩 중...</LoadingText>;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>비용 상세 내역</PanelTitle>
        <AddButton onClick={() => setShowForm(true)}>+ 비용 추가</AddButton>
      </PanelHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {showForm && (
        <CostForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {costs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <p>등록된 비용이 없습니다</p>
          <EmptySub>상단의 "비용 추가" 버튼으로 비용을 등록해보세요.</EmptySub>
        </EmptyState>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>카테고리</Th>
                <Th>비용명</Th>
                <Th>유형</Th>
                <Th $align="right">금액</Th>
                <Th>메모</Th>
                <Th $align="center">삭제</Th>
              </tr>
            </thead>
            <tbody>
              {costs.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <CategoryBadge>{CATEGORY_LABELS[c.category]}</CategoryBadge>
                  </Td>
                  <Td>{c.cost_name}</Td>
                  <Td>
                    <TypeBadge $type={c.cost_type}>
                      {COST_TYPE_LABELS[c.cost_type]}
                    </TypeBadge>
                  </Td>
                  <Td $align="right" $mono>{formatKRW(c.amount)}</Td>
                  <Td $muted>{c.memo || '-'}</Td>
                  <Td $align="center">
                    <DeleteBtn onClick={() => handleDelete(c.id)}>삭제</DeleteBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <SubtotalSection>
            <SubtotalTitle>카테고리별 소계</SubtotalTitle>
            <SubtotalGrid>
              {Object.entries(subtotals).map(([cat, amount]) => (
                <SubtotalItem key={cat}>
                  <SubtotalLabel>{CATEGORY_LABELS[cat as CostCategory]}</SubtotalLabel>
                  <SubtotalValue>{formatKRW(amount)}</SubtotalValue>
                </SubtotalItem>
              ))}
              <TotalItem>
                <SubtotalLabel>합계</SubtotalLabel>
                <TotalValue>{formatKRW(totalAmount)}</TotalValue>
              </TotalItem>
            </SubtotalGrid>
          </SubtotalSection>
        </>
      )}
    </Panel>
  );
}

/* ── 비용 추가 인라인 폼 ── */

interface CostFormProps {
  onSubmit: (data: CostDetailCreateRequest) => Promise<void>;
  onCancel: () => void;
}

function CostForm({ onSubmit, onCancel }: CostFormProps) {
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
    <FormCard>
      <FormTitle>비용 추가</FormTitle>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label>카테고리</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as CostCategory)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>유형</Label>
            <Select value={costType} onChange={(e) => setCostType(e.target.value as CostType)}>
              <option value="FIXED">고정비</option>
              <option value="VARIABLE">변동비</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup $flex={2}>
            <Label>비용명</Label>
            <Input
              value={costName}
              onChange={(e) => setCostName(e.target.value)}
              placeholder="예: ChatGPT API 월 사용료"
            />
          </FormGroup>
          <FormGroup>
            <Label>금액 (원)</Label>
            <Input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 30000"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>메모 (선택)</Label>
          <Input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: GPT-4o 기준 월 평균"
          />
        </FormGroup>

        <FormActions>
          <CancelButton type="button" onClick={onCancel}>취소</CancelButton>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '추가'}
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

const PanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
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

/* ── 테이블 ── */

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Th = styled.th<{ $align?: string }>`
  padding: 0.625rem 0.75rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  background: #f8f9fa;
  border-bottom: 1px solid #f1f3f5;
  white-space: nowrap;
`;

const Td = styled.td<{ $align?: string; $mono?: boolean; $muted?: boolean }>`
  padding: 0.625rem 0.75rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.8125rem;
  color: ${({ $muted }) => ($muted ? '#adb5bd' : '#495057')};
  font-family: ${({ $mono }) => ($mono ? "'JetBrains Mono', monospace" : 'inherit')};
  border-bottom: 1px solid #f8f9fa;
  white-space: nowrap;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TypeBadge = styled.span<{ $type: CostType }>`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: ${({ $type }) => ($type === 'FIXED' ? '#4361ee15' : '#06d6a015')};
  color: ${({ $type }) => ($type === 'FIXED' ? '#4361ee' : '#06d6a0')};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const DeleteBtn = styled.button`
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 4px;
  font-size: 0.6875rem;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }
`;

/* ── 소계 ── */

const SubtotalSection = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SubtotalTitle = styled.h4`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.75rem;
`;

const SubtotalGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SubtotalItem = styled.div`
  flex: 1;
  min-width: 100px;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SubtotalLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.125rem;
`;

const SubtotalValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const TotalItem = styled(SubtotalItem)`
  background: #4361ee10;
`;

const TotalValue = styled(SubtotalValue)`
  color: #4361ee;
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

const Select = styled.select`
  padding: 0.5rem 0.625rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #fff;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
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
