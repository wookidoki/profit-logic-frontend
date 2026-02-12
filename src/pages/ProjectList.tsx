import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { ErrorBanner } from '../styles/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import { projectApi } from '../api/projectApi';
import { formatKRW } from '../utils/formatNumber';
import type { Project } from '../types';

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectApi
      .getAll()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setProjects(res.data.data);
        }
      })
      .catch(() => setError('프로젝트 목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <HeaderRow>
        <Title>내 프로젝트</Title>
        <CreateButton onClick={() => navigate('/projects/new')}>
          + 새 프로젝트
        </CreateButton>
      </HeaderRow>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📁</EmptyIcon>
          <h3>프로젝트가 없습니다</h3>
          <p>새 프로젝트를 만들어 수익성을 분석해보세요.</p>
          <CreateButton onClick={() => navigate('/projects/new')}>
            + 첫 프로젝트 만들기
          </CreateButton>
        </EmptyState>
      ) : (
        <Grid>
          {projects.map((project) => (
            <Card key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
              <CardTitle>{project.title}</CardTitle>
              <MetricRow>
                <Metric>
                  <MetricLabel>건당 수익</MetricLabel>
                  <MetricValue>{formatKRW(project.price)}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>월 고정 지출</MetricLabel>
                  <MetricValue>{formatKRW(project.fixed_cost)}</MetricValue>
                </Metric>
              </MetricRow>
              <MetricRow>
                <Metric>
                  <MetricLabel>건당 비용</MetricLabel>
                  <MetricValue>{formatKRW(project.variable_cost)}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>월 투입 시간</MetricLabel>
                  <MetricValue>{project.work_hours}시간</MetricValue>
                </Metric>
              </MetricRow>
              <CardFooter>
                {new Date(project.created_at).toLocaleDateString('ko-KR')}
                {project.is_public && <PublicBadge>공개</PublicBadge>}
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const CreateButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  background: ${theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  text-align: center;

  h3 {
    font-size: 1.25rem;
    color: ${theme.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${theme.colors.textSecondary};
    margin-bottom: 1.5rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 0.75rem;
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Metric = styled.div``;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #adb5bd;
`;

const MetricValue = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #495057;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f3f5;
  font-size: 0.75rem;
  color: #adb5bd;
`;

const PublicBadge = styled.span`
  padding: 0.125rem 0.5rem;
  background: ${theme.colors.success}15;
  color: ${theme.colors.success};
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 600;
`;
