import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { scriptApi } from '../api/scriptApi';
import { projectApi } from '../api/projectApi';
import { useAuthStore } from '../store/authStore';
import ResultCards from '../components/ResultCards';
import BepChart from '../components/BepChart';
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // Step 2
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory | null>(null);
  const [template, setTemplate] = useState<ScriptTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  // Step 3
  const [analysisResult, setAnalysisResult] = useState<ScriptAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<{ id: number; title: string } | null>(null);

  // AI free text input
  const [aiText, setAiText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const [error, setError] = useState('');

  // AI free text parse handler
  const handleAiParse = useCallback(async () => {
    if (!aiText.trim()) return;
    setAiParsing(true);
    setError('');
    setAiSuggestion('');
    try {
      const res = await projectApi.aiParse(aiText);
      if (res.data.success && res.data.data) {
        const parsed = res.data.data;
        if (parsed.suggestion) setAiSuggestion(parsed.suggestion);
        if (parsed.detected_category) {
          // Auto-select detected category and move to Step 2
          handleCategorySelect(parsed.detected_category as CreatorCategory);
        } else {
          setAiSuggestion('카테고리를 자동 감지하지 못했습니다. 아래에서 직접 선택해주세요.');
        }
      } else {
        setError('AI 파싱에 실패했습니다. 더 구체적으로 입력해주세요.');
      }
    } catch {
      setError('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAiParsing(false);
    }
  }, [aiText]);

  // Fetch categories on mount
  useEffect(() => {
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

  const handleSaveAsProject = async () => {
    if (!selectedCategory || !analysisResult) return;
    setSaving(true);
    setError('');
    try {
      const inputs: Record<string, unknown> = {};
      Object.entries(formValues).forEach(([key, val]) => {
        if (val !== '' && val != null) inputs[key] = val;
      });
      const res = await scriptApi.saveAsProject({ category: selectedCategory, inputs });
      if (res.data.success && res.data.data) {
        setSaveSuccess({ id: res.data.data.id, title: res.data.data.title });
      } else {
        setError(res.data.message || '\uD504\uB85C\uC81D\uD2B8 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
      }
    } catch {
      setError('\uD504\uB85C\uC81D\uD2B8 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <Section>
          <SectionTitle>맞춤 수익 분석</SectionTitle>

          <AiInputSection>
            <AiInputLabel>사업을 설명해보세요</AiInputLabel>
            <AiTextArea
              placeholder={'예: 나는 웹소설 작가야. 카카오페이지에서 회당 300원 받고 연재중이야.\n고정비는 월 5만원, 하루 4시간 작업해.'}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={3}
              disabled={aiParsing}
            />
            <AiButtonRow>
              <AiParseButton onClick={handleAiParse} disabled={aiParsing || !aiText.trim()}>
                {aiParsing ? '분석 중...' : 'AI로 자동 분석'}
              </AiParseButton>
              {aiSuggestion && <AiSuggestionText>{aiSuggestion}</AiSuggestionText>}
            </AiButtonRow>
          </AiInputSection>

          <Divider>
            <DividerLine />
            <DividerText>또는 직접 선택하세요</DividerText>
            <DividerLine />
          </Divider>

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
            <BepChart result={analysisResult.result} />
          </ResultContainer>

          {/* 프로젝트 저장 */}
          {saveSuccess ? (
            <SaveSuccessBanner>
              \u2705 &quot;{saveSuccess.title}&quot; \uD504\uB85C\uC81D\uD2B8\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4!
              <ViewProjectButton onClick={() => navigate(`/projects/${saveSuccess.id}`)}>
                \uD504\uB85C\uC81D\uD2B8 \uBCF4\uAE30 \u2192
              </ViewProjectButton>
            </SaveSuccessBanner>
          ) : isAuthenticated ? (
            <SaveButton onClick={handleSaveAsProject} disabled={saving}>
              {saving ? '\uC800\uC7A5 \uC911...' : '\uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD558\uAE30'}
            </SaveButton>
          ) : (
            <LoginPrompt>
              <span>\uB85C\uADF8\uC778\uD558\uBA74 \uBD84\uC11D \uACB0\uACFC\uB97C \uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</span>
              <LoginLink onClick={() => navigate('/login')}>\uB85C\uADF8\uC778 \u2192</LoginLink>
            </LoginPrompt>
          )}

          <ButtonRow>
            <SecondaryButton onClick={() => setStep(2)}>입력값 수정</SecondaryButton>
            <SecondaryButton onClick={() => { setStep(1); setAnalysisResult(null); setTemplate(null); setFormValues({}); setSaveSuccess(null); }}>
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

// ── Step 1: AI Input ──

const AiInputSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
`;

const AiInputLabel = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
`;

const AiTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
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

const AiButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const AiParseButton = styled.button`
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #7209b7, #4361ee);
  color: #fff;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AiSuggestionText = styled.span`
  font-size: 0.8125rem;
  color: #7209b7;
  font-weight: 500;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #dee2e6;
`;

const DividerText = styled.span`
  font-size: 0.8125rem;
  color: #adb5bd;
  white-space: nowrap;
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

const SaveButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #06d6a0;
  color: #fff;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #05c090;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveSuccessBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f0fdf9;
  border: 1px solid #06d6a050;
  border-radius: 10px;
  margin-top: 1rem;
  font-size: 0.9375rem;
  color: #1a1a2e;
  flex-wrap: wrap;
`;

const ViewProjectButton = styled.button`
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;

const LoginPrompt = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #eef2ff;
  border-radius: 10px;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #495057;
  flex-wrap: wrap;
`;

const LoginLink = styled.button`
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: #3a56d4;
  }
`;
