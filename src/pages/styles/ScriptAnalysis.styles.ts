import styled from 'styled-components';

// ── Styled Components ──────────────────────────────

export const Container = styled.div``;

export const Section = styled.section`
  max-width: 900px;
  margin: 1.5rem auto;
  padding: 0 2rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;


export const ErrorBanner = styled.div`
  max-width: 900px;
  margin: 1rem auto;
  padding: 0.75rem 2rem;
  background: #fff5f5;
  color: #ef476f;
  border: 1px solid #ef476f;
  border-radius: 8px;
  font-size: 0.875rem;
`;

export const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 3rem 0;
`;

// ── Step 1: AI Input ──

export const AiInputSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
`;

export const AiInputLabel = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
`;

export const AiTextArea = styled.textarea`
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

export const AiButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

export const AiParseButton = styled.button`
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

export const AiSuggestionText = styled.span`
  font-size: 0.8125rem;
  color: #7209b7;
  font-weight: 500;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

export const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #dee2e6;
`;

export const DividerText = styled.span`
  font-size: 0.8125rem;
  color: #adb5bd;
  white-space: nowrap;
`;

// ── Step 1: Category Grid ──

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

export const CategoryCard = styled.div<{ $color: string }>`
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

export const CatName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

export const CatDesc = styled.div`
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.5;
`;

// ── Step 2: Form ──

export const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const BackButton = styled.button`
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

export const TemplateBadge = styled.span<{ $color: string }>`
  padding: 0.375rem 0.75rem;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormSection = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

export const FormSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f3f5;
`;

export const FieldRow = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const FieldLabel = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const FieldUnit = styled.span`
  color: #adb5bd;
  font-weight: 400;
`;

export const RequiredMark = styled.span`
  color: #ef476f;
  font-weight: 700;
`;

export const FieldInput = styled.input`
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

export const Select = styled.select`
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

export const AutoCalcBox = styled.div`
  padding: 0.625rem 0.75rem;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #6c757d;
  font-style: italic;
`;

export const HelpText = styled.span`
  font-size: 0.75rem;
  color: #adb5bd;
`;

export const AnalyzeButton = styled.button`
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

export const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const SecondaryButton = styled.button`
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

export const SaveButton = styled.button`
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

export const SaveSuccessBanner = styled.div`
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

export const ViewProjectButton = styled.button`
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

export const LoginPrompt = styled.div`
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

export const LoginLink = styled.button`
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
