import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const WORDS = ['진짜 수익', '실질 시급', '손익분기점', '공헌이익률'];

export default function Landing() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (displayed.length < word.length) {
        timer = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 100);
      } else {
        timer = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 60);
      } else {
        setDeleting(false);
        setWordIdx((prev) => (prev + 1) % WORDS.length);
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, wordIdx]);

  return (
    <Page>
      {/* Animated background */}
      <BgOrb1 />
      <BgOrb2 />
      <BgOrb3 />
      <GridOverlay />

      {/* Nav */}
      <TopNav>
        <NavLogo>Profit Logic</NavLogo>
        <NavActions>
          <NavLink onClick={() => navigate('/consult')}>맞춤 상담</NavLink>
          <NavLink onClick={() => navigate('/board')}>커뮤니티</NavLink>
          <NavLoginBtn onClick={() => navigate('/login')}>로그인</NavLoginBtn>
        </NavActions>
      </TopNav>

      {/* Hero */}
      <Hero>
        <HeroInner>
          <Badge>
            <PulseDot />
            1인 사업자를 위한 AI 손익 분석
          </Badge>

          <Title>
            내 사업,<br />
            <TypeWriter>
              <Accent>{displayed}</Accent>
              <Cursor>|</Cursor>
            </TypeWriter>
            <br />
            알고 계신가요?
          </Title>

          <Desc>
            대화형 AI 상담사가 당신의 사업을 분석합니다.<br />
            크리에이터 유형에 맞는 맞춤 질문으로 손익분기점 · 실질 시급을 즉시 분석합니다.
          </Desc>

          <Buttons>
            <PrimaryBtn onClick={() => navigate('/signup')}>
              무료로 시작하기
              <BtnArrow>&rarr;</BtnArrow>
            </PrimaryBtn>
            <SecondaryBtn onClick={() => navigate('/consult')}>
              바로 상담해보기
            </SecondaryBtn>
          </Buttons>

          <Sub>가입 없이도 맞춤 분석을 체험할 수 있습니다</Sub>
        </HeroInner>

        {/* Floating tags */}
        <FloatTag style={{ top: '18%', left: '8%' }} $delay="0s" $dur="6s">BEP</FloatTag>
        <FloatTag style={{ top: '30%', right: '6%' }} $delay="1s" $dur="7s">실질시급</FloatTag>
        <FloatTag style={{ bottom: '28%', left: '5%' }} $delay="2s" $dur="5s">공헌이익률</FloatTag>
        <FloatTag style={{ bottom: '18%', right: '10%' }} $delay="0.5s" $dur="8s">안전마진</FloatTag>
        <FloatTag style={{ top: '12%', right: '22%' }} $delay="1.5s" $dur="6.5s">월 추이</FloatTag>
        <FloatTag style={{ bottom: '35%', left: '18%' }} $delay="3s" $dur="7.5s">목표 추적</FloatTag>
      </Hero>
    </Page>
  );
}

/* ── Animations ── */

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const orbFloat1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
`;

const orbFloat2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.05); }
  66% { transform: translate(25px, -40px) scale(0.9); }
`;

const orbFloat3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 40px) scale(1.08); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.8); }
`;

/* ── Styled Components ── */

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #0a0a1a;
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(67, 97, 238, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(67, 97, 238, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
`;

const BgOrb1 = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(67, 97, 238, 0.15) 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation: ${orbFloat1} 12s ease-in-out infinite;
  pointer-events: none;
`;

const BgOrb2 = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(6, 214, 160, 0.1) 0%, transparent 70%);
  bottom: -5%;
  right: -8%;
  animation: ${orbFloat2} 15s ease-in-out infinite;
  pointer-events: none;
`;

const BgOrb3 = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 162, 97, 0.08) 0%, transparent 70%);
  top: 40%;
  right: 20%;
  animation: ${orbFloat3} 10s ease-in-out infinite;
  pointer-events: none;
`;

/* ── Nav ── */

const TopNav = styled.nav`
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
`;

const NavLogo = styled.div`
  font-size: 1.375rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled.button`
  background: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;

const NavLoginBtn = styled.button`
  padding: 0.5rem 1.25rem;
  background: rgba(67, 97, 238, 0.2);
  color: #8ea4f7;
  border: 1px solid rgba(67, 97, 238, 0.3);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    background: #4361ee;
    color: #fff;
    border-color: #4361ee;
  }
`;

/* ── Hero ── */

const Hero = styled.section`
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
`;

const HeroInner = styled.div`
  text-align: center;
  max-width: 700px;
  animation: ${fadeInUp} 1s ease-out;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.1rem;
  background: rgba(67, 97, 238, 0.1);
  border: 1px solid rgba(67, 97, 238, 0.2);
  color: #8ea4f7;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const PulseDot = styled.span`
  width: 8px;
  height: 8px;
  background: #06d6a0;
  border-radius: 50%;
  display: inline-block;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 3.25rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.35;
  letter-spacing: -1.5px;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    font-size: 2.25rem;
  }
`;

const TypeWriter = styled.span`
  display: inline;
`;

const Accent = styled.span`
  background: linear-gradient(135deg, #4361ee, #06d6a0);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 4s ease infinite;
`;

const Cursor = styled.span`
  color: #4361ee;
  font-weight: 300;
  animation: ${blink} 1s step-end infinite;
  -webkit-text-fill-color: #4361ee;
`;

const Desc = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.8;
  margin-bottom: 2.5rem;
  animation: ${fadeInUp} 1s ease-out 0.2s backwards;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  animation: ${fadeInUp} 1s ease-out 0.4s backwards;
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.25rem;
  background: linear-gradient(135deg, #4361ee, #3a56d4);
  color: #fff;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  transition: all 0.25s;
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(67, 97, 238, 0.5);
  }
`;

const BtnArrow = styled.span`
  transition: transform 0.2s;
  ${PrimaryBtn}:hover & {
    transform: translateX(4px);
  }
`;

const SecondaryBtn = styled.button`
  padding: 1rem 2.25rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.25s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Sub = styled.p`
  margin-top: 1.25rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.25);
  animation: ${fadeInUp} 1s ease-out 0.6s backwards;
`;

/* ── Floating Tags ── */

const FloatTag = styled.span<{ $delay: string; $dur: string }>`
  position: absolute;
  padding: 0.4rem 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  animation: ${floatY} ${({ $dur }) => $dur} ease-in-out ${({ $delay }) => $delay} infinite;
  pointer-events: none;
  user-select: none;

  @media (max-width: 768px) {
    display: none;
  }
`;
