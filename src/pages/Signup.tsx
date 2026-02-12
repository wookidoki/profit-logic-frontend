import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PrimaryButton } from '../styles/shared';
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

interface FieldErrors {
  email?: string;
  nickname?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function validateFields(email: string, nickname: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = '이메일은 필수입니다.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }
  if (!nickname.trim()) {
    errors.nickname = '닉네임은 필수입니다.';
  } else if (nickname.trim().length < 2 || nickname.trim().length > 20) {
    errors.nickname = '닉네임은 2~20자 사이여야 합니다.';
  }
  if (!password) {
    errors.password = '비밀번호는 필수입니다.';
  } else if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = '비밀번호는 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.';
  }
  return errors;
}

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { signup, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields(email, nickname, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    signup({ email, password, nickname });
  };

  return (
    <Container>
      <FormCard>
        <Title>Profit Logic</Title>
        <Subtitle>회원가입</Subtitle>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              $hasError={!!fieldErrors.email}
            />
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </FieldGroup>
          <FieldGroup>
            <Input
              type="text"
              placeholder="닉네임 (2~20자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              $hasError={!!fieldErrors.nickname}
            />
            {fieldErrors.nickname && <FieldError>{fieldErrors.nickname}</FieldError>}
          </FieldGroup>
          <FieldGroup>
            <Input
              type="password"
              placeholder="비밀번호 (영문+숫자+특수문자 8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              $hasError={!!fieldErrors.password}
            />
            {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          </FieldGroup>
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
  background: ${theme.colors.background};
`;

const FormCard = styled.div`
  background: ${theme.colors.surface};
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${theme.colors.textSecondary};
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(239, 71, 111, 0.1)' : 'rgba(67, 97, 238, 0.1)'};
  }
`;

const FieldError = styled.span`
  color: ${theme.colors.danger};
  font-size: 0.75rem;
  padding-left: 0.25rem;
`;

const SubmitButton = PrimaryButton;

const ErrorMsg = styled.p`
  color: ${theme.colors.danger};
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
  color: ${theme.colors.textSecondary};

  a {
    color: ${theme.colors.primary};
    font-weight: 600;
  }
`;
