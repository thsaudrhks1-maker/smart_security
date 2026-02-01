import axios from 'axios';

// 백엔드 기본 URL 설정
const client = axios.create({
  // 환경변수(.env)에 설정된 주소를 그대로 사용합니다.
  // 로컬에서는 http://localhost:8010, 서버에서는 https://... 이 적용됩니다.
  // 현재 브라우저의 호스트(IP)를 감지하여 백엔드 주소 결정
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8500`,
  withCredentials: true, // 쿠키 기반 인증 활성화
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 주입)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 처리 공통화 가능)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default client;
