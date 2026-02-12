import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BackButton } from '../styles/shared';
import { projectApi } from '../api/projectApi';
import { formatKRW } from '../utils/formatNumber';
import EnhancedAnalysisPanel from '../components/EnhancedAnalysisPanel';
import ScenarioSimulator from '../components/ScenarioSimulator';
import CostDetailPanel from '../components/CostDetailPanel';
import TimeLogPanel from '../components/TimeLogPanel';
import ReportPanel from '../components/ReportPanel';
import GoalProgressPanel from '../components/GoalProgressPanel';
import type { Project } from '../types';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

type Tab = 'overview' | 'goal' | 'costs' | 'timelogs' | 'analysis' | 'report' | 'simulation';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('overview');

  // Analysis state (for simulation tab)
  const [result, setResult] = useState<CalculateResponse | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await projectApi.getById(projectId);
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setProject(p);

          // Auto-analyze for simulation tab
          const calcReq: CalculateRequest = {
            price: p.price,
            variable_cost: p.variable_cost,
            fixed_cost: p.fixed_cost,
            work_hours: p.work_hours,
            hourly_wage: p.hourly_wage,
            target_profit: 0,
          };
          const calcRes = await projectApi.calculate(calcReq);
          if (!cancelled && calcRes.data.success && calcRes.data.data) {
            setResult(calcRes.data.data);
          }
        } else {
          if (!cancelled) setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch {
        if (!cancelled) setError('프로젝트를 불러올 수 없습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectId]);

  const handleDelete = async () => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await projectApi.delete(projectId);
      navigate('/projects');
    } catch {
      setError('삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  const formData: CalculateRequest | null = project
    ? {
        price: project.price,
        variable_cost: project.variable_cost,
        fixed_cost: project.fixed_cost,
        work_hours: project.work_hours,
        hourly_wage: project.hourly_wage,
        target_profit: 0,
      }
    : null;

  if (loading) return <LoadingContainer>로딩 중...</LoadingContainer>;
  if (error) return <ErrorContainer>{error}</ErrorContainer>;
  if (!project) return <ErrorContainer>프로젝트를 찾을 수 없습니다.</ErrorContainer>;

  return (
    <Container>
      <HeaderRow>
        <BackButton onClick={() => navigate('/projects')}>← 목록</BackButton>
        <HeaderRight>
          <EditButton onClick={() => navigate(`/projects/${projectId}/edit`)}>
            수정
          </EditButton>
          <DeleteButton onClick={handleDelete} disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제'}
          </DeleteButton>
        </HeaderRight>
      </HeaderRow>

      <ProjectHeader>
        <ProjectTitle>{project.title}</ProjectTitle>
        {project.is_public && <PublicBadge>공개</PublicBadge>}
      </ProjectHeader>

      <TabBar>
        <TabItem $active={tab === 'overview'} onClick={() => setTab('overview')}>
          개요
        </TabItem>
        <TabItem $active={tab === 'goal'} onClick={() => setTab('goal')}>
          목표
        </TabItem>
        <TabItem $active={tab === 'costs'} onClick={() => setTab('costs')}>
          비용 상세
        </TabItem>
        <TabItem $active={tab === 'timelogs'} onClick={() => setTab('timelogs')}>
          작업시간
        </TabItem>
        <TabItem $active={tab === 'analysis'} onClick={() => setTab('analysis')}>
          분석 결과
        </TabItem>
        <TabItem $active={tab === 'report'} onClick={() => setTab('report')}>
          리포트
        </TabItem>
        <TabItem $active={tab === 'simulation'} onClick={() => setTab('simulation')}>
          시뮬레이션
        </TabItem>
      </TabBar>

      <TabContent>
        {tab === 'overview' && (
          <InfoGrid>
            <InfoItem>
              <InfoLabel>건당 수익</InfoLabel>
              <InfoValue>{formatKRW(project.price)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>건당 비용</InfoLabel>
              <InfoValue>{formatKRW(project.variable_cost)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>월 고정 지출</InfoLabel>
              <InfoValue>{formatKRW(project.fixed_cost)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>월 투입 시간</InfoLabel>
              <InfoValue>{project.work_hours}시간/월</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>본업 시급</InfoLabel>
              <InfoValue>{formatKRW(project.hourly_wage)}</InfoValue>
            </InfoItem>
          </InfoGrid>
        )}

        {tab === 'goal' && (
          <GoalProgressPanel
            projectId={projectId}
            onSetGoal={() => navigate(`/projects/${projectId}/edit`)}
          />
        )}

        {tab === 'costs' && (
          <CostDetailPanel projectId={projectId} />
        )}

        {tab === 'timelogs' && (
          <TimeLogPanel projectId={projectId} />
        )}

        {tab === 'analysis' && (
          <EnhancedAnalysisPanel
            projectId={projectId}
            onNavigateTab={(t) => setTab(t as Tab)}
          />
        )}

        {tab === 'report' && (
          <ReportPanel projectId={projectId} />
        )}

        {tab === 'simulation' && result && formData && (
          <ScenarioSimulator baseData={formData} baseResult={result} />
        )}

        {tab === 'simulation' && !result && (
          <LoadingText>분석 결과가 필요합니다.</LoadingText>
        )}
      </TabContent>
    </Container>
  );
}

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 4rem 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: #ef476f;
  padding: 4rem 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #4361ee;
  border: 1px solid #4361ee;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: #4361ee;
    color: #fff;
  }
`;

const DeleteButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: #ef476f;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const ProjectTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const PublicBadge = styled.span`
  padding: 0.25rem 0.625rem;
  background: #06d6a015;
  color: #06d6a0;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const InfoItem = styled.div`
  flex: 1;
  min-width: 120px;
`;

const InfoLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
  margin-bottom: 0.125rem;
`;

const InfoValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid #f1f3f5;
  margin-bottom: 1.5rem;
`;

const TabItem = styled.button<{ $active: boolean }>`
  padding: 0.625rem 1.25rem;
  background: transparent;
  color: ${({ $active }) => ($active ? '#4361ee' : '#6c757d')};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#4361ee' : 'transparent')};
  margin-bottom: -2px;
  transition: all 0.2s;

  &:hover {
    color: #4361ee;
  }
`;

const TabContent = styled.div``;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 2rem 0;
`;
