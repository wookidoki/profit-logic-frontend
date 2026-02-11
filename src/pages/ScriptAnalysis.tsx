import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { scriptApi } from '../api/scriptApi';
import ResultCards from '../components/ResultCards';
import BepChart from '../components/BepChart';
import type { CalculateRequest, CalculateResponse } from '../types/finance';
import type {
  CreatorCategory,
  CategoryInfo,
  ScriptTemplate,
  ScriptField,
  ScriptAnalysisResponse,
} from '../types/script';

const CATEGORY_COLORS: Record<CreatorCategory, string> = {
  WEB_NOVEL: '#7209b7',
  SHORT_FORM: '#ef476f',
  EMOTICON: '#ffd166',
  BLOG: '#06d6a0',
  INDIE_DEV: '#4361ee',
};

type Step = 1 | 2 | 3;

export default function ScriptAnalysis() {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Step 2
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory | null>(null);
  const [template, setTemplate] = useState<ScriptTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  // Step 3
  const [analysisResult, setAnalysisResult] = useState<ScriptAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    setCatLoading(true);
    scriptApi
      .getCategories()
      .then((res) => {
        if (res.data.success && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch(() => setError('카테고리 목록을 불러올 수 없습니다.'))
      .finally(() => setCatLoading(false));
  }, []);

  // Fetch template when category is selected
  const handleCategorySelect = useCallback((category: CreatorCategory) => {
    setSelectedCategory(category);
    setTemplateLoading(true);
    setError('');

    scriptApi
      .getTemplate(category)
      .then((res) => {
        if (res.data.success && res.data.data) {
          const tmpl = res.data.data;
          setTemplate(tmpl);

          // Pre-fill defaults
          const defaults: Record<string, string | number> = {};
          tmpl.sections.forEach((section) =>
            section.fields.forEach((field) => {
              if (field.default_value != null && !field.auto_calculate) {
                defaults[field.field_key] =
                  typeof field.default_value === 'number'
                    ? field.default_value
                    : String(field.default_value);
              }
            }),
          );
          setFormValues(defaults);
          setStep(2);
        }
      })
      .catch(() => setError('템플릿을 불러올 수 없습니다.'))
      .finally(() => setTemplateLoading(false));
  }, []);

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: value === '' ? '' : Number(value),
    }));
  };

  const handleSelectChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleAnalyze = () => {
    if (!selectedCategory) return;
    setAnalyzing(true);
    setError('');

    // Build inputs: exclude auto_calculate fields and empty values
    const inputs: Record<string, unknown> = {};
    Object.entries(formValues).forEach(([key, val]) => {
      if (val !== '' && val != null) {
        inputs[key] = val;
      }
    });

    scriptApi
      .analyze({ category: selectedCategory, inputs })
      .then((res) => {
        if (res.data.success && res.data.data) {
          setAnalysisResult(res.data.data);
          setStep(3);
        } else {
          setError(res.data.message || '분석에 실패했습니다.');
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '분석 중 오류가 발생했습니다.';
        setError(msg);
      })
      .finally(() => setAnalyzing(false));
  };

  // Convert analysis result to CalculateRequest for BepChart reuse
  const toBepFormData = (result: CalculateResponse): CalculateRequest | null => {
    if (!result) return null;
    // Use contribution_margin to derive price/variable_cost:
    // contribution_margin = price - variable_cost
    // BepChart needs price, variable_cost, fixed_cost to draw lines
    // We derive approximate values from the result
    const bep = result.break_even_point;
    const cm = result.contribution_margin;
    if (bep <= 0 || cm <= 0) return null;

    // fixed_cost = BEP × contribution_margin (approximate)
    const fixedCost = bep * cm;
    // Use contribution_margin as price, 0 as variable_cost (simplified for chart)
    return {
      price: cm,
      variable_cost: 0,
      fixed_cost: fixedCost,
      work_hours: 0,
      hourly_wage: 0,
      target_profit: 0,
    };
  };

  return (
    <Container>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <Section>
          <SectionTitle>크리에이터 유형을 선택하세요</SectionTitle>
          <SectionDesc>
            유형에 맞는 맞춤 입력 양식이 제공됩니다.
          </SectionDesc>
          {catLoading ? (
            <LoadingText>카테고리 로딩 중...</LoadingText>
          ) : (
            <CategoryGrid>
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.category}
                  $color={CATEGORY_COLORS[cat.category]}
                  onClick={() => handleCategorySelect(cat.category)}
                >
                  <CatName>{cat.display_name}</CatName>
                  <CatDesc>{cat.description}</CatDesc>
                </CategoryCard>
              ))}
            </CategoryGrid>
          )}
        </Section>
      )}

      {/* Step 2: Template Form */}
      {step === 2 && template && (
        <Section>
          <StepHeader>
            <BackButton onClick={() => setStep(1)}>← 카테고리 선택</BackButton>
            <TemplateBadge $color={CATEGORY_COLORS[template.category]}>
              {template.display_name}
            </TemplateBadge>
          </StepHeader>

          {templateLoading ? (
            <LoadingText>템플릿 로딩 중...</LoadingText>
          ) : (
            <FormContainer>
              {template.sections.map((section) => (
                <FormSection key={section.section_title}>
                  <FormSectionTitle>{section.section_title}</FormSectionTitle>
                  {section.fields.map((field) => (
                    <FieldRow key={field.field_key}>
                      {renderField(field, formValues, handleFieldChange, handleSelectChange)}
                    </FieldRow>
                  ))}
                </FormSection>
              ))}

              <AnalyzeButton onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? '분석 중...' : '수익성 분석하기'}
              </AnalyzeButton>
            </FormContainer>
          )}
        </Section>
      )}

      {/* Step 3: Results */}
      {step === 3 && analysisResult && (
        <Section>
          <StepHeader>
            <BackButton onClick={() => setStep(2)}>← 다시 입력</BackButton>
            <TemplateBadge $color={CATEGORY_COLORS[analysisResult.category]}>
              {analysisResult.display_name}
            </TemplateBadge>
          </StepHeader>

          <ResultContainer>
            <ResultCards result={analysisResult.result} />
            {(() => {
              const bepData = toBepFormData(analysisResult.result);
              return bepData ? <BepChart formData={bepData} result={analysisResult.result} /> : null;
            })()}
          </ResultContainer>

          <ButtonRow>
            <SecondaryButton onClick={() => setStep(2)}>입력값 수정</SecondaryButton>
            <SecondaryButton onClick={() => { setStep(1); setAnalysisResult(null); setTemplate(null); setFormValues({}); }}>
              새 분석 시작
            </SecondaryButton>
          </ButtonRow>
        </Section>
      )}
    </Container>
  );
}

// ── Field Renderer ──────────────────────────────

function renderField(
  field: ScriptField,
  values: Record<string, string | number>,
  onNumberChange: (key: string, val: string) => void,
  onSelectChange: (key: string, val: string) => void,
) {
  const value = values[field.field_key] ?? '';

  if (field.auto_calculate) {
    return (
      <FieldGroup>
        <FieldLabel>
          {field.label}
          {field.unit && <FieldUnit>({field.unit})</FieldUnit>}
        </FieldLabel>
        <AutoCalcBox>{field.formula || '자동 계산'}</AutoCalcBox>
        {field.help_text && <HelpText>{field.help_text}</HelpText>}
      </FieldGroup>
    );
  }

  if (field.field_type === 'select' && field.options) {
    return (
      <FieldGroup>
        <FieldLabel>
          {field.label}
          {field.required && <RequiredMark>*</RequiredMark>}
        </FieldLabel>
        <Select
          value={String(value)}
          onChange={(e) => onSelectChange(field.field_key, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {field.help_text && <HelpText>{field.help_text}</HelpText>}
      </FieldGroup>
    );
  }

  // Default: number input
  return (
    <FieldGroup>
      <FieldLabel>
        {field.label}
        {field.unit && <FieldUnit>({field.unit})</FieldUnit>}
        {field.required && <RequiredMark>*</RequiredMark>}
      </FieldLabel>
      <FieldInput
        type="number"
        step="any"
        placeholder={field.placeholder || ''}
        value={value}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
        onChange={(e) => onNumberChange(field.field_key, e.target.value)}
      />
      {field.help_text && <HelpText>{field.help_text}</HelpText>}
    </FieldGroup>
  );
}

// ── Styled Components ──────────────────────────────

const Container = styled.div``;

const Section = styled.section`
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const SectionDesc = styled.p`
  color: #6c757d;
  margin-bottom: 1.5rem;
`;

const ErrorBanner = styled.div`
  max-width: 900px;
  margin: 1rem auto;
  padding: 0.75rem 2rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 3rem 0;
`;

// ── Step 1: Category Grid ──

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

const CategoryCard = styled.div<{ $color: string }>`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid ${({ $color }) => $color};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CatName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const CatDesc = styled.div`
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.5;
`;

// ── Step 2: Form ──

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    border-color: #4361ee;
    color: #4361ee;
  }
`;

const TemplateBadge = styled.span<{ $color: string }>`
  padding: 0.375rem 0.75rem;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const FormSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f3f5;
`;

const FieldRow = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FieldLabel = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const FieldUnit = styled.span`
  color: #adb5bd;
  font-weight: 400;
`;

const RequiredMark = styled.span`
  color: #ef476f;
  font-weight: 700;
`;

const FieldInput = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select`
  padding: 0.625rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: #fff;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

const AutoCalcBox = styled.div`
  padding: 0.625rem 0.75rem;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #6c757d;
  font-style: italic;
`;

const HelpText = styled.span`
  font-size: 0.75rem;
  color: #adb5bd;
`;

const AnalyzeButton = styled.button`
  padding: 0.875rem;
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

// ── Step 3: Results ──

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #fff;
  color: #4361ee;
  border: 1px solid #4361ee;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #4361ee;
    color: #fff;
  }
`;
