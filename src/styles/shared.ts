import styled from 'styled-components';
import { theme } from './theme';

/* ── Buttons ── */

export const PrimaryButton = styled.button`
  padding: 0.75rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  font-weight: 600;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PrimaryButtonSm = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    border-color: #adb5bd;
  }
`;

export const AddButton = styled.button`
  padding: 0.375rem 0.875rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

export const BackButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

export const DeleteBtn = styled.button`
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: ${theme.colors.danger};
  border: 1px solid ${theme.colors.danger};
  border-radius: ${theme.borderRadius.sm};
  font-size: 0.6875rem;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.danger};
    color: ${theme.colors.surface};
  }
`;

/* ── Cards ── */

export const Card = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadow.md};
`;

export const InlineFormCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 10px;
  padding: 1.25rem;
`;

/* ── Feedback ── */

export const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: ${theme.colors.danger};
  border: 1px solid ${theme.colors.danger};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
`;

export const LoadingText = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  padding: 2rem 0;
`;

/* ── Form Components ── */

export const FormLabel = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

export const FormLabelSm = styled.label`
  font-size: ${theme.fontSize.xs};
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

export const FormInput = styled.input<{ $hasError?: boolean }>`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${theme.borderRadius.md};
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(239,71,111,0.15)' : 'rgba(67,97,238,0.15)'};
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const FormInputSm = styled.input`
  padding: 0.5rem 0.625rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: ${theme.fontSize.sm};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

export const FormSelect = styled.select`
  padding: 0.5rem 0.625rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: ${theme.fontSize.sm};
  background: ${theme.colors.surface};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

export const FormGroup = styled.div<{ $flex?: number }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: ${({ $flex }) => $flex || 1};
`;

export const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const FormErrorMsg = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.danger};
`;

/* ── Empty State ── */

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.textSecondary};

  p {
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
`;

export const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

export const EmptySub = styled.span`
  font-size: 0.8125rem;
  color: #adb5bd;
`;
