import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { communityApi } from '../api/communityApi';
import type { BoardPostCreateRequest } from '../types';

export default function PostCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BoardPostCreateRequest>({ mode: 'onBlur' });

  const onSubmit = async (data: BoardPostCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityApi.createPost(data);
      if (res.data.success && res.data.data) {
        navigate(`/community/${res.data.data.id}`);
      } else {
        setError(res.data.message ?? '게시글 작성에 실패했습니다.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <PageTitle>새 게시글</PageTitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              placeholder="제목을 입력하세요"
              $hasError={!!errors.title}
              {...register('title', {
                required: '제목은 필수입니다',
                maxLength: { value: 200, message: '최대 200자까지 입력 가능합니다' },
              })}
            />
            {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>내용</Label>
            <TextArea
              rows={12}
              placeholder="내용을 입력하세요"
              $hasError={!!errors.content}
              {...register('content', { required: '내용은 필수입니다' })}
            />
            {errors.content && <ErrorText>{errors.content.message}</ErrorText>}
          </FormGroup>

          <BtnRow>
            <CancelBtn type="button" onClick={() => navigate('/community')}>
              취소
            </CancelBtn>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? '작성 중...' : '게시글 등록'}
            </SubmitBtn>
          </BtnRow>
        </Form>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6c757d;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef476f' : '#dee2e6')};
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? '#ef476f' : '#4361ee')};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(239,71,111,0.15)' : 'rgba(67,97,238,0.15)'};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef476f' : '#dee2e6')};
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? '#ef476f' : '#4361ee')};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(239,71,111,0.15)' : 'rgba(67,97,238,0.15)'};
  }
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: #ef476f;
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

const BtnRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #fff;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9375rem;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

const SubmitBtn = styled.button`
  flex: 2;
  padding: 0.75rem;
  background: #4361ee;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
