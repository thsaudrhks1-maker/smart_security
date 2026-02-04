import apiClient from './client';

export const safetyApi = {
    /** 구역 목록 (site_id 있으면 해당 현장만) */
    getZones: async (siteId = null) => {
        const params = siteId != null ? { site_id: siteId } : {};
        const response = await apiClient.get('/safety/zones', { params });
        return response.data;
    },
    /** 구역 생성 (도면 위에서 정의한 Zone DB 저장) */
    createZone: async (data) => {
        const response = await apiClient.post('/safety/zones', data);
        return response.data;
    },
    getLogs: async () => {
        const response = await apiClient.get('/safety/logs');
        return response.data;
    },
};
