import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { BackButton, ErrorBanner, FormGroup, FormLabel, FormInput, FormErrorMsg, PrimaryButton } from '../styles/shared';
import { MINIMUM_WAGE, DEFAULT_WORK_HOURS } from '../constants';
import { projectApi } from '../api/projectApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { ProjectCreateRequest } from '../types';

const fields = [
  { name: 'title' as const, label: '프로젝트 이름', placeholder: '예: 이모티콘 판매', type: 'text' },
  { name: 'price' as const, label: '판매가 (원)', placeholder: '예: 15000', type: 'number' },
  { name: 'variable_cost' as const, label: '변동비 (원)', placeholder: '예: 5000', type: 'number' },
  { name: 'fixed_cost' as const, label: '고정비 (원/월)', placeholder: '예: 500000', type: 'number' },
  { name: 'work_hours' as const, label: '근무시간 (시간/월)', placeholder: `예: ${DEFAULT_WORK_HOURS}`, type: 'number' },
  { name: 'hourly_wage' as const, label: '시급 (원)', placeholder: `예: ${MINIMUM_WAGE}`, type: 'number' },
] as const;

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectCreateRequest>({ mode: 'onBlur' });

  const onSubmit = async (data: ProjectCreateRequest) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await projectApi.create(data);
      if (res.data.success && res.data.data) {
        navigate(`/projects/${res.data.data.id}`);
      } else {
        setError(res.data.message || '프로젝트 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, '프로젝트 생성에 실패했습니다.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/projects')}>← 목록으로</BackButton>
      <FormCard>
        <FormTitle>새 프로젝트</FormTitle>

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

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? '생성 중...' : '프로젝트 생성'}
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

const SubmitButton = styled(PrimaryButton)`
  margin-top: 0.5rem;
`;
