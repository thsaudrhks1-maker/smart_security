import api from './client';

/**
 * 프로젝트 API
 * - 관리자용 프로젝트 생성/조회/수정/삭제
 */

// 프로젝트 생성
export const createProject = async (projectData) => {
  const response = await api.post('/api/projects', projectData);
  return response.data;
};

// 전체 프로젝트 목록 조회
export const getAllProjects = async () => {
  const response = await api.get('/api/projects');
  return response.data;
};

// 진행 중인 프로젝트만 조회
export const getActiveProjects = async () => {
  const response = await api.get('/api/projects/active');
  return response.data;
};

// 특정 프로젝트 상세 조회
export const getProjectById = async (projectId) => {
  const response = await api.get(`/api/projects/${projectId}`);
  return response.data;
};

// 프로젝트 정보 수정
export const updateProject = async (projectId, updateData) => {
  const response = await api.put(`/api/projects/${projectId}`, updateData);
  return response.data;
};

// 프로젝트 삭제
export const deleteProject = async (projectId) => {
  await api.delete(`/api/projects/${projectId}`);
};

/**
 * [신규] 협력사(참여자) 관리 API
 */

// 협력사 목록 조회
export const getProjectParticipants = async (projectId) => {
  const response = await api.get(`/api/projects/${projectId}/participants`);
  return response.data;
};

// 협력사 추가
export const addProjectParticipant = async (projectId, companyName, role = 'PARTNER') => {
  const response = await api.post(`/api/projects/${projectId}/participants`, null, {
    params: { company_name: companyName, role }
  });
  return response.data;
};
