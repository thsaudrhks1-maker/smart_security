import apiClient from './client';

export const authApi = {
  // 로그인
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
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
