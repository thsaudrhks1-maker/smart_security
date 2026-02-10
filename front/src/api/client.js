import axios from 'axios';

// 백엔드 기본 URL 설정
const client = axios.create({
  // 현재 접속한 주소의 호스트를 기반으로 API 주소 동적 결정
  // 예: http://168.107.52.201:3500 에서 접속 시 -> http://168.107.52.201:8500/api 로 요청
  baseURL: `${window.location.protocol}//${window.location.hostname}:8500/api`,
  timeout: 5000, // 5초 타임아웃 설정 (무한 로딩 방지)
  // withCredentials: true, // 토큰 인증 사용 시 불필요할 수 있음 (CORS 복잡성 감소)
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
