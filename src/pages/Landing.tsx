import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Page>
      {/* ── 네비게이션 ── */}
      <TopNav>
        <NavLogo>Profit Logic</NavLogo>
        <NavActions>
          <NavLink onClick={() => navigate('/scripts')}>무료 분석</NavLink>
          <NavLink onClick={() => navigate('/board')}>커뮤니티</NavLink>
          <NavLoginBtn onClick={() => navigate('/login')}>로그인</NavLoginBtn>
        </NavActions>
      </TopNav>

      {/* ── 히어로 섹션 ── */}
      <Hero>
        <HeroBg />
        <HeroContent>
          <HeroBadge>1인 사업자를 위한 AI 손익 분석</HeroBadge>
          <HeroTitle>
            내 사업,<br />
            <HeroAccent>진짜 수익</HeroAccent>이 얼마인지<br />
            알고 계신가요?
          </HeroTitle>
          <HeroDesc>
            판매가, 비용, 투입 시간만 입력하면<br />
            손익분기점 · 실질 시급 · 공헌이익률을 즉시 분석합니다.
          </HeroDesc>
          <HeroCTA>
            <CTAPrimary onClick={() => navigate('/signup')}>
              무료로 시작하기
            </CTAPrimary>
            <CTASecondary onClick={() => navigate('/scripts')}>
              바로 분석해보기
            </CTASecondary>
          </HeroCTA>
          <HeroSub>가입 없이도 맞춤 분석을 체험할 수 있습니다</HeroSub>
        </HeroContent>
      </Hero>

      {/* ── 핵심 지표 미리보기 ── */}
      <MetricsPreview>
        <MetricItem>
          <MetricIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </MetricIcon>
          <MetricTitle>손익분기점(BEP)</MetricTitle>
          <MetricDesc>몇 개를 팔아야 본전인지 정확히 계산</MetricDesc>
        </MetricItem>
        <MetricItem>
          <MetricIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </MetricIcon>
          <MetricTitle>실질 시급</MetricTitle>
          <MetricDesc>내 시간의 진짜 가치를 숫자로 확인</MetricDesc>
        </MetricItem>
        <MetricItem>
          <MetricIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </MetricIcon>
          <MetricTitle>공헌이익률</MetricTitle>
          <MetricDesc>매출 대비 실제로 남는 이익 비율</MetricDesc>
        </MetricItem>
        <MetricItem>
          <MetricIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef476f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </MetricIcon>
          <MetricTitle>안전마진</MetricTitle>
          <MetricDesc>매출이 얼마나 떨어져도 버틸 수 있는지</MetricDesc>
        </MetricItem>
      </MetricsPreview>

      {/* ── 기능 소개 ── */}
      <FeaturesSection>
        <SectionHeader>
          <SectionLabel>주요 기능</SectionLabel>
          <SectionTitle>사업의 숫자를 한눈에</SectionTitle>
        </SectionHeader>

        <FeatureGrid>
          <FeatureCard>
            <FeatureEmoji>🎯</FeatureEmoji>
            <FeatureName>맞춤 분석 스크립트</FeatureName>
            <FeatureDesc>
              크리에이터 · 셀러 · 개발자별 맞춤 질문으로
              복잡한 비용 구조를 쉽게 정리합니다.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureEmoji>📊</FeatureEmoji>
            <FeatureName>프로젝트 대시보드</FeatureName>
            <FeatureDesc>
              여러 프로젝트의 수익성을 한 화면에서 비교하고
              위험 신호를 즉시 파악합니다.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureEmoji>📈</FeatureEmoji>
            <FeatureName>월별 추이 트렌드</FeatureName>
            <FeatureDesc>
              BEP, 실질 시급, 총 비용의 월별 변화를
              차트로 추적하고 인사이트를 제공합니다.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureEmoji>🎯</FeatureEmoji>
            <FeatureName>목표 추적</FeatureName>
            <FeatureDesc>
              목표 매출과 기한을 설정하면 일일 판매 페이스와
              달성 가능성을 실시간으로 보여줍니다.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureEmoji>🤖</FeatureEmoji>
            <FeatureName>AI 경영 상담</FeatureName>
            <FeatureDesc>
              프로젝트 데이터를 기반으로 AI가 맞춤형
              비용 절감 · 가격 전략을 제안합니다.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureEmoji>💬</FeatureEmoji>
            <FeatureName>크리에이터 커뮤니티</FeatureName>
            <FeatureDesc>
              비슷한 고민을 가진 1인 사업자들과
              분석 경험과 노하우를 공유하세요.
            </FeatureDesc>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>

      {/* ── 타겟 사용자 ── */}
      <TargetSection>
        <SectionHeader>
          <SectionLabel>누구를 위한 서비스인가요?</SectionLabel>
          <SectionTitle>이런 분들에게 딱 맞습니다</SectionTitle>
        </SectionHeader>

        <TargetGrid>
          <TargetCard $accent="#4361ee">
            <TargetEmoji>✍️</TargetEmoji>
            <TargetTitle>크리에이터</TargetTitle>
            <TargetList>
              <li>웹소설 · 웹툰 작가</li>
              <li>유튜버 · 숏폼 크리에이터</li>
              <li>일러스트레이터 · 이모티콘 작가</li>
              <li>블로거 · 팟캐스터</li>
            </TargetList>
          </TargetCard>

          <TargetCard $accent="#06d6a0">
            <TargetEmoji>🛒</TargetEmoji>
            <TargetTitle>셀러</TargetTitle>
            <TargetList>
              <li>스마트스토어 · 쿠팡 셀러</li>
              <li>핸드메이드 · 수제 식품</li>
              <li>해외직구 · 리셀러</li>
              <li>의류 · 액세서리 판매</li>
            </TargetList>
          </TargetCard>

          <TargetCard $accent="#f4a261">
            <TargetEmoji>💻</TargetEmoji>
            <TargetTitle>개발자</TargetTitle>
            <TargetList>
              <li>SaaS · 웹서비스 운영</li>
              <li>앱 · 게임 개발자</li>
              <li>프리랜서 외주 개발</li>
              <li>API · 플러그인 판매</li>
            </TargetList>
          </TargetCard>
        </TargetGrid>
      </TargetSection>

      {/* ── CTA 섹션 ── */}
      <CTASection>
        <CTABox>
          <CTATitle>지금 바로 내 사업의 숫자를 확인하세요</CTATitle>
          <CTASub>가입은 30초, 첫 분석까지 2분이면 충분합니다.</CTASub>
          <CTAButtons>
            <CTAPrimary onClick={() => navigate('/signup')}>
              무료 회원가입
            </CTAPrimary>
            <CTAGhost onClick={() => navigate('/scripts')}>
              가입 없이 체험하기
            </CTAGhost>
          </CTAButtons>
        </CTABox>
      </CTASection>

      {/* ── 푸터 ── */}
      <Footer>
        <FooterLogo>Profit Logic</FooterLogo>
        <FooterText>1인 사업자를 위한 AI 손익 분석 플랫폼</FooterText>
        <FooterCopy>&copy; 2026 Profit Logic. All rights reserved.</FooterCopy>
      </Footer>
    </Page>
  );
}

/* ── Animations ── */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

/* ── Page ── */

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
`;

/* ── Top Nav ── */

const TopNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  z-index: 100;
  border-bottom: 1px solid #f1f3f5;
`;

const NavLogo = styled.div`
  font-size: 1.375rem;
  font-weight: 800;
  color: #4361ee;
  letter-spacing: -0.5px;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled.button`
  background: none;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
  &:hover { color: #4361ee; }
`;

const NavLoginBtn = styled.button`
  padding: 0.5rem 1.25rem;
  background: #4361ee;
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s;
  &:hover { background: #3a56d4; }
`;

/* ── Hero ── */

const Hero = styled.section`
  position: relative;
  padding: 6rem 2rem 5rem;
  text-align: center;
  overflow: hidden;
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(67, 97, 238, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(6, 214, 160, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 20% 30%, rgba(244, 162, 97, 0.04) 0%, transparent 50%);
  pointer-events: none;
`;

const HeroContent = styled.div`
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 1rem;
  background: #4361ee12;
  color: #4361ee;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.3;
  letter-spacing: -1px;
  margin-bottom: 1.25rem;

  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const HeroAccent = styled.span`
  color: #4361ee;
`;

const HeroDesc = styled.p`
  font-size: 1.125rem;
  color: #6c757d;
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const HeroCTA = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const CTAPrimary = styled.button`
  padding: 0.875rem 2rem;
  background: #4361ee;
  color: #fff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(67, 97, 238, 0.3);

  &:hover {
    background: #3a56d4;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.35);
  }
`;

const CTASecondary = styled.button`
  padding: 0.875rem 2rem;
  background: #fff;
  color: #4361ee;
  border: 2px solid #4361ee;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.2s;

  &:hover {
    background: #4361ee;
    color: #fff;
  }
`;

const HeroSub = styled.p`
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: #adb5bd;
`;

/* ── Metrics Preview ── */

const MetricsPreview = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 960px;
  margin: -2rem auto 0;
  padding: 0 2rem;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricItem = styled.div`
  background: #fff;
  border: 1px solid #f1f3f5;
  border-radius: 14px;
  padding: 1.5rem 1.25rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  animation: ${fadeInUp} 0.6s ease-out backwards;

  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const MetricIcon = styled.div`
  margin-bottom: 0.75rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const MetricTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.375rem;
`;

const MetricDesc = styled.p`
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.4;
`;

/* ── Section Common ── */

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4361ee;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: -0.5px;
`;

/* ── Features ── */

const FeaturesSection = styled.section`
  padding: 5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  padding: 1.75rem;
  background: #fff;
  border: 1px solid #f1f3f5;
  border-radius: 14px;
  transition: all 0.3s;

  &:hover {
    border-color: #4361ee30;
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.08);
    transform: translateY(-3px);
  }
`;

const FeatureEmoji = styled.div`
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
`;

const FeatureName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
`;

const FeatureDesc = styled.p`
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.6;
`;

/* ── Target Users ── */

const TargetSection = styled.section`
  padding: 5rem 2rem;
  background: #f8f9fa;
`;

const TargetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TargetCard = styled.div<{ $accent: string }>`
  background: #fff;
  border-radius: 14px;
  padding: 2rem 1.75rem;
  border-top: 4px solid ${({ $accent }) => $accent};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const TargetEmoji = styled.div`
  font-size: 2rem;
  margin-bottom: 0.75rem;
`;

const TargetTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
`;

const TargetList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    font-size: 0.875rem;
    color: #495057;
    padding-left: 1.25rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.5em;
      width: 6px;
      height: 6px;
      background: #dee2e6;
      border-radius: 50%;
    }
  }
`;

/* ── CTA Section ── */

const CTASection = styled.section`
  padding: 5rem 2rem;
`;

const CTABox = styled.div`
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  background: linear-gradient(135deg, #4361ee08, #06d6a008);
  border: 1px solid #4361ee15;
  border-radius: 20px;
  padding: 3.5rem 2rem;
`;

const CTATitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
`;

const CTASub = styled.p`
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 2rem;
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const CTAGhost = styled.button`
  padding: 0.875rem 2rem;
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: #4361ee;
    color: #4361ee;
  }
`;

/* ── Footer ── */

const Footer = styled.footer`
  text-align: center;
  padding: 2.5rem 2rem;
  border-top: 1px solid #f1f3f5;
`;

const FooterLogo = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #4361ee;
  margin-bottom: 0.25rem;
`;

const FooterText = styled.p`
  font-size: 0.8125rem;
  color: #adb5bd;
  margin-bottom: 0.5rem;
`;

const FooterCopy = styled.p`
  font-size: 0.75rem;
  color: #ced4da;
`;
