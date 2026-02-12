import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import {
  AddButton, ErrorBanner, LoadingText, DeleteBtn,
  EmptyState, EmptyIcon, EmptySub,
} from '../styles/shared';
import { costApi } from '../api/costApi';
import { formatKRW } from '../utils/formatNumber';
import CostForm from './CostForm';
import { CATEGORY_LABELS, COST_TYPE_LABELS } from '../constants';
import type { CostDetail, CostDetailCreateRequest, CostCategory, CostType } from '../types';

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
  color: ${theme.colors.text};
`;

/* ── 테이블 ── */

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.surface};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Th = styled.th<{ $align?: string }>`
  padding: 0.625rem 0.75rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.background};
  border-bottom: 1px solid #f1f3f5;
  white-space: nowrap;
`;

const Td = styled.td<{ $align?: string; $mono?: boolean; $muted?: boolean }>`
  padding: 0.625rem 0.75rem;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.8125rem;
  color: ${({ $muted }) => ($muted ? '#adb5bd' : '#495057')};
  font-family: ${({ $mono }) => ($mono ? "'JetBrains Mono', monospace" : 'inherit')};
  border-bottom: 1px solid ${theme.colors.background};
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
  background: ${({ $type }) => ($type === 'FIXED' ? `${theme.colors.primary}15` : `${theme.colors.success}15`)};
  color: ${({ $type }) => ($type === 'FIXED' ? theme.colors.primary : theme.colors.success)};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

/* ── 소계 ── */

const SubtotalSection = styled.div`
  background: ${theme.colors.surface};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SubtotalTitle = styled.h4`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
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
  background: ${theme.colors.background};
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
  color: ${theme.colors.text};
`;

const TotalItem = styled(SubtotalItem)`
  background: ${theme.colors.primary}10;
`;

const TotalValue = styled(SubtotalValue)`
  color: ${theme.colors.primary};
`;


