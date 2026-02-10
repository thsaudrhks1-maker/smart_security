# 프론트엔드 & 백엔드 연동 아키텍처 가이드
## (Architecture: Frontend & Backend Integration)

이 문서는 프론트엔드(Vite/React)와 백엔드(FastAPI)가 어떻게 통신하며, 각 설정 파일이 어떤 역할을 하는지 명확히 정의합니다.

---

## 1. 핵심 요약 (Core Concept)

가장 중요한 점은 **"화면 이동(Front Routing)"과 "데이터 요청(API Request)"은 완전히 별개의 경로**라는 것입니다.

| 구분 | 담당자 | 역할 | 설정 파일 |
| :--- | :--- | :--- | :--- |
| **화면 이동** | **Vite (React Router)** | 사용자가 페이지를 이동함 (예: `/dashboard` → `/login`) | `vite.config.js`, `App.jsx` |
| **데이터 요청** | **Client.js (Axios)** | 프론트가 백엔드에 데이터를 달라고 함 (예: 로그인 버튼 클릭) | `src/api/client.js` |

> **💡 결론:** `client.js`는 `vite.config.js`를 거치지 않고 독자적으로 백엔드를 찾아갑니다. (서로 남남입니다)

---

## 2. 상세 동작 원리 (Detailed Flow)

### A. 데이터 요청 (API Request) - `client.js`
사용자가 로그인 버튼을 눌렀을 때의 흐름입니다.

1.  **사용자**가 "로그인" 버튼 클릭
2.  **`src/api/authApi.js`** 실행
3.  **`src/api/client.js`** 호출
4.  **`client.js`**가 `baseURL` 설정 확인:
    *   **설정값:** `http://localhost:8500/api` (로컬) 또는 `/api` (서버)
    *   **중요:** 여기서 주소가 `http://...8500`과 같이 **절대 경로**로 적혀있으면, Vite 서버(`3500`)를 거치지 않고 **다이렉트로 백엔드(`8500`)에 꽂습니다.**
5.  **백엔드(`8500`)** 도착 & 응답

### B. 화면 서비스 & 개발 프록시 - `vite.config.js`
브라우저 주소창에 URL을 입력했을 때의 흐름입니다.

1.  **사용자**가 `http://localhost:3500/dashboard` 접속
2.  **Vite 개발 서버(`3500`)**가 받음
3.  `index.html`과 React 번들(`App.jsx`)을 브라우저에 줌
4.  **끝.** (백엔드 안 감)

#### ❓ 그럼 `vite.config.js`의 `proxy` 설정은 언제 쓰이나요?
*   만약 `client.js`가 실수로 주소를 `/api/login` (상대 경로)처럼 적어서 보냈다면?
*   브라우저는 멍청하게 `http://localhost:3500/api/login`으로 요청을 보냅니다. (프론트에는 그런 파일 없음 → 404 에러)
*   이때 **Vite의 Proxy 설정**이 등장합니다:
    *   "어? `/api`로 시작하네? 이건 내 거 아냐. **백엔드(`8500`)로 토스!**"
*   즉, **실수 방지용 보험(Safety Net)** 역할입니다.

---

## 3. 파일별 역할 정의

### 1. `src/api/client.js` (실세)
*   **역할:** 백엔드와 통신하는 **진짜 전화기**.
*   **특징:**
    *   `VITE_API_URL` 환경변수를 최우선으로 봄.
    *   없으면 로컬(`localhost:8500/api`)이나 서버(`/api`) 주소로 **직접 연결**.
    *   Vite 설정과 무관하게 독자적으로 움직임.

### 2. `vite.config.js` (서포터)
*   **역할:** 개발 환경(`npm run dev`)을 띄워주는 **가상 서버**.
*   **특징:**
    *   `port: 3500` 설정: 프론트엔드 서버 포트 결정.
    *   `proxy`: 개발 중 API 요청 경로가 꼬였을 때 백엔드로 연결해주는 **다리(Bridge)** 역할.
    *   **주의:** 배포(Build) 후 서버(Nginx)에 올라가면 **이 파일은 아무런 효력이 없음.** (사라짐)

---

## 4. 환경별 차이 (Environment)

### 🌍 로컬 개발 (Local Development)
*   **Vite 서버(`3500`)**가 떠있음.
*   `client.js`는 `8500`으로 **직통 연결** (Proxy 안 탐).
*   혹시라도 경로 실수하면 `vite.config.js`의 Proxy가 `8500`으로 잡아줌.

### 🚀 서버 배포 (Production)
*   **Vite 서버 없음.** (빌드된 `dist` 파일만 존재)
*   **Nginx** 웹서버가 `3500`번(또는 `80`) 역할을 대신함.
*   `client.js`는 `/api`로 요청을 보냄 → **Nginx**가 받아서 백엔드(`8500`)로 **토스(Reverse Proxy)**.
*   따라서 `vite.config.js`의 Proxy 설정은 **배포 환경에선 무의미함.** (Nginx 설정(`nginx.conf`)이 그 역할을 대신함)
