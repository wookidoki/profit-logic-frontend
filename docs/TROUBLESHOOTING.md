# 트러블슈팅 가이드

## 개발 환경

### 1. `npm run dev` 실행 시 포트 충돌

**증상**: `EADDRINUSE: address already in use :::5173`

**해결**:
```bash
# 점유 프로세스 확인 후 종료
npx kill-port 5173

# 또는 다른 포트 사용
npm run dev -- --port 3000
```

### 2. TypeScript 컴파일 에러: 'theme' 관련

**증상**: `Property 'colors' does not exist on type...`

**원인**: theme import 누락

**해결**: 해당 파일에 theme import 추가
```typescript
import { theme } from '../styles/theme';
```

### 3. ESLint `react-hooks/exhaustive-deps` 경고

**증상**: ConsultPage, ScriptAnalysis에서 useCallback 의존성 경고

**원인**: 의도적 의존성 생략 (무한 렌더링 방지)

**현황**: 기능에 영향 없는 기존 경고 3건. 향후 useRef 패턴으로 리팩토링 예정.

---

## 백엔드

### 4. `./gradlew bootRun` 시 포트 충돌

**증상**: `Web server failed to start. Port 8080 was already in use.`

**해결**:
```bash
# application.yml에서 포트 변경
server:
  port: 8081

# 또는 프론트 vite.config.ts proxy 수정
```

### 5. LLM API 호출 실패

**증상**: AI 채팅/리포트에서 "잠시 후 다시 시도해주세요" 응답

**원인**: OPENAI_API_KEY 미설정 또는 API 할당량 초과

**해결**:
- API 키 없이도 규칙기반 폴백으로 핵심 분석 응답 제공 (BEP, 시급, 비용 등)
- LLM이 필요한 기능: AI 리포트 생성, 자연어 파싱, 맞춤 상담 분석
- 환경변수 설정: `OPENAI_API_KEY=your-key`

### 6. H2 콘솔 접속 안 됨

**증상**: `http://localhost:8080/h2-console` 접속 불가

**해결**: SecurityConfig에서 H2 콘솔 경로 허용 확인
```yaml
# application-local.yml
spring:
  h2:
    console:
      enabled: true
      path: /h2-console
```

### 7. Jackson SNAKE_CASE 직렬화 문제

**증상**: 프론트에서 `camelCase` 필드가 null로 수신

**원인**: 백엔드가 `snake_case`로 직렬화 (`PropertyNamingStrategies.SNAKE_CASE`)

**해결**: 프론트 타입 정의에서 `snake_case` 사용
```typescript
// 올바른 예
interface Project {
  variable_cost: number;  // ✅
  // variableCost: number; // ❌
}
```

---

## 인증 관련

### 8. 로그인 후 즉시 로그아웃됨

**증상**: 로그인 성공 후 페이지 이동 시 로그인 페이지로 리다이렉트

**원인**: axios 401 인터셉터가 authStore.logout() 호출

**확인사항**:
1. JWT 토큰이 localStorage에 저장되었는지 확인
2. axios 인스턴스의 Authorization 헤더 설정 확인
3. 백엔드 JWT_SECRET 불일치 여부 확인

### 9. 관리자 페이지 접근 불가

**증상**: `/admin` 접속 시 홈으로 리다이렉트

**원인**: role이 `ROLE_ADMIN`이 아닌 경우 AdminRoute에서 차단

**해결**: `admin@profitlogic.com` / `admin1234`로 로그인

---

## 배포 관련

### 10. GitHub Actions CI 실패: lint 에러

**증상**: `ESLint found too many warnings (maximum: 0)`

**원인**: 프론트 CI에서 `npm run lint`가 `--max-warnings 0`이 아닌 기본 설정 사용

**해결**: 기존 3건의 exhaustive-deps 경고는 CI 기본 설정에서 통과됨.
로컬에서 `--max-warnings 0` 실행 시만 실패.

### 11. EC2 배포 후 API 502 에러

**증상**: 프론트 정상, API 호출 시 502 Bad Gateway

**원인**: 백엔드 JAR이 아직 기동 중이거나 크래시

**확인**:
```bash
# EC2에서
sudo systemctl status profit-logic
sudo journalctl -u profit-logic -f

# 포트 확인
sudo ss -tlnp | grep 8080
```

### 12. CORS 에러

**증상**: `Access-Control-Allow-Origin` 관련 브라우저 에러

**원인**: CorsConfig에 프론트 도메인 미등록

**해결**: `CorsConfig.java`에서 허용 origin 추가
```java
.allowedOrigins("http://localhost:5173", "https://your-domain.com")
```

---

## 데이터 관련

### 13. 분석 결과가 0으로 표시

**증상**: BEP, 시급 등이 모두 0

**원인**: 프로젝트에 비용/시간 데이터 미입력

**해결**: 프로젝트 생성 시 건당 수익, 건당 비용, 고정비, 투입시간 모두 입력 필요

### 14. 시드 데이터가 생성되지 않음

**증상**: 데모 계정으로 로그인 불가

**원인**: `DataInitializer`는 `spring.profiles.active=local` 에서만 동작

**해결**:
```bash
# 환경변수 설정
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

---

## 알려진 이슈

| # | 이슈 | 상태 | 영향도 |
|---|------|------|--------|
| 1 | ConsultPage useCallback 의존성 경고 3건 | 미수정 | 없음 (기능 정상) |
| 2 | 모바일에서 차트 영역 가로 스크롤 | 미수정 | 낮음 |
| 3 | 대시보드 빈 상태에서 빈 SummaryGrid 렌더링 | 미수정 | 없음 (빈 상태 UI 노출) |
