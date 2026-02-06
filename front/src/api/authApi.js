
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
    },

    // [ADMIN] 관리자 대시보드 기초 정보 (프로젝트 정보 포함)
    getManagerDashboard: async () => {
        const response = await client.get('/sys/users/me'); // 프로필 정보를 통해 프로젝트 ID 획득
        const userData = response.data;
        return {
            project_info: {
                id: userData.project_id || 1, // 프로젝트 ID가 없을 경우 대비
                name: userData.project_name
            }
        };
    }
};

export const { login, getMe, getManagerDashboard } = authApi;
export default authApi;
