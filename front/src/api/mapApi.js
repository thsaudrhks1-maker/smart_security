import apiClient from './client';

export const mapApi = {
  // 위험 요소 목록 조회
  getRisks: async () => {
    const response = await apiClient.get('/map/risks');
    return response.data;
  },

  // 위험 요소 추가
  createRisk: async (riskData) => {
    // riskData: { name, type, lat, lng, radius }
    const response = await apiClient.post('/map/risks', riskData);
    return response.data;
  },

  // 위험 요소 삭제
  deleteRisk: async (id) => {
    await apiClient.delete(`/map/risks/${id}`);
  },

  // 도면 업로드
  uploadBlueprint: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post('/map/blueprint', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};
