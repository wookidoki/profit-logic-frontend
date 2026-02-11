import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Project } from '../types';
import { formatKRW } from '../utils/formatNumber';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate(`/projects/${project.id}`)}>
      <CardHeader>
        <Title>{project.title}</Title>
        {project.is_public && <PublicTag>공개</PublicTag>}
      </CardHeader>
      <MetricRow>
        <Metric>
          <MetricLabel>판매가</MetricLabel>
          <MetricValue>{formatKRW(project.price)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>변동비</MetricLabel>
          <MetricValue>{formatKRW(project.variable_cost)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>고정비</MetricLabel>
          <MetricValue>{formatKRW(project.fixed_cost)}</MetricValue>
        </Metric>
      </MetricRow>
      <DateText>{new Date(project.created_at).toLocaleDateString('ko-KR')}</DateText>
    </Card>
  );
}

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
    border-color: #4361ee;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const PublicTag = styled.span`
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: #eef0ff;
  color: #4361ee;
  border-radius: 9999px;
  font-weight: 500;
`;

const MetricRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const Metric = styled.div``;

const MetricLabel = styled.div`
  font-size: 0.6875rem;
  color: #6c757d;
`;

const MetricValue = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1a1a2e;
`;

const DateText = styled.div`
  font-size: 0.75rem;
  color: #adb5bd;
`;
