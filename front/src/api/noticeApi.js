import apiClient from './client';

export const noticeApi = {
  // 프로젝트별 공지사항 조회
  getProjectNotices: async (projectId, limit = 20) => {
    const response = await apiClient.get(`/notices/project/${projectId}`, { params: { limit } });
    return response.data;
  },

  // 상세 조회
  getNotice: async (noticeId) => {
    const response = await apiClient.get(`/notices/${noticeId}`);
    return response.data;
  },

  // 공지 등록
  createNotice: async (data) => {
    const response = await apiClient.post('/notices', data);
    return response.data;
  },

  // 공지 수정
  updateNotice: async (noticeId, data) => {
    const response = await apiClient.patch(`/notices/${noticeId}`, data);
    return response.data;
  },

  // 공지 삭제
  deleteNotice: async (noticeId) => {
    const response = await apiClient.delete(`/notices/${noticeId}`);
    return response.data;
  }
};
