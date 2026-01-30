import apiClient from './client';

// 아직 구체적인 기능이 프론트에 구현되지 않았을 수 있지만, 미리 구조 잡아둠
export const safetyApi = {
    // 안전 구역 목록
    getZones: async () => {
        const response = await apiClient.get('/safety/zones');
        return response.data;
    },
    
    // (추후 확장) 안전 로그 조회 등
    getLogs: async () => {
         const response = await apiClient.get('/safety/logs');
         return response.data;
    }
}
