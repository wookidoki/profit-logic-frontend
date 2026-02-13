# Profit Logic — Frontend

> 1인 크리에이터를 위한 AI 수익성 분석 서비스

🔗 **배포 URL:** http://profitlogic.cloud
⚙️ **Backend:** [profit-logic-backend](https://github.com/wookidoki/profit-logic-backend)

---

## 서비스 소개

본업과 사이드 프로젝트를 병행하는 1인 크리에이터가
**"이 사이드에 시간 쓸 가치가 있는가?"** 를 데이터로 판단할 수 있도록 돕습니다.

### 핵심 분석 지표

| 지표 | 설명 |
|------|------|
| **월 최소 건수 (BEP)** | 고정비를 회수하기 위해 매월 최소 필요한 판매 건수 |
| **실질 시급** | (매출 - 총비용) ÷ 투입시간. 본업 시급과 비교 |
| **건당 순수익률** | (건당 수익 - 건당 비용) ÷ 건당 수익 |
| **안전마진** | 현재 판매량이 BEP 대비 얼마나 여유 있는지 |
| **기회비용 반영 수익** | 영업이익 - (투입시간 × 본업 시급) |

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.9 | 타입 안전성 |
| Vite | 7.3 | 빌드 도구 |
| styled-components | 6.3 | CSS-in-JS (theme 토큰 시스템) |
| Zustand | 5.0 | 전역 상태 관리 (인증) |
| React Hook Form | 7.71 | 폼 관리 + 유효성 검사 |
| Recharts | 3.7 | 차트 시각화 |
| React Router | 7.13 | SPA 라우팅 |
| Axios | 1.13 | HTTP 클라이언트 (인터셉터 + JWT 자동 첨부) |
| Vitest | — | 테스트 (57개) |

---

## 페이지 구성 (16개)

| 페이지 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| 랜딩 | `/` | — | 서비스 소개 + CTA |
| 대시보드 | `/` | JWT | 프로젝트 요약 + 인사이트 |
| 맞춤 상담 | `/consult` | — | 크리에이터 유형별 단계적 질문 → 분석 |
| 스크립트 분석 | `/scripts` | — | 스크립트 기반 프로젝트 생성 |
| 프로젝트 목록 | `/projects` | JWT | 내 프로젝트 목록 |
| 프로젝트 생성 | `/projects/new` | JWT | 수동 프로젝트 생성 |
| 프로젝트 상세 | `/projects/:id` | JWT | 분석 + 비용 + 시간 + 시뮬레이션 + 추이 + 목표 + 리포트 |
| 프로젝트 수정 | `/projects/:id/edit` | JWT | 프로젝트 정보 편집 |
| AI 채팅 | `/chat` | JWT | 프로젝트 데이터 기반 AI 상담 |
| 게시판 | `/board` | — | 커뮤니티 목록 |
| 글쓰기 | `/board/write` | JWT | 게시글 작성 |
| 글 상세 | `/board/:id` | — | 게시글 + 댓글 |
| 마이페이지 | `/mypage` | JWT | 프로필 + 일별 자동 저널 |
| 관리자 | `/admin` | ADMIN | 통계 + 사용자/게시글 관리 |
| 로그인 | `/login` | — | |
| 회원가입 | `/signup` | — | |

---

## 실행 방법

### 사전 요구사항
- Node.js 20+
- Backend 서버 실행 중 (`http://localhost:8080`)

### 로컬 개발
```bash
git clone https://github.com/wookidoki/profit-logic-frontend.git
cd profit-logic-frontend
npm install
npm run dev              # → http://localhost:5173
```

### 빌드
```bash
npm run build            # dist/ 생성
npm run preview          # 프로덕션 빌드 미리보기
```

### 타입 체크 & 테스트
```bash
npx tsc --noEmit         # TypeScript 타입 검사
npm run test             # Vitest 57개 테스트
```

---

## 프로젝트 구조

```
src/
├── api/                       # API 모듈 (17개)
│   ├── axios.ts                   # Axios 인스턴스 (인터셉터, JWT 자동 첨부)
│   ├── projectApi.ts              # 프로젝트 CRUD
│   ├── chatApi.ts                 # AI 채팅
│   ├── analysisApi.ts             # 수익성 분석
│   ├── costApi.ts                 # 비용 상세 + CSV 업로드
│   ├── timeLogApi.ts              # 작업시간
│   ├── scriptApi.ts               # 맞춤 상담 스크립트
│   ├── reportApi.ts               # AI 리포트
│   ├── dashboardApi.ts            # 대시보드 요약
│   ├── trendApi.ts                # 월별 추이
│   ├── goalApi.ts                 # 목표 추적
│   ├── communityApi.ts            # 게시판
│   ├── adminApi.ts                # 관리자
│   ├── myPageApi.ts               # 마이페이지
│   ├── authApi.ts                 # 인증
│   └── errorUtils.ts              # 에러 핸들링 유틸
│
├── components/                # 공통 컴포넌트 (15개)
│   ├── Layout.tsx                 # 네비게이션 + 페이지 레이아웃
│   ├── ErrorBoundary.tsx          # 전역 에러 처리 (class component)
│   ├── LoadingSpinner.tsx         # 로딩 스피너 (10개 페이지 적용)
│   ├── ProtectedRoute.tsx         # JWT 인증 라우트 가드
│   ├── AdminRoute.tsx             # ADMIN 역할 라우트 가드
│   ├── BepChart.tsx               # BEP 시각화 차트
│   ├── TrendChart.tsx             # 월별 추이 라인 차트
│   ├── EnhancedAnalysisPanel.tsx  # 상세 수익성 분석 패널
│   ├── ScenarioSimulator.tsx      # 가격 시뮬레이션 UI
│   ├── CostDetailPanel.tsx        # 비용 상세 관리 (+ CostForm)
│   ├── TimeLogPanel.tsx           # 작업시간 기록 (+ TimeLogForm)
│   ├── GoalProgressPanel.tsx      # 목표 달성률 시각화
│   ├── ReportPanel.tsx            # AI 리포트 표시
│   └── ResultCards.tsx            # 분석 결과 카드
│
├── pages/                     # 라우트 페이지 (16개)
│   ├── Landing.tsx                # 랜딩 (비로그인 홈)
│   ├── Dashboard.tsx              # 대시보드 (로그인 홈)
│   ├── ConsultPage.tsx            # 맞춤 상담
│   ├── ScriptAnalysis.tsx         # 스크립트 분석
│   ├── ProjectList/Create/Detail/Edit.tsx
│   ├── ChatPage.tsx               # AI 채팅
│   ├── BoardListPage/DetailPage/WritePage.tsx
│   ├── MyPage.tsx                 # 마이페이지 + 일별 저널
│   ├── AdminPage.tsx              # 관리자 대시보드
│   ├── Login.tsx / Signup.tsx
│   └── styles/                    # 페이지별 styled-components 분리
│       ├── ConsultPage.styles.ts
│       └── ScriptAnalysis.styles.ts
│
├── constants/                 # 상수
│   └── categories.ts             # 크리에이터 5유형 카테고리 데이터
│
├── hooks/                     # 커스텀 훅
│   ├── useAuth.ts                 # 인증 상태 훅
│   ├── useCalculate.ts            # 계산 유틸 훅
│   └── useDebounce.ts             # 디바운스 훅
│
├── store/                     # 전역 상태
│   └── authStore.ts               # Zustand (토큰, 사용자 정보, 로그인/로그아웃)
│
├── styles/                    # 디자인 시스템
│   ├── theme.ts                   # 색상, 폰트, 간격, 그림자 토큰
│   ├── shared.ts                  # 공통 styled-components (PageContainer, Card, Form 등)
│   └── GlobalStyle.ts             # CSS 리셋 + 기본 스타일
│
├── types/                     # TypeScript 타입 (8개)
│   ├── index.ts                   # 공통 (ResponseData, Project, User 등)
│   ├── finance.ts                 # 분석 관련 (BepDto, ShadowWageDto 등)
│   ├── chat.ts, community.ts, script.ts, auth.ts, ai.ts, mypage.ts
│
├── utils/                     # 유틸리티
│   ├── formatNumber.ts            # 숫자 포맷 (원, %, 시간)
│   ├── analysisHelper.ts          # 분석 결과 해석 유틸
│   └── dateFilter.ts              # 날짜 필터
│
└── App.tsx                    # 라우터 + ErrorBoundary
```

---

## 시드 데이터 (자동 생성)

백엔드 `DataInitializer`가 개발 환경에서 자동으로 33개 계정 + 샘플 데이터를 생성합니다.

| 계정 | 이메일 | 비밀번호 |
|------|--------|---------|
| 데모 | `demo@profitlogic.com` | `demo1234` |
| 관리자 | `admin@profitlogic.com` | `admin1234` |

---

## 배포

### CI/CD
```
PR 생성 → GitHub Actions (tsc, build)
develop merge → SSH → EC2 배포 스크립트 → Docker Compose
```

### 인프라
```
AWS EC2
├── Nginx (포트 80) → 정적 파일 서빙 + /api/ 리버스 프록시
├── Spring Boot (포트 8080)
└── MySQL 8.0 (Docker Volume)
```

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [시스템 아키텍처](docs/ARCHITECTURE.md) | 전체 구조, AI 이중 시스템, Docker 구성 |
| [개발 히스토리](docs/DEVELOPMENT_HISTORY.md) | Phase 1~5 개선 과정 |
| [트러블슈팅](docs/TROUBLESHOOTING.md) | 주요 이슈 해결 기록 |
| [API 명세서](docs/API_SPEC.md) | 35개 엔드포인트 상세 |
| [변경 이력](docs/CHANGELOG.md) | 버전별 변경 사항 |
