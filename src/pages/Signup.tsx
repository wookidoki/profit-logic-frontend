import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const { signup, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ email, password, nickname });
  };

  return (
    <Container>
      <FormCard>
        <Title>Profit Logic</Title>
        <Subtitle>회원가입</Subtitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="닉네임 (2~20자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </SubmitButton>
        </Form>
        <LinkText>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </LinkText>
      </FormCard>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
`;

const FormCard = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #4361ee;
  text-align: center;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6c757d;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }
`;

const SubmitButton = styled.button`
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

const ErrorMsg = styled.p`
  color: #ef476f;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #fef2f4;
  border-radius: 6px;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6c757d;

  a {
    color: #4361ee;
    font-weight: 600;
  }
`;
