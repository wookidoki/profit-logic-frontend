import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

/* ── Main Layout ── */

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  max-width: 800px;
  margin: 0 auto;
  background: ${theme.colors.surface};
`;

export const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/* ── Messages ── */

export const MessageRow = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  gap: 0.5rem;
`;

export const BotAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const Bubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: ${({ $role }) => ($role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  background: ${({ $role }) => ($role === 'user' ? theme.colors.primary : '#f1f3f5')};
  color: ${({ $role }) => ($role === 'user' ? theme.colors.surface : theme.colors.text)};
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

/* ── Category Cards ── */

export const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0 0.5rem 2.5rem;
`;

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: ${theme.colors.surface};
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $color }) => $color};
    box-shadow: 0 2px 12px ${({ $color }) => $color}25;
    transform: translateY(-1px);
  }
`;

export const CatIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

export const CatInfo = styled.div``;

export const CatName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

export const CatDesc = styled.div`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.125rem;
`;

export const FreeInputBtn = styled.button`
  align-self: flex-start;
  padding: 0.5rem 0.875rem;
  background: transparent;
  color: ${theme.colors.primary};
  border: 1px dashed ${theme.colors.primary};
  border-radius: 20px;
  font-size: 0.8125rem;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}10;
  }
`;

/* ── Results Card ── */

export const ResultCard = styled.div`
  margin-left: 2.5rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0fdf9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
`;

export const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ResultLabel = styled.span`
  font-size: 0.6875rem;
  color: ${theme.colors.textSecondary};
`;

export const ResultValue = styled.span<{ $color: string }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

export const ViabilityBadge = styled.span<{ $viable: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: ${({ $viable }) => ($viable ? `${theme.colors.success}15` : `${theme.colors.danger}15`)};
  color: ${({ $viable }) => ($viable ? theme.colors.success : theme.colors.danger)};
  width: fit-content;
`;

/* ── Save Section ── */

export const SaveSection = styled.div`
  margin-left: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #eef2ff;
  border-radius: 12px;
`;

export const SaveText = styled.div`
  font-size: 0.8125rem;
  color: #495057;
  line-height: 1.5;
`;

export const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background 0.2s;
  width: fit-content;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* ── Saved Section ── */

export const SavedSection = styled.div`
  margin-left: 2.5rem;
  padding: 1.25rem;
  background: #f0fdf9;
  border: 1px solid ${theme.colors.success}50;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SavedText = styled.div`
  font-size: 0.875rem;
  color: ${theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const SavedActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ActionBtn = styled.button<{ $secondary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s;
  background: ${({ $secondary }) => ($secondary ? theme.colors.surface : theme.colors.primary)};
  color: ${({ $secondary }) => ($secondary ? theme.colors.primary : theme.colors.surface)};
  border: 1px solid ${({ $secondary }) => ($secondary ? theme.colors.primary : 'transparent')};

  &:hover {
    opacity: 0.85;
  }
`;

/* ── Typing Indicator ── */

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
`;

export const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 0.25rem 0;
`;

export const Dot = styled.div<{ $i: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #adb5bd;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $i }) => $i * 0.2}s;
`;

/* ── Input Area ── */

export const InputArea = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: ${theme.colors.surface};
  flex-shrink: 0;
`;

export const InputField = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1.5px solid ${theme.colors.border};
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
  &:disabled {
    background: ${theme.colors.background};
    cursor: not-allowed;
  }
  &::placeholder {
    color: #adb5bd;
  }
`;

export const SendBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }
  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;
