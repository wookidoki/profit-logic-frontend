import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import type { CalculateRequest } from '../types/finance';
import AiParseModal from './AiParseModal';

interface Props {
  onSubmit: (data: CalculateRequest) => void;
  loading: boolean;
  defaultValues?: Partial<CalculateRequest>;
}

const fields = [
  { name: 'price' as const, label: '판매가 (원)', placeholder: '예: 15000' },
  { name: 'variable_cost' as const, label: '변동비 (원)', placeholder: '예: 5000' },
  { name: 'fixed_cost' as const, label: '고정비 (원/월)', placeholder: '예: 500000' },
  { name: 'work_hours' as const, label: '근무시간 (시간/월)', placeholder: '예: 160' },
  { name: 'hourly_wage' as const, label: '시급 (원)', placeholder: '예: 9860' },
  { name: 'target_profit' as const, label: '목표이익 (원/월)', placeholder: '예: 2000000' },
] as const;

export default function ProjectInputForm({ onSubmit, loading, defaultValues }: Props) {
  const [showAiModal, setShowAiModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CalculateRequest>({
    mode: 'onBlur',
    defaultValues: {
      price: defaultValues?.price ?? undefined,
      variable_cost: defaultValues?.variable_cost ?? undefined,
      fixed_cost: defaultValues?.fixed_cost ?? undefined,
      work_hours: defaultValues?.work_hours ?? undefined,
      hourly_wage: defaultValues?.hourly_wage ?? undefined,
      target_profit: defaultValues?.target_profit ?? undefined,
    },
  });

  const handleParsed = (data: CalculateRequest) => {
    reset(data);
    setShowAiModal(false);
  };

  return (
    <>
      <FormCard>
        <FormTitle>프로젝트 분석</FormTitle>
        <AiButton type="button" onClick={() => setShowAiModal(true)}>
          AI로 자동 입력
        </AiButton>

        <Form onSubmit={handleSubmit(onSubmit)}>
          {fields.map(({ name, label, placeholder }) => (
            <FormGroup key={name}>
              <Label>{label}</Label>
              <Input
                type="number"
                step="any"
                placeholder={placeholder}
                $hasError={!!errors[name]}
                {...register(name, {
                  required: `${label.split(' (')[0]}은(는) 필수입니다`,
                  min: { value: 0, message: '0 이상 입력해주세요' },
                  valueAsNumber: true,
                })}
              />
              {errors[name] && <ErrorMsg>{errors[name]?.message}</ErrorMsg>}
            </FormGroup>
          ))}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '분석 중...' : '수익성 분석'}
          </SubmitButton>
        </Form>
      </FormCard>

      <AiParseModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onParsed={handleParsed}
      />
    </>
  );
}

const FormCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  color: #1a1a2e;
  margin-bottom: 1rem;
`;

const AiButton = styled.button`
  width: 100%;
  padding: 0.625rem;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #7209b7, #4361ee);
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
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
