import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { projectApi } from '../api/projectApi';
import type { ProjectCreateRequest } from '../types';

interface FormValues {
  title: string;
  price: number;
  variable_cost: number;
  fixed_cost: number;
  work_hours: number;
  hourly_wage: number;
  is_public: boolean;
}

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { is_public: false },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const req: ProjectCreateRequest = {
        title: data.title,
        price: data.price,
        variable_cost: data.variable_cost,
        fixed_cost: data.fixed_cost,
        work_hours: data.work_hours,
        hourly_wage: data.hourly_wage,
        is_public: data.is_public,
      };
      const res = await projectApi.create(req);
      if (res.data.success && res.data.data) {
        navigate(`/projects/${res.data.data.id}`);
      } else {
        setError(res.data.message ?? '프로젝트 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? '프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'title' as const, label: '프로젝트명', type: 'text', placeholder: '예: 수제 쿠키 사업' },
    { name: 'price' as const, label: '판매가 (원)', type: 'number', placeholder: '예: 15000' },
    { name: 'variable_cost' as const, label: '변동비 (원)', type: 'number', placeholder: '예: 5000' },
    { name: 'fixed_cost' as const, label: '고정비 (원/월)', type: 'number', placeholder: '예: 500000' },
    { name: 'work_hours' as const, label: '근무시간 (시간/월)', type: 'number', placeholder: '예: 160' },
    { name: 'hourly_wage' as const, label: '시급 (원)', type: 'number', placeholder: '예: 9860' },
  ];

  return (
    <Container>
      <Card>
        <PageTitle>새 프로젝트</PageTitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          {fields.map(({ name, label, type, placeholder }) => (
            <FormGroup key={name}>
              <Label>{label}</Label>
              <Input
                type={type}
                step={type === 'number' ? 'any' : undefined}
                placeholder={placeholder}
                $hasError={!!errors[name]}
                {...register(name, {
                  required: `${label.split(' (')[0]}은(는) 필수입니다`,
                  ...(type === 'number' && {
                    min: { value: 0, message: '0 이상 입력해주세요' },
                    valueAsNumber: true,
                  }),
                })}
              />
              {errors[name] && <ErrorText>{errors[name]?.message}</ErrorText>}
            </FormGroup>
          ))}

          <CheckboxGroup>
            <input type="checkbox" id="is_public" {...register('is_public')} />
            <CheckLabel htmlFor="is_public">커뮤니티에 공개</CheckLabel>
          </CheckboxGroup>

          <BtnRow>
            <CancelBtn type="button" onClick={() => navigate('/')}>취소</CancelBtn>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? '생성 중...' : '프로젝트 생성'}
            </SubmitBtn>
          </BtnRow>
        </Form>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  max-width: 520px;
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckLabel = styled.label`
  font-size: 0.875rem;
  color: #1a1a2e;
  cursor: pointer;
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
  transition: background 0.2s;

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
