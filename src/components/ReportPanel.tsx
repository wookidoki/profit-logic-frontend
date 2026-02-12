import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { PrimaryButton, ErrorBanner } from '../styles/shared';
import { reportApi } from '../api/reportApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { ReportResponse } from '../api/reportApi';

interface Props {
  projectId: number;
}

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function ReportPanel({ projectId }: Props) {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(() => {
    reportApi.getList(projectId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setReports(res.data.data);
          if (res.data.data.length > 0 && !selectedReport) {
            setSelectedReport(res.data.data[0]);
          }
        }
      })
      .catch(() => { /* 무시 */ })
      .finally(() => setLoading(false));
  }, [projectId, selectedReport]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await reportApi.generate(projectId, yearMonth);
      if (res.data.success && res.data.data) {
        setSelectedReport(res.data.data);
        loadReports();
      } else {
        setError(res.data.message ?? '리포트 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '리포트 생성에 실패했습니다.'));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingText>리포트를 불러오는 중...</LoadingText>;
  }

  return (
    <Container>
      {/* 리포트 생성 영역 */}
      <GenerateSection>
        <GenerateTitle>월간 리포트 생성</GenerateTitle>
        <GenerateRow>
          <MonthInput
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            disabled={generating}
          />
          <GenerateButton onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Spinner />
                생성 중... (약 10초)
              </>
            ) : (
              '리포트 생성'
            )}
          </GenerateButton>
        </GenerateRow>
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </GenerateSection>

      {/* 리포트 목록 + 내용 */}
      {reports.length === 0 && !selectedReport ? (
        <EmptyState>
          아직 리포트가 없습니다. 위에서 월을 선택하고 리포트를 생성해보세요.
        </EmptyState>
      ) : (
        <ContentSection>
          {/* 좌측: 리포트 목록 */}
          <ReportList>
            <ListTitle>리포트 기록</ListTitle>
            {reports.map((r) => (
              <ReportItem
                key={r.id}
                $active={selectedReport?.id === r.id}
                onClick={() => setSelectedReport(r)}
              >
                <ReportMonth>{r.year_month}</ReportMonth>
                <ReportDate>
                  {new Date(r.created_at).toLocaleDateString('ko-KR')}
                </ReportDate>
              </ReportItem>
            ))}
          </ReportList>

          {/* 우측: 리포트 내용 */}
          <ReportContent>
            {selectedReport ? (
              <>
                <ReportHeader>
                  <ReportHeaderMonth>{selectedReport.year_month} 월간 리포트</ReportHeaderMonth>
                  <TokenBadge>{(selectedReport.tokens_used ?? 0).toLocaleString()} tokens</TokenBadge>
                </ReportHeader>
                <MarkdownBody>{selectedReport.content}</MarkdownBody>
              </>
            ) : (
              <EmptyState>리포트를 선택해주세요.</EmptyState>
            )}
          </ReportContent>
        </ContentSection>
      )}
    </Container>
  );
}

/* ── Styled Components ── */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  padding: 2rem;
`;

const GenerateSection = styled.div`
  background: ${theme.colors.surface};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GenerateTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const GenerateRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const MonthInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: ${theme.colors.surface};
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  margin-right: 0.5rem;
`;

const GenerateButton = styled(PrimaryButton)`
  display: flex;
  align-items: center;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  padding: 3rem 1rem;
  font-size: 0.875rem;
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReportList = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ListTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  margin-bottom: 0.25rem;
`;

const ReportItem = styled.button<{ $active: boolean }>`
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  text-align: left;
  background: ${({ $active }) => ($active ? `${theme.colors.primary}10` : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.background};
  }
`;

const ReportMonth = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const ReportDate = styled.div`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.125rem;
`;

const ReportContent = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const ReportHeaderMonth = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const TokenBadge = styled.span`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.background};
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
`;

const MarkdownBody = styled.div`
  font-size: 0.875rem;
  line-height: 1.8;
  color: ${theme.colors.text};
  white-space: pre-wrap;
  word-break: break-word;
`;
