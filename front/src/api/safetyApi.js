import apiClient from './client';

export const safetyApi = {
    /** 구역 목록 (site_id 있으면 해당 현장만) */
    getZones: async (siteId = null, projectId = null) => {
        const params = {};
        if (siteId != null) params.site_id = siteId;
        if (projectId != null) params.project_id = projectId;
        const response = await apiClient.get('/safety/zones', { params });
        return response.data;
    },
    /** 구역 생성 (도면 위에서 정의한 Zone DB 저장) */
    createZone: async (data) => {
        const response = await apiClient.post('/safety/zones', data);
        return response.data;
    },
    /** 구역 수정 (작업 위치 탭에서 좌표·층·구역명·타입·특징 등) */
    updateZone: async (zoneId, data) => {
        const response = await apiClient.put(`/safety/zones/${zoneId}`, data);
        return response.data;
    },
    getLogs: async () => {
        const response = await apiClient.get('/safety/logs');
        return response.data;
    },
    /** 일일 변동 위험 구역 목록 (그날 해당 구역의 위험 - 작업자에게 데일리 전달) */
    getDailyDangerZones: async (date, zoneId = null) => {
        const params = { date };
        if (zoneId != null) params.zone_id = zoneId;
        const response = await apiClient.get('/safety/daily-danger-zones', { params });
        return response.data;
    },
    /** 일일 변동 위험 구역 등록 */
    createDailyDangerZone: async (data) => {
        const response = await apiClient.post('/safety/daily-danger-zones', data);
        return response.data;
    },
    /** 일일 변동 위험 구역 삭제 */
    deleteDailyDangerZone: async (id) => {
        await apiClient.delete(`/safety/daily-danger-zones/${id}`);
    },
    /** 사이트 그리드 대량 생성 */
    generateSiteGrid: async (siteId) => {
        const response = await apiClient.post(`/safety/sites/${siteId}/generate-grid`);
        return response.data;
    },
};
