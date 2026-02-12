# 변경 이력 (CHANGELOG)

모든 주요 변경사항을 날짜순으로 기록합니다.

---

## [0.4.0] - 2026-02-12 — 품질 + UX 개선

### Frontend
- **refactor(styles)**: 33개 파일의 하드코딩 hex 색상을 theme.colors 토큰으로 전환
- **feat(ui)**: ErrorBoundary 전역 에러 처리 컴포넌트 추가 및 App.tsx 래핑
- **feat(ui)**: LoadingSpinner 애니메이션 컴포넌트 추가, 7개 페이지 적용
- **refactor(form)**: ProjectCreate/Edit 공통 폼 스타일 추출 (PROJECT_FIELDS, ProjectFormCard 등)
- **refactor(cleanup)**: 미사용 컴포넌트 삭제 (AiParseModal, ProjectInputForm)
- **feat(seo)**: index.html 메타 태그, OG 태그, favicon.svg 추가

### Backend
- **fix(admin)**: AdminService 사용자 목록 N+1 쿼리 → GROUP BY JPQL 최적화

---

## [0.3.0] - 2026-02-12 — 구조 리팩토링

### Frontend
- **refactor(ui)**: 분석 컴포넌트 레이블을 크리에이터 용어로 통일
- **refactor(consult)**: ConsultPage 882줄 → 487줄 (카테고리/스타일 파일 분리)
- **refactor(script)**: ScriptAnalysis 803줄 → 429줄 (스타일 파일 분리)
- **refactor(styles)**: PageContainer, LoadingState, ErrorState 등 공통 레이아웃 추출
- **fix(auth)**: axios 401 인터셉터에서 authStore.logout() 연동

### Backend
- **refactor(chat)**: ChatService 규칙기반 응답 14개 패턴 + LLM 폴백 하이브리드로 재설계
- **refactor(llm)**: 시스템 프롬프트 크리에이터 관점으로 간소화
- **docs**: 백엔드 README 작성

---

## [0.2.0] - 2026-02-12 — 크리에이터 용어 통일 + 기능 확장

### Frontend
- **refactor**: UI 전체 용어를 크리에이터 관점으로 변경
- **refactor**: placeholder를 크리에이터 맥락 예시로 변경
- **fix(api)**: AdminApi 응답 타입 snake_case 통일
- **fix**: ConsultPage 네비게이션 연결, Dashboard 흐름 수정

### Backend
- **refactor**: DTO 도메인별 하위 패키지 정리
- **feat**: 데모 + 페르소나 30개 시드 데이터 보강
- **test**: 시나리오 통합 테스트 (크리에이터/셀러/개발자/관리자)

---

## [0.1.0] - 2026-02-12 — 초기 기능 구현

### Frontend
- React 19 + TypeScript + Vite 프로젝트 초기화
- 인증 (Login, Signup) + Zustand 상태 관리
- 프로젝트 CRUD (Create, List, Detail, Edit)
- 분석 시각화 (BepChart, ResultCards, TrendChart, GoalProgressPanel)
- AI 채팅 (ChatPage), 맞춤 상담 (ConsultPage), 스크립트 분석 (ScriptAnalysis)
- 커뮤니티 (BoardListPage, BoardDetailPage, BoardWritePage)
- 관리자 대시보드 (AdminPage)
- 랜딩 페이지 (Landing) + 대시보드 (Dashboard)

### Backend
- Spring Boot 3.5 + Java 21 프로젝트 초기화
- JWT 인증 + Spring Security
- 프로젝트 CRUD + 수익성 분석 엔진
- 비용/시간 관리 API
- AI 채팅 + 리포트 생성 (Gemini API)
- 맞춤 상담 + AI 자동 입력
- 커뮤니티 게시글/댓글 API
- 대시보드 + 월별 추이 + 목표 추적 + 가격 시뮬레이션
- 관리자 API (통계, 사용자 관리)
- GitHub Actions CI/CD 파이프라인
- AWS EC2 배포

---

## 커밋 컨벤션

```
type(scope): 한글 설명

본문 (선택)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>  # AI 보조 시
```

**Type**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
**Scope**: `ui`, `auth`, `chat`, `admin`, `styles`, `form`, `seo`, `llm`, `script`, `consult`, `cleanup`
