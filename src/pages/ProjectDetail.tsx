import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { projectApi } from '../api/projectApi';
import ResultCards from '../components/ResultCards';
import BepChart from '../components/BepChart';
import ScenarioSimulator from '../components/ScenarioSimulator';
import ChatPanel from '../components/ChatPanel';
import SimulationList from '../components/SimulationList';
import type { Project } from '../types';
import type { CalculateRequest, CalculateResponse } from '../types/finance';

type Tab = 'analysis' | 'simulation' | 'chat';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('analysis');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectApi.getById(projectId);
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setProject(p);

          // 자동으로 분석 실행
          const calcReq: CalculateRequest = {
            price: p.price,
            variable_cost: p.variable_cost,
            fixed_cost: p.fixed_cost,
            work_hours: p.work_hours,
            hourly_wage: p.hourly_wage,
            target_profit: 0,
          };
          const calcRes = await projectApi.calculate(calcReq);
          if (calcRes.data.success && calcRes.data.data) {
            setResult(calcRes.data.data);
          }
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch {
        setError('프로젝트를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  const handleDelete = async () => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await projectApi.delete(projectId);
      navigate('/');
    } catch {
      alert('삭제에 실패했습니다.');
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

  if (loading) return <Loading>불러오는 중...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!project) return null;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackBtn onClick={() => navigate('/')}>← 목록</BackBtn>
          <ProjectTitle>{project.title}</ProjectTitle>
        </HeaderLeft>
        <HeaderRight>
          <DeleteBtn onClick={handleDelete} disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제'}
          </DeleteBtn>
        </HeaderRight>
      </Header>

      <TabBar>
        <TabItem $active={tab === 'analysis'} onClick={() => setTab('analysis')}>
          분석 결과
        </TabItem>
        <TabItem $active={tab === 'simulation'} onClick={() => setTab('simulation')}>
          시뮬레이션
        </TabItem>
        <TabItem $active={tab === 'chat'} onClick={() => setTab('chat')}>
          AI 챗봇
        </TabItem>
      </TabBar>

      <TabContent>
        {tab === 'analysis' && result && formData && (
          <>
            <ResultCards result={result} />
            <BepChart formData={formData} result={result} />
            <ScenarioSimulator baseData={formData} baseResult={result} />
          </>
        )}
        {tab === 'simulation' && (
          <SimulationList projectId={projectId} />
        )}
        {tab === 'chat' && (
          <ChatPanel projectId={projectId} />
        )}
      </TabContent>
    </Container>
  );
}

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackBtn = styled.button`
  padding: 0.375rem 0.625rem;
  background: #fff;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

const ProjectTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DeleteBtn = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #ef476f;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
`;

const TabItem = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? '#4361ee' : '#6c757d')};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? '#4361ee' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #4361ee;
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
`;

const ErrorBox = styled.div`
  text-align: center;
  padding: 4rem;
  color: #ef476f;
`;
