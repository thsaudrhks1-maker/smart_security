
import client from './client';

export const safetyApi = {
    // [SAFETY] 전체 현장 구역(Zone) 목록 조회
    getZones: async () => {
        const response = await client.get('/safety/zones');
        return response.data;
    },
    // [SAFETY] 일일 위험 구역 목록 (사용자/매니저 대시보드용)
    getDailyDangerZones: async (date) => {
        const response = await client.get('/safety/daily-danger-zones', { params: { date } });
        return response.data;
    },
    // [SAFETY] 위험 요소 신고 및 생성
    createDailyDangerZone: async (data) => {
        const response = await client.post('/safety/daily-danger-zones', data);
        return response.data;
    },
    // [SAFETY] 도면 기반 구역 데이터 동기화
    syncZonesByBlueprint: async (projectId) => {
        const response = await client.get(`/project/locations/${projectId}/sites`);
        return response.data;
    }
};

export const { getZones, getDailyDangerZones, createDailyDangerZone, syncZonesByBlueprint } = safetyApi;
export default safetyApi;
