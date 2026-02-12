import { useState, useEffect, useCallback } from 'react';
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
import {
  Container,
  Section,
  SectionTitle,
  ErrorBanner,
  LoadingText,
  AiInputSection,
  AiInputLabel,
  AiTextArea,
  AiButtonRow,
  AiParseButton,
  AiSuggestionText,
  Divider,
  DividerLine,
  DividerText,
  CategoryGrid,
  CategoryCard,
  CatName,
  CatDesc,
  StepHeader,
  BackButton,
  TemplateBadge,
  FormContainer,
  FormSection,
  FormSectionTitle,
  FieldRow,
  FieldGroup,
  FieldLabel,
  FieldUnit,
  RequiredMark,
  FieldInput,
  Select,
  AutoCalcBox,
  HelpText,
  AnalyzeButton,
  ResultContainer,
  ButtonRow,
  SecondaryButton,
  SaveButton,
  SaveSuccessBanner,
  ViewProjectButton,
  LoginPrompt,
  LoginLink,
} from './styles/ScriptAnalysis.styles';

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
              &#x2705; &quot;{saveSuccess.title}&quot; &#xD504;&#xB85C;&#xC81D;&#xD2B8;&#xAC00; &#xC0DD;&#xC131;&#xB418;&#xC5C8;&#xC2B5;&#xB2C8;&#xB2E4;!
              <ViewProjectButton onClick={() => navigate(`/projects/${saveSuccess.id}`)}>
                &#xD504;&#xB85C;&#xC81D;&#xD2B8; &#xBCF4;&#xAE30; &#x2192;
              </ViewProjectButton>
            </SaveSuccessBanner>
          ) : isAuthenticated ? (
            <SaveButton onClick={handleSaveAsProject} disabled={saving}>
              {saving ? '\uC800\uC7A5 \uC911...' : '\uD504\uB85C\uC81D\uD2B8\uB85C \uC800\uC7A5\uD558\uAE30'}
            </SaveButton>
          ) : (
            <LoginPrompt>
              <span>&#xB85C;&#xADF8;&#xC778;&#xD558;&#xBA74; &#xBD84;&#xC11D; &#xACB0;&#xACFC;&#xB97C; &#xD504;&#xB85C;&#xC81D;&#xD2B8;&#xB85C; &#xC800;&#xC7A5;&#xD560; &#xC218; &#xC788;&#xC2B5;&#xB2C8;&#xB2E4;.</span>
              <LoginLink onClick={() => navigate('/login')}>&#xB85C;&#xADF8;&#xC778; &#x2192;</LoginLink>
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
