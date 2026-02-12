import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { BackButton, ErrorBanner, FormGroup, FormLabel, FormInput, FormErrorMsg, PrimaryButton } from '../styles/shared';
import { MINIMUM_WAGE, DEFAULT_WORK_HOURS } from '../constants';
import { projectApi } from '../api/projectApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { ProjectUpdateRequest } from '../types';

const fields = [
  { name: 'title' as const, label: '프로젝트 이름', placeholder: '예: 이모티콘 판매', type: 'text' },
  { name: 'price' as const, label: '건당 수익 (원)', placeholder: '예: 회차당 3,000 / 영상당 50,000', type: 'number' },
  { name: 'variable_cost' as const, label: '건당 비용 (원)', placeholder: '예: 외주 편집비, 소품비 (없으면 0)', type: 'number' },
  { name: 'fixed_cost' as const, label: '월 고정 지출 (원)', placeholder: '예: 도구 구독, 장비 할부', type: 'number' },
  { name: 'work_hours' as const, label: '월 투입 시간 (시간/월)', placeholder: `예: ${DEFAULT_WORK_HOURS}`, type: 'number' },
  { name: 'hourly_wage' as const, label: '본업 시급 (원)', placeholder: `예: ${MINIMUM_WAGE}`, type: 'number' },
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
            target_revenue: p.target_revenue ?? undefined,
            target_month: p.target_month ?? undefined,
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
      setError(extractErrorMessage(err, '수정에 실패했습니다.'));
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

          <GoalSection>
            <GoalTitle>목표 설정 (선택)</GoalTitle>
            <FormGroup>
              <FormLabel>목표 매출 (원)</FormLabel>
              <FormInput
                type="number"
                step="any"
                placeholder="예: 1000000"
                $hasError={!!errors.target_revenue}
                {...register('target_revenue', {
                  min: { value: 0, message: '0 이상 입력해주세요' },
                  valueAsNumber: true,
                })}
              />
              {errors.target_revenue && <FormErrorMsg>{errors.target_revenue?.message}</FormErrorMsg>}
            </FormGroup>
            <FormGroup>
              <FormLabel>목표 달성 기한</FormLabel>
              <FormInput
                type="month"
                $hasError={!!errors.target_month}
                {...register('target_month')}
              />
              {errors.target_month && <FormErrorMsg>{errors.target_month?.message}</FormErrorMsg>}
            </FormGroup>
          </GoalSection>

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

const GoalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f3f5;
`;

const GoalTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  margin: 0;
`;

const SubmitButton = styled(PrimaryButton)`
  margin-top: 0.5rem;
`;
