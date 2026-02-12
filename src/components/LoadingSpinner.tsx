import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

interface Props { text?: string; }

export default function LoadingSpinner({ text = '불러오는 중...' }: Props) {
  return (
    <Container>
      <Spinner />
      <Text>{text}</Text>
    </Container>
  );
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Text = styled.span`
  font-size: 0.875rem;
  color: ${theme.colors.textSecondary};
`;
