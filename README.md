# Profit Logic

> 1인 크리에이터를 위한 AI 기반 사이드 프로젝트 수익성 분석 서비스

본업과 사이드 프로젝트를 병행하는 웹소설 작가, 숏폼 크리에이터, 이모티콘 작가, 블로거, 인디 개발자 등
1인 크리에이터가 **"이 사이드에 시간 쓸 가치가 있는가?"** 를 데이터로 판단할 수 있도록 돕습니다.

## 서비스 소개

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **맞춤 상담** | 크리에이터 유형(웹소설/숏폼/이모티콘/블로그/인디개발)별 단계적 질문으로 프로젝트 자동 생성 |
| **수익성 분석 엔진** | 월 최소 건수(BEP), 실질 시급, 순수익률, 안전마진 자동 계산 |
| **AI 채팅 상담** | 프로젝트 재무 데이터 기반 맞춤형 AI 상담 |
| **비용/시간 관리** | 세부 비용 항목(재료비, 구독료, 외주비 등)과 일별 작업시간 기록 |
| **가격 시뮬레이션** | 가격 변경 시 BEP/수익률 변화 즉시 시뮬레이션 |
| **월별 추이 분석** | 매출, BEP, 시급의 시계열 변화 추적 |
| **목표 추적** | 목표 매출/달성 기한 설정 및 진행률 시각화 |
| **AI 리포트** | LLM 기반 종합 분석 리포트 자동 생성 |
| **커뮤니티** | 크리에이터 간 프로젝트 공유 및 소통 게시판 |
| **관리자 대시보드** | 서비스 통계, 사용자 관리 (ROLE_ADMIN 전용) |

### 분석 지표

- **월 최소 건수 (BEP)** — 고정비를 회수하기 위해 매월 최소 필요한 판매 건수
- **실질 시급** — (매출 - 총비용) / 투입시간. 본업 시급과 비교 가능
- **순수익률** — (판매가 - 변동비) / 판매가. 건당 남는 비율
- **안전마진** — 현재 판매량이 BEP 대비 얼마나 여유 있는지

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.9 | 타입 안전성 |
| Vite | 7.3 | 빌드 도구 |
| styled-components | 6.3 | CSS-in-JS (theme 토큰 시스템) |
| Zustand | 5.0 | 전역 상태 관리 (인증) |
| React Hook Form | 7.71 | 폼 관리 및 유효성 검사 |
| Recharts | 3.7 | 차트 시각화 (BEP, 추이, 목표) |
| React Router | 7.13 | SPA 라우팅 |
| Axios | 1.13 | HTTP 클라이언트 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 21 | 메인 언어 |
| Spring Boot | 3.5 | 프레임워크 |
| Spring Security | 6.x | JWT 기반 인증/인가 |
| Spring Data JPA | 3.x | ORM |
| H2 / MySQL | — | 개발 / 운영 DB |
| Spring WebFlux | 6.x | LLM API 비동기 호출 |
| Lombok | — | 보일러플레이트 제거 |
| JUnit 5 + Mockito | — | 테스트 |

### Infrastructure
| 기술 | 용도 |
|------|------|
| AWS EC2 | 애플리케이션 서버 |
| GitHub Actions | CI/CD 파이프라인 |
| Nginx | 리버스 프록시 + 정적 파일 서빙 |

## 프로젝트 구조

```
profit-logic-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/               # Axios 인스턴스 + 엔드포인트별 API 모듈
│   ├── components/        # 공통 컴포넌트
│   │   ├── Layout.tsx         # 네비게이션 레이아웃
│   │   ├── ErrorBoundary.tsx  # 전역 에러 처리
│   │   ├── LoadingSpinner.tsx # 로딩 스피너
│   │   ├── BepChart.tsx       # BEP 차트
│   │   ├── TrendChart.tsx     # 월별 추이 차트
│   │   └── ...
│   ├── constants/         # 상수 (필드 정의, 카테고리)
│   ├── hooks/             # 커스텀 훅 (useAuth)
│   ├── pages/             # 라우트별 페이지 컴포넌트
│   │   ├── Landing.tsx        # 랜딩 (비로그인)
│   │   ├── Dashboard.tsx      # 대시보드 (로그인)
│   │   ├── ConsultPage.tsx    # 맞춤 상담
│   │   ├── ChatPage.tsx       # AI 채팅
│   │   └── ...
│   ├── store/             # Zustand 스토어
│   ├── styles/            # theme 토큰, 글로벌 스타일, 공유 컴포넌트
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 (formatNumber 등)
├── docs/                  # 프로젝트 문서
├── index.html
└── package.json
```

## 로컬 개발 환경

### 사전 요구사항
- Node.js 20+
- Java 21+

### Frontend
```bash
git clone https://github.com/wookidoki/profit-logic-frontend.git
cd profit-logic-frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
git clone https://github.com/wookidoki/profit-logic-backend.git
cd profit-logic-backend
./gradlew bootRun    # http://localhost:8080
```

### 시드 데이터 (자동 생성)
- 데모: `demo@profitlogic.com` / `demo1234`
- 관리자: `admin@profitlogic.com` / `admin1234`
- 30개 페르소나 계정 (웹소설/숏폼/이모티콘/블로그/인디개발 각 6명)

## 배포

### CI/CD 파이프라인
```
PR 생성 → GitHub Actions CI (lint, type-check, build/test)
   ↓ 머지
develop → GitHub Actions Deploy → SSH → EC2 배포 스크립트
```

### 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `JWT_SECRET` | JWT 서명 키 | Yes |
| `SPRING_DATASOURCE_URL` | MySQL URL | Yes (운영) |
| `OPENAI_API_KEY` | LLM API 키 (없으면 규칙 기반 폴백) | No |
| `EC2_HOST` / `EC2_USER` / `EC2_SSH_KEY` | 배포용 (GitHub Secrets) | Deploy |

## 개발자 정보

| 항목 | 내용 |
|------|------|
| 개발자 | wookidoki |
| 개발 기간 | 2026.02 |
| Frontend | [github.com/wookidoki/profit-logic-frontend](https://github.com/wookidoki/profit-logic-frontend) |
| Backend | [github.com/wookidoki/profit-logic-backend](https://github.com/wookidoki/profit-logic-backend) |

## 관련 문서

- [시스템 아키텍처](docs/ARCHITECTURE.md)
- [개발 히스토리](docs/DEVELOPMENT_HISTORY.md)
- [트러블슈팅 가이드](docs/TROUBLESHOOTING.md)
- [API 명세서](docs/API_SPEC.md)
- [변경 이력](docs/CHANGELOG.md)
