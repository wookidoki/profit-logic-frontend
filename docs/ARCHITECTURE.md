# 시스템 아키텍처

## 전체 구성도

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│                                                         │
│  React 19 + TypeScript + Vite                          │
│  styled-components (theme token system)                │
│  Zustand (auth state) + React Router (SPA routing)     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                 │
│                                                         │
│  /              → 정적 파일 (Vite build output)         │
│  /v1/**         → Spring Boot API (localhost:8080)      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot 3.5 (Java 21)                  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Controller  │  │   Service    │  │  Repository   │  │
│  │  (REST API)  │──│  (Business)  │──│  (JPA)        │  │
│  └─────────────┘  └──────┬───────┘  └───────┬───────┘  │
│                          │                   │          │
│  ┌───────────────┐       │         ┌─────────┴───────┐  │
│  │  Security     │       │         │    Database      │  │
│  │  (JWT Filter) │       │         │  H2 / MySQL     │  │
│  └───────────────┘       │         └─────────────────┘  │
│                          ▼                              │
│  ┌───────────────────────────────────────────────┐      │
│  │           LLM Client (WebFlux)                │      │
│  │  Gemini API  ←  PromptTemplates               │      │
│  │  규칙기반 폴백 (API 키 없을 때)                │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## 레이어 아키텍처

### Frontend

```
Pages (라우트)
  ↓ 사용
Components (재사용 UI)
  ↓ 사용
Styles (theme + shared styled-components)

Pages → Hooks (useAuth) → Store (Zustand)
Pages → API modules → Axios instance (interceptor: 401 자동 로그아웃)
```

### Backend

```
Controller (HTTP 진입점, 인증 처리)
  ↓
Service (비즈니스 로직, 트랜잭션 경계)
  ↓
Repository (데이터 접근)
  ↓
Domain (JPA Entity, enum, FinancialCalculator)
```

## 데이터 모델

```
User (1) ──── (N) Project
                    │
                    ├── (N) CostDetail     # 세부 비용 항목
                    ├── (N) TimeLog        # 일별 작업시간
                    ├── (N) Simulation     # 가격 시뮬레이션
                    ├── (N) SimulationLog  # 시뮬레이션 이력
                    ├── (N) Report         # AI 리포트
                    └── (N) ChatLog        # AI 채팅 이력

User (1) ──── (N) BoardPost
                    └── (N) Comment
```

### 주요 엔티티

| 엔티티 | 설명 | 주요 필드 |
|--------|------|-----------|
| User | 사용자 | email, nickname, role(USER/ADMIN), bizType |
| Project | 프로젝트 | title, price, variableCost, fixedCost, workHours, hourlyWage, creatorCategory |
| CostDetail | 비용 항목 | category(API_USAGE/SERVER/TOOL/MATERIAL/MARKETING/OUTSOURCING/OTHER), type(FIXED/VARIABLE), amount |
| TimeLog | 작업시간 | workDate, hours, description |
| ChatLog | AI 채팅 | question, answer |
| Report | 분석 리포트 | content (LLM 생성) |
| BoardPost | 게시글 | title, content, projectId(선택) |

## 인증/인가 흐름

```
1. POST /v1/auth/login → AuthService → JWT 발급 (role 포함)
2. 클라이언트: localStorage에 token + role 저장
3. API 호출: Authorization: Bearer {token}
4. JwtAuthenticationFilter: 토큰 검증 → SecurityContext에 role 설정
5. SecurityConfig: /v1/admin/** → ROLE_ADMIN 필요
```

## AI 채팅 아키텍처

```
사용자 질문
  ↓
ChatService.chat()
  ├── isGreeting() → 인사 응답 (규칙기반)
  ├── matchAny("BEP", "손익분기") → BEP 응답 (규칙기반)
  ├── matchAny("시급", "시간당") → 시급 응답 (규칙기반)
  ├── ... (14개 패턴)
  └── fallback → LLM 호출
         ├── buildSystemPrompt(project) → 컨텍스트 주입
         ├── GeminiClient.chat() → API 호출
         └── LLM 응답 없으면 → 규칙기반 폴백
```

## 디자인 시스템

### Theme Token

```typescript
theme = {
  colors: { primary, primaryHover, secondary, success, danger, warning,
            background, surface, text, textSecondary, border },
  fontSize: { xs ~ heading },
  spacing: { xs ~ xxl },
  borderRadius: { sm, md, lg, full },
  shadow: { sm, md, lg }
}
```

전체 33개 파일이 `theme.colors.*` 토큰을 사용하며, 하드코딩된 색상값은 없습니다.

## 주요 설계 결정

| 결정 | 이유 |
|------|------|
| styled-components + theme 토큰 | 일관된 디자인 시스템, 향후 다크모드 대응 용이 |
| Zustand (Redux 대신) | 인증 상태만 관리, 보일러플레이트 최소화 |
| 규칙기반 + LLM 하이브리드 채팅 | API 키 없이도 핵심 기능 동작, 비용 절감 |
| H2 인메모리 (개발) | 별도 DB 설치 없이 즉시 실행 가능 |
| Jackson SNAKE_CASE | 프론트-백 필드명 일치, 변환 불필요 |
| DataInitializer 시드 데이터 | 30개 페르소나로 즉시 다양한 시나리오 테스트 가능 |
