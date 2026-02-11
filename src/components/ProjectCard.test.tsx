import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import type { Project } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockProject: Project = {
  id: 1,
  title: '수제 쿠키 사업',
  price: 15000,
  variable_cost: 5000,
  fixed_cost: 500000,
  work_hours: 160,
  hourly_wage: 9860,
  is_public: false,
  created_at: '2026-02-10T12:00:00',
  updated_at: '2026-02-10T12:00:00',
};

describe('ProjectCard', () => {
  it('프로젝트 제목 렌더링', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>,
    );
    expect(screen.getByText('수제 쿠키 사업')).toBeInTheDocument();
  });

  it('판매가, 변동비, 고정비 표시', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>,
    );
    expect(screen.getByText('판매가')).toBeInTheDocument();
    expect(screen.getByText('변동비')).toBeInTheDocument();
    expect(screen.getByText('고정비')).toBeInTheDocument();
  });

  it('공개 프로젝트 → "공개" 태그 표시', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={{ ...mockProject, is_public: true }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('공개')).toBeInTheDocument();
  });

  it('비공개 프로젝트 → "공개" 태그 미표시', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('공개')).not.toBeInTheDocument();
  });

  it('카드 클릭 → /projects/:id 이동', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>,
    );
    await user.click(screen.getByText('수제 쿠키 사업'));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });
});
