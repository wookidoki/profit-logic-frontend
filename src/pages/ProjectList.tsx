import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { projectApi } from '../api/projectApi';
import ProjectCard from '../components/ProjectCard';
import type { Project } from '../types';

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectApi.getAll();
        if (res.data.success && res.data.data) {
          setProjects(res.data.data);
        }
      } catch {
        setError('프로젝트 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loading>불러오는 중...</Loading>;

  return (
    <Container>
      <Header>
        <PageTitle>내 프로젝트</PageTitle>
        <CreateBtn onClick={() => navigate('/projects/new')}>+ 새 프로젝트</CreateBtn>
      </Header>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {projects.length === 0 ? (
        <EmptyState>
          <EmptyText>아직 프로젝트가 없습니다.</EmptyText>
          <EmptySub>새 프로젝트를 생성하여 수익성 분석을 시작하세요.</EmptySub>
          <CreateBtn onClick={() => navigate('/projects/new')}>+ 새 프로젝트</CreateBtn>
        </EmptyState>
      ) : (
        <Grid>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Grid>
      )}
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

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
`;

const CreateBtn = styled.button`
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const EmptySub = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6c757d;
`;

const ErrorMsg = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;
