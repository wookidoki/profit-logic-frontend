import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { PrimaryButton } from '../styles/shared';
import { useAuth } from '../hooks/useAuth';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }
  if (!password) {
    errors.password = '비밀번호를 입력해주세요.';
  }
  return errors;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { login, loading, error } = useAuth();
  const [searchParams] = useSearchParams();
  const signupSuccess = searchParams.get('signup') === 'success';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    login({ email, password });
  };

  return (
    <Container>
      <FormCard>
        <Title>Profit Logic</Title>
        <Subtitle>로그인</Subtitle>
        {signupSuccess && <SuccessMsg>회원가입이 완료되었습니다. 로그인해주세요.</SuccessMsg>}
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
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              $hasError={!!fieldErrors.password}
            />
            {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          </FieldGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </SubmitButton>
        </Form>
        <LinkText>
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
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

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef476f' : '#dee2e6')};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? '#ef476f' : '#4361ee')};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(239, 71, 111, 0.1)' : 'rgba(67, 97, 238, 0.1)'};
  }
`;

const FieldError = styled.span`
  color: #ef476f;
  font-size: 0.75rem;
  padding-left: 0.25rem;
`;

const SubmitButton = PrimaryButton;

const SuccessMsg = styled.p`
  color: #06d6a0;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f0fdf8;
  border-radius: 6px;
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
