import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { projectApi } from '../api/projectApi';
import type { ProjectUpdateRequest } from '../types';

const fields = [
  { name: 'title' as const, label: '프로젝트 이름', placeholder: '예: 이모티콘 판매', type: 'text' },
  { name: 'price' as const, label: '판매가 (원)', placeholder: '예: 15000', type: 'number' },
  { name: 'variable_cost' as const, label: '변동비 (원)', placeholder: '예: 5000', type: 'number' },
  { name: 'fixed_cost' as const, label: '고정비 (원/월)', placeholder: '예: 500000', type: 'number' },
  { name: 'work_hours' as const, label: '근무시간 (시간/월)', placeholder: '예: 160', type: 'number' },
  { name: 'hourly_wage' as const, label: '시급 (원)', placeholder: '예: 9860', type: 'number' },
] as const;

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectUpdateRequest>({ mode: 'onBlur' });

  useEffect(() => {
    if (!projectId) return;
    projectApi
      .getById(projectId)
      .then((res) => {
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          reset({
            title: p.title,
            price: p.price,
            variable_cost: p.variable_cost,
            fixed_cost: p.fixed_cost,
            work_hours: p.work_hours,
            hourly_wage: p.hourly_wage,
            is_public: p.is_public,
          });
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      })
      .catch(() => setError('프로젝트를 불러올 수 없습니다.'))
      .finally(() => setPageLoading(false));
  }, [projectId, reset]);

  const onSubmit = async (data: ProjectUpdateRequest) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await projectApi.update(projectId, data);
      if (res.data.success) {
        navigate(`/projects/${projectId}`);
      } else {
        setError(res.data.message || '수정에 실패했습니다.');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? '수정에 실패했습니다.');
      } else {
        setError('수정에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <LoadingContainer>로딩 중...</LoadingContainer>;

  return (
    <Container>
      <BackButton onClick={() => navigate(`/projects/${projectId}`)}>← 돌아가기</BackButton>
      <FormCard>
        <FormTitle>프로젝트 수정</FormTitle>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          {fields.map(({ name, label, placeholder, type }) => (
            <FormGroup key={name}>
              <Label>{label}</Label>
              <Input
                type={type}
                step={type === 'number' ? 'any' : undefined}
                placeholder={placeholder}
                $hasError={!!errors[name]}
                {...register(name, {
                  required: `${label.split(' (')[0]}은(는) 필수입니다`,
                  ...(type === 'number'
                    ? {
                        min: { value: name === 'work_hours' ? 1 : 0, message: `${name === 'work_hours' ? '1' : '0'} 이상 입력해주세요` },
                        valueAsNumber: true,
                      }
                    : {}),
                })}
              />
              {errors[name] && <ErrorMsg>{errors[name]?.message}</ErrorMsg>}
            </FormGroup>
          ))}

          <CheckboxGroup>
            <input type="checkbox" id="is_public" {...register('is_public')} />
            <CheckboxLabel htmlFor="is_public">공개 프로젝트</CheckboxLabel>
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : '변경사항 저장'}
          </SubmitButton>
        </Form>
      </FormCard>
    </Container>
  );
}

const Container = styled.div`
  max-width: 480px;
  margin: 1.5rem auto;
  padding: 0 2rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 4rem 0;
`;

const BackButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  margin-bottom: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: #4361ee;
    color: #4361ee;
  }
`;

const FormCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  color: #1a1a2e;
  margin-bottom: 1.25rem;
`;

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
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

  &::placeholder {
    color: #adb5bd;
  }
`;

const ErrorMsg = styled.span`
  font-size: 0.75rem;
  color: #ef476f;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #495057;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #3a56d4;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
