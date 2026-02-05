import apiClient from './client';

/**
 * 근로자 전용 API
 */
export const workerApi = {
  // 근로자 대시보드 정보 조회 (날씨, 프로젝트, 긴급알림, 무사고일수 등)
  getDashboard: async () => {
    const response = await apiClient.get('/worker/dashboard-info');
    return response.data;
  },

  // 전체 현장의 일일 위험 구역 조회
  getAllProjectRisks: async () => {
    const response = await apiClient.get('/worker/all-project-risks/today');
    return response.data;
  }
};
