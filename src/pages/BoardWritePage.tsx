import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { communityApi } from '../api/communityApi';
import { projectApi } from '../api/projectApi';
import { extractErrorMessage } from '../api/errorUtils';
import { BackButton, ErrorBanner } from '../styles/shared';
import type { Project } from '../types';

export default function BoardWritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectApi.getAll()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setProjects(res.data.data);
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await communityApi.createPost({
        title: title.trim(),
        content: content.trim(),
        project_id: projectId ? Number(projectId) : undefined,
      });
      if (res.data.success && res.data.data) {
        navigate(`/board/${res.data.data.id}`);
      } else {
        setError(res.data.message ?? '글 작성에 실패했습니다.');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '글 작성에 실패했습니다.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/board')}>← 목록</BackButton>
      <Title>글쓰기</Title>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>제목</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
          />
        </FormGroup>

        <FormGroup>
          <Label>연결 프로젝트 (선택)</Label>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">프로젝트 없음</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>내용</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            maxLength={10000}
          />
        </FormGroup>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Actions>
          <CancelButton type="button" onClick={() => navigate('/board')}>취소</CancelButton>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '작성 중...' : '작성하기'}
          </SubmitButton>
        </Actions>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  max-width: 700px;
  margin: 1.5rem auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const Form = styled.form`
  background: ${theme.colors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${theme.colors.surface};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    border-color: #adb5bd;
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
