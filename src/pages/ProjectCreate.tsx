import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { ErrorBanner, FormGroup, FormLabel, FormInput, FormErrorMsg, PrimaryButton } from '../styles/shared';
import { MINIMUM_WAGE, DEFAULT_WORK_HOURS } from '../constants';
import { projectApi } from '../api/projectApi';
import { extractErrorMessage } from '../api/errorUtils';
import type { ProjectCreateRequest } from '../types';
import type { AiParseResponse } from '../types/finance';

type Mode = 'choose' | 'direct' | 'ai';

const fields = [
  { name: 'title' as const, label: '프로젝트 이름', placeholder: '예: 이모티콘 판매', type: 'text' },
  { name: 'price' as const, label: '건당 수익 (원)', placeholder: '예: 회차당 3,000 / 영상당 50,000', type: 'number' },
  { name: 'variable_cost' as const, label: '건당 비용 (원)', placeholder: '예: 외주 편집비, 소품비 (없으면 0)', type: 'number' },
  { name: 'fixed_cost' as const, label: '월 고정 지출 (원)', placeholder: '예: 도구 구독, 장비 할부', type: 'number' },
  { name: 'work_hours' as const, label: '월 투입 시간 (시간/월)', placeholder: `예: ${DEFAULT_WORK_HOURS}`, type: 'number' },
  { name: 'hourly_wage' as const, label: '본업 시급 (원)', placeholder: `예: ${MINIMUM_WAGE}`, type: 'number' },
] as const;

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI auto-input
  const [aiText, setAiText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiResult, setAiResult] = useState<AiParseResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectCreateRequest>({ mode: 'onBlur' });

  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    setAiParsing(true);
    setError('');
    try {
      const res = await projectApi.aiParse(aiText);
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setAiResult(data);
        // Fill form fields
        if (data.price > 0) setValue('price', data.price);
        if (data.variable_cost > 0) setValue('variable_cost', data.variable_cost);
        if (data.fixed_cost > 0) setValue('fixed_cost', data.fixed_cost);
        if (data.work_hours > 0) setValue('work_hours', data.work_hours);
        if (data.hourly_wage > 0) setValue('hourly_wage', data.hourly_wage);
        if (data.target_profit > 0) setValue('target_revenue', data.target_profit);
        // Auto-generate title from category
        if (data.detected_category) {
          const catNames: Record<string, string> = {
            WEB_NOVEL: '웹소설', SHORT_FORM: '숏폼', EMOTICON: '이모티콘',
            BLOG: '블로그', INDIE_DEV: 'SaaS/앱',
          };
          const now = new Date();
          const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
          setValue('title', `${catNames[data.detected_category] || ''} 프로젝트 (${dateStr})`);
        }
        setMode('direct'); // Switch to form with pre-filled values
      } else {
        setError('AI 분석에 실패했습니다. 더 구체적으로 입력해주세요.');
      }
    } catch {
      setError('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAiParsing(false);
    }
  };

  const onSubmit = async (data: ProjectCreateRequest) => {
    setSubmitting(true);
    setError('');
    try {
      const createData = { ...data };
      if (aiResult?.detected_category) {
        createData.creator_category = aiResult.detected_category;
      }
      const res = await projectApi.create(createData);
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

  /* ── Step 1: Choose Mode ── */
  if (mode === 'choose') {
    return (
      <Container>
        <BackBtn onClick={() => navigate('/projects')}>← 목록으로</BackBtn>
        <PageTitle>새 프로젝트 만들기</PageTitle>
        <ModeGrid>
          <ModeCard onClick={() => navigate('/consult')}>
            <ModeIcon>🎯</ModeIcon>
            <ModeInfo>
              <ModeName>맞춤 분석</ModeName>
              <ModeDesc>크리에이터 유형별 안내에 따라 단계별로 입력합니다</ModeDesc>
            </ModeInfo>
            <ModeArrow>→</ModeArrow>
          </ModeCard>

          <ModeCard onClick={() => setMode('direct')}>
            <ModeIcon>✏️</ModeIcon>
            <ModeInfo>
              <ModeName>직접 입력</ModeName>
              <ModeDesc>건당 수익/비용을 직접 입력합니다</ModeDesc>
            </ModeInfo>
            <ModeArrow>→</ModeArrow>
          </ModeCard>

          <ModeCard onClick={() => setMode('ai')}>
            <ModeIcon>🤖</ModeIcon>
            <ModeInfo>
              <ModeName>AI 자동 입력</ModeName>
              <ModeDesc>프로젝트를 설명하면 AI가 자동으로 분석합니다</ModeDesc>
            </ModeInfo>
            <ModeArrow>→</ModeArrow>
          </ModeCard>
        </ModeGrid>
      </Container>
    );
  }

  /* ── Step AI: Free Text Input ── */
  if (mode === 'ai') {
    return (
      <Container>
        <BackBtn onClick={() => setMode('choose')}>← 방식 선택</BackBtn>
        <FormCard>
          <FormTitle>AI 자동 입력</FormTitle>
          <AiDescription>
            사이드 프로젝트에 대해 자유롭게 설명해주세요.
            AI가 건당 수익, 비용, 시급 등을 자동으로 추출합니다.
          </AiDescription>

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <AiTextArea
            placeholder={'예: 나는 웹소설 작가야. 카카오페이지에서 회당 300원 받고 연재중이야.\n일러스트 외주비가 회당 5만원 들고, 프로크리에이트 구독료 월 1만원.\n하루 4시간 작업하고, 시급 1.5만원은 벌고 싶어.'}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            rows={6}
            disabled={aiParsing}
          />
          <AiParseBtn onClick={handleAiParse} disabled={aiParsing || !aiText.trim()}>
            {aiParsing ? '분석 중...' : 'AI로 분석하기'}
          </AiParseBtn>
        </FormCard>
      </Container>
    );
  }

  /* ── Step Direct: Form Input ── */
  return (
    <Container>
      <BackBtn onClick={() => { setMode('choose'); setAiResult(null); }}>← 방식 선택</BackBtn>
      <FormCard>
        <FormHeader>
          <FormTitle>
            {aiResult ? '분석 결과 확인' : '직접 입력'}
          </FormTitle>
          {aiResult?.suggestion && (
            <AiDetectedBadge>{aiResult.suggestion}</AiDetectedBadge>
          )}
        </FormHeader>

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
            {submitting ? '생성 중...' : '프로젝트 생성'}
          </SubmitButton>
        </Form>
      </FormCard>
    </Container>
  );
}

/* ── Styled Components ── */

const Container = styled.div`
  max-width: 560px;
  margin: 1.5rem auto;
  padding: 0 2rem;
`;

const BackBtn = styled.button`
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

const PageTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.25rem;
`;

/* ── Mode Selection ── */

const ModeGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ModeCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    border-color: #4361ee;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.12);
    transform: translateY(-1px);
  }
`;

const ModeIcon = styled.span`
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const ModeInfo = styled.div`
  flex: 1;
`;

const ModeName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
`;

const ModeDesc = styled.div`
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.4;
`;

const ModeArrow = styled.span`
  font-size: 1.25rem;
  color: #adb5bd;
  flex-shrink: 0;
`;

/* ── AI Input ── */

const AiDescription = styled.p`
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const AiTextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1.5px solid #dee2e6;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    border-color: #7209b7;
    box-shadow: 0 0 0 3px rgba(114, 9, 183, 0.1);
    outline: none;
  }
  &::placeholder { color: #adb5bd; }
  &:disabled { background: #f8f9fa; cursor: not-allowed; }
`;

const AiParseBtn = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #7209b7, #4361ee);
  color: #fff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  transition: opacity 0.2s;

  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AiDetectedBadge = styled.span`
  font-size: 0.75rem;
  color: #7209b7;
  background: #7209b715;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
`;

/* ── Form ── */

const FormCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  color: #1a1a2e;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
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
