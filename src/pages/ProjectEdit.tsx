import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { BackButton, ErrorBanner, FormGroup, FormLabel, FormInput, FormErrorMsg, PrimaryButton } from '../styles/shared';
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
              <FormLabel>{label}</FormLabel>
              <FormInput
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
              {errors[name] && <FormErrorMsg>{errors[name]?.message}</FormErrorMsg>}
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
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

const SubmitButton = styled(PrimaryButton)`
  margin-top: 0.5rem;
`;
