import { Component, type ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Title>문제가 발생했습니다</Title>
          <Message>페이지를 새로고침해주세요.</Message>
          <RefreshButton onClick={() => window.location.reload()}>
            새로고침
          </RefreshButton>
        </Container>
      );
    }
    return this.props.children;
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  color: ${theme.colors.text};
`;

const Message = styled.p`
  color: ${theme.colors.textSecondary};
`;

const RefreshButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border-radius: 8px;
  font-size: 0.875rem;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;
