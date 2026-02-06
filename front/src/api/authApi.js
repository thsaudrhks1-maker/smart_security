
import client from './client';

export const authApi = {
    // [SYS] 로그인 - 인자를 객체로 풀어서 전송
    login: async (username, password) => {
        const response = await client.post('/sys/users/login', { username, password });
        return response.data;
    },
    
    // [SYS] 현재 사용자 정보 조회
    getMe: async () => {
        const response = await client.get('/sys/users/me');
        return response.data;
    }
};

export default authApi;
