# 개발 히스토리

## 프로젝트 개요

- **프로젝트명**: Profit Logic
- **개발자**: wookidoki
- **개발 기간**: 2026년 2월
- **목적**: 1인 크리에이터를 위한 AI 기반 사이드 프로젝트 수익성 분석 서비스

---

## Phase 1: 코어 기능 구현

### 백엔드 기반 구축
- Spring Boot 3.5 + Java 21 프로젝트 초기화
- JWT 인증 시스템 (Spring Security)
- User, Project 엔티티 및 CRUD API
- FinancialCalculator: BEP, 실질 시급, 순수익률, 안전마진 계산 로직

### 프론트엔드 기반 구축
- React 19 + TypeScript + Vite 프로젝트 초기화
- styled-components 기반 UI
- React Router SPA 라우팅
- Zustand 인증 스토어
- Login, Signup, ProjectCreate, ProjectList, ProjectDetail 페이지

### 분석 기능
- 프로젝트 분석 API (BEP, 비용 구조, 시급 계산)
- BepChart (Recharts) 시각화
- ResultCards 분석 결과 표시

---

## Phase 2: 확장 기능

### 비용/시간 관리
- CostDetail CRUD API + 카테고리별 비용 관리 UI
- TimeLog CRUD API + 일별 작업시간 기록 UI
- 비용 소계 (고정비/변동비 구분)

### AI 기능
- LLM 클라이언트 (Spring WebFlux + Gemini API)
- ChatService: 프로젝트 컨텍스트 기반 AI 상담
- AI 리포트 생성 (ReportService)
- AI 자동 입력 (AiParseService): 자연어 → 프로젝트 데이터 추출
- 맞춤 상담 (ConsultPage): 크리에이터 유형별 단계적 질문

### 커뮤니티
- 게시글/댓글 CRUD API
- BoardListPage, BoardDetailPage, BoardWritePage

### 대시보드
- DashboardService: 프로젝트별 인사이트 집계
- 상태 판정 (STABLE/NORMAL/WARNING/DANGER/NO_DATA)
- 액션 카드 (경고/긍정/제안)

---

## Phase 3: 고급 분석

### 월별 추이
- TrendService: 월별 스냅샷 시계열 데이터
- TrendChart (Recharts Line Chart)

### 목표 추적
- GoalService: 목표 매출/기한 대비 진행률 계산
- GoalProgressPanel: 프로그레스 바 + 상태 표시

### 가격 시뮬레이션
- SimulationService: 가격 변경 시 BEP/수익률 변화 계산
- ScenarioSimulator UI

### 관리자 기능
- AdminController + AdminService: 통계, 사용자 관리, 삭제
- JWT에 role claim 추가
- AdminRoute 라우트 가드
- AdminPage: 통계 카드 + 사용자 관리 테이블

---

## Phase 4: 품질 개선 및 리팩토링

### prompt-03: 구조 리팩토링
- **ChatService 재설계**: ProjectAnalysisService 의존 제거, 규칙기반 응답 14개 패턴 + LLM 폴백 하이브리드
- **PromptTemplates 간소화**: 크리에이터 맥락 최적화
- **UI 용어 통일**: "판매가" → "건당 수익", "변동비" → "건당 비용", "BEP" → "월 최소 건수"
- **ConsultPage 분리**: 882줄 → 487줄 (categories.ts + ConsultPage.styles.ts 추출)
- **ScriptAnalysis 분리**: 803줄 → 429줄 (ScriptAnalysis.styles.ts 추출)
- **공통 레이아웃 추출**: PageContainer, LoadingState, ErrorState 등 shared.ts
- **axios 401 인터셉터**: window.location → authStore.logout() 연동

### prompt-04: 품질 + UX 개선
- **색상 토큰화 (Part A)**: 33개 파일의 하드코딩 hex 색상 → theme.colors.* 전환
- **N+1 쿼리 수정 (Part C)**: AdminService 사용자 목록 GROUP BY JPQL 최적화
- **미사용 코드 삭제 (Part D)**: AiParseModal, ProjectInputForm 삭제 (-344줄)
- **폼 중복 제거 (Part E)**: PROJECT_FIELDS 상수, ProjectFormCard/ProjectForm/GoalSection 공유
- **SEO (Part F)**: index.html 메타 태그, OG 태그, favicon.svg
- **ErrorBoundary (Part G)**: 전역 에러 처리 컴포넌트 + App.tsx 래핑
- **LoadingSpinner (Part H)**: 애니메이션 스피너 컴포넌트, 7개 페이지 적용

---

## Phase 5: 테스트 및 배포

### 테스트
- 백엔드 통합 테스트 50+개 (JUnit 5 + MockMvc)
- 30개 페르소나 시나리오 테스트 (크리에이터/셀러/개발자/관리자)
- 프론트엔드 유닛 테스트 (Vitest + Testing Library)

### CI/CD
- GitHub Actions CI: PR 시 자동 빌드/테스트
- GitHub Actions Deploy: develop 머지 시 EC2 자동 배포
- Nginx 리버스 프록시 설정

### 시드 데이터
- DataInitializer: 32개 계정 (admin + demo + 30 페르소나)
- 5개 크리에이터 유형 x 6명 = 30개 다양한 시나리오
- 각 페르소나별 프로젝트, 비용, 타임로그, 게시글 자동 생성

---

## 기술 부채 및 향후 계획

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| 다크모드 | theme 토큰 시스템 준비 완료 | 중 |
| 모바일 반응형 최적화 | 부분 적용 | 중 |
| E2E 테스트 (Playwright) | 미착수 | 중 |
| 이미지 업로드 (게시판) | 미착수 | 하 |
| 소셜 로그인 (OAuth) | 미착수 | 하 |
| 알림 시스템 | 미착수 | 하 |
