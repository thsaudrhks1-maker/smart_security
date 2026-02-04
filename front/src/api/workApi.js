import apiClient from './client';

export const workApi = {
  // 작업 목록 조회 (필터 가능)
  getPlans: async (params = {}) => {
    const response = await apiClient.get('/work/plans', { params });
    return response.data;
  },

  // 작업 등록
  createPlan: async (planData) => {
    const response = await apiClient.post('/work/plans', planData);
    return response.data;
  },

  // 작업 삭제 (ID)
  deletePlan: async (id) => {
    await apiClient.delete(`/work/plans/${id}`);
  },

  // 템플릿 목록 조회
  getTemplates: async () => {
    const response = await apiClient.get('/work/templates');
    return response.data;
  },

  // 공정(템플릿) + 장구류·안전수칙 (콘텐츠 관리/열람용)
  getTemplatesContents: async () => {
    const response = await apiClient.get('/work/templates/contents');
    return response.data;
  },

  // 전체 안전공구(장구류) 마스터 목록
  getSafetyResources: async () => {
    const response = await apiClient.get('/work/safety-resources');
    return response.data;
  },

  // 작업 단건 조회 (수정용)
  getPlan: async (planId) => {
    const response = await apiClient.get(`/work/plans/${planId}`);
    return response.data;
  },

  // 작업 수정
  updatePlan: async (planId, body) => {
    const response = await apiClient.patch(`/work/plans/${planId}`, body);
    return response.data;
  },

  // 작업자 배정 현황 (옵션)
  getAllocations: async (planId) => {
    const response = await apiClient.get(`/work/plans/${planId}/allocations`);
    return response.data;
  },

  // 내 작업 조회
  getMyTodayWork: async (date) => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/work/my-plans', { params });
    return response.data;
  }
};
