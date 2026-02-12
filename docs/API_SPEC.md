# API 명세서

## 기본 정보

- **Base URL**: `http://localhost:8080/v1`
- **인증**: JWT Bearer Token (`Authorization: Bearer {token}`)
- **응답 형식**: `application/json`
- **필드 네이밍**: `snake_case` (Jackson SNAKE_CASE 설정)
- **공통 응답 래퍼**:

```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

---

## 인증 (Auth)

### POST `/v1/auth/signup` — 회원가입
**Body**:
```json
{
  "email": "user@example.com",
  "password": "Password1!",
  "nickname": "닉네임"
}
```
**유효성 검사**: 이메일 형식, 비밀번호 8자 이상 (영문+숫자+특수문자), 닉네임 2~20자

### POST `/v1/auth/login` — 로그인
**Body**:
```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "email": "user@example.com",
    "nickname": "닉네임",
    "role": "ROLE_USER"
  }
}
```

---

## 프로젝트 (Project)

### GET `/v1/projects` — 내 프로젝트 목록
**Auth**: Required

### POST `/v1/projects` — 프로젝트 생성
**Auth**: Required
**Body**:
```json
{
  "title": "웹소설 연재",
  "price": 3000,
  "variable_cost": 500,
  "fixed_cost": 50000,
  "work_hours": 160,
  "hourly_wage": 9860,
  "target_revenue": 1000000,
  "target_month": "2026-06",
  "creator_category": "WEB_NOVEL"
}
```

### GET `/v1/projects/{id}` — 프로젝트 상세
**Auth**: Required (본인 소유만)

### PUT `/v1/projects/{id}` — 프로젝트 수정
**Auth**: Required (본인 소유만)

### DELETE `/v1/projects/{id}` — 프로젝트 삭제
**Auth**: Required (본인 소유만)

---

## 분석 (Analysis)

### GET `/v1/projects/{id}/analysis` — 프로젝트 수익성 분석
**Auth**: Required
**Response** 주요 필드:
```json
{
  "bep": 17,
  "contribution_margin_rate": 83.3,
  "shadow_wage": 12500,
  "safety_margin_rate": 47.1,
  "cost_breakdown": { ... },
  "action_cards": [ ... ]
}
```

### POST `/v1/projects/{id}/simulation` — 가격 시뮬레이션
**Auth**: Required
**Body**:
```json
{
  "new_price": 5000,
  "new_variable_cost": 800,
  "new_fixed_cost": 60000
}
```

---

## 비용 관리 (Cost Detail)

### GET `/v1/projects/{id}/costs` — 비용 항목 목록
### POST `/v1/projects/{id}/costs` — 비용 항목 추가
**Body**:
```json
{
  "name": "프로크리에이트 구독",
  "amount": 12000,
  "category": "TOOL_SUBSCRIPTION",
  "type": "FIXED",
  "memo": "월간 구독"
}
```
**category**: `API_USAGE`, `SERVER`, `TOOL_SUBSCRIPTION`, `MATERIAL`, `MARKETING`, `OUTSOURCING`, `OTHER`
**type**: `FIXED` (고정비), `VARIABLE` (변동비)

### DELETE `/v1/projects/{id}/costs/{costId}` — 비용 항목 삭제

---

## 시간 기록 (Time Log)

### GET `/v1/projects/{id}/timelogs` — 작업시간 목록
### POST `/v1/projects/{id}/timelogs` — 작업시간 추가
**Body**:
```json
{
  "work_date": "2026-02-10",
  "hours": 4.5,
  "description": "3화 원고 작업"
}
```

### DELETE `/v1/projects/{id}/timelogs/{logId}` — 작업시간 삭제

---

## AI 채팅 (Chat)

### POST `/v1/chat` — AI 채팅 메시지 전송
**Auth**: Required
**Body**:
```json
{
  "project_id": 1,
  "question": "이 프로젝트 계속할 가치가 있을까?"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "question": "이 프로젝트 계속할 가치가 있을까?",
    "answer": "현재 분석 결과를 보면...",
    "created_at": "2026-02-12T10:30:00"
  }
}
```

### GET `/v1/chat/history?projectId={id}` — 채팅 히스토리

---

## 리포트 (Report)

### POST `/v1/projects/{id}/reports` — AI 리포트 생성
### GET `/v1/projects/{id}/reports` — 리포트 목록
### GET `/v1/projects/{id}/reports/{reportId}` — 리포트 상세

---

## 대시보드 (Dashboard)

### GET `/v1/dashboard/summary` — 대시보드 요약
**Auth**: Required
**Response**:
```json
{
  "total_projects": 3,
  "total_estimated_revenue": 2500000,
  "avg_contribution_margin_rate": 72.5,
  "avg_shadow_wage": 11200,
  "warning_count": 1,
  "projects": [
    {
      "project_id": 1,
      "title": "웹소설 연재",
      "status": "STABLE",
      "bep": 17,
      "contribution_margin_rate": 83.3,
      "shadow_wage": 12500,
      "creator_category": "WEB_NOVEL",
      "top_action_card": { "type": "POSITIVE", "title": "수익 구조 안정적" }
    }
  ]
}
```

---

## 월별 추이 (Trend)

### GET `/v1/projects/{id}/trends` — 월별 추이 데이터
**Response**:
```json
{
  "snapshots": [
    {
      "month": "2026-01",
      "revenue": 150000,
      "bep": 17,
      "shadow_wage": 11200
    }
  ]
}
```

---

## 목표 추적 (Goal)

### GET `/v1/projects/{id}/goal` — 목표 진행률
### PUT `/v1/projects/{id}/goal` — 목표 업데이트

---

## 커뮤니티 (Community)

### GET `/v1/community/posts` — 게시글 목록
### POST `/v1/community/posts` — 게시글 작성
**Auth**: Required
### GET `/v1/community/posts/{id}` — 게시글 상세
### DELETE `/v1/community/posts/{id}` — 게시글 삭제
**Auth**: Required (작성자 본인)

### POST `/v1/community/posts/{id}/comments` — 댓글 작성
### DELETE `/v1/community/comments/{id}` — 댓글 삭제

---

## 맞춤 상담 (Script)

### GET `/v1/scripts/categories` — 크리에이터 카테고리 목록
### GET `/v1/scripts/templates/{category}` — 카테고리별 입력 템플릿
### POST `/v1/scripts/analyze` — 입력 데이터 분석
### POST `/v1/scripts/save` — 분석 결과로 프로젝트 생성

---

## AI 자동 입력 (AI Parse)

### POST `/v1/ai/parse` — 자연어 → 프로젝트 데이터 추출
**Auth**: Required
**Body**:
```json
{
  "text": "나는 웹소설 작가야. 카카오페이지에서 회당 300원 받고..."
}
```

---

## 관리자 (Admin)

### GET `/v1/admin/stats` — 서비스 통계
**Auth**: ROLE_ADMIN
**Response**:
```json
{
  "user_count": 32,
  "project_count": 45,
  "post_count": 28,
  "comment_count": 67,
  "report_count": 12,
  "chat_count": 156
}
```

### GET `/v1/admin/users` — 사용자 목록
**Auth**: ROLE_ADMIN

### DELETE `/v1/admin/users/{id}` — 사용자 삭제
**Auth**: ROLE_ADMIN

### DELETE `/v1/admin/posts/{id}` — 게시글 강제 삭제
**Auth**: ROLE_ADMIN

---

## 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 완료 |
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 필요 / 토큰 만료 |
| 403 | 권한 없음 (타인 리소스 접근, 관리자 전용) |
| 404 | 리소스 없음 |
| 409 | 이메일 중복 |
| 500 | 서버 내부 오류 |
