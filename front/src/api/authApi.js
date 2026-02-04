import apiClient from './client';

const LOGIN_TIMEOUT_MS = 10 * 1000; // 10초 안에 응답 없으면 실패 처리

export const authApi = {
  // 로그인 (타임아웃: 백엔드/DB 미응답 시 버튼이 계속 '로그인 중...'으로 멈추는 것 방지)
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password }, { timeout: LOGIN_TIMEOUT_MS });
    return response.data;
  },

  // 회원가입
  register: async (userData) => {
    // userData: { username, password, full_name, role }
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // (선택) 로그아웃, 토큰 갱신 등 추가 가능
};
