import api from './client';

/**
 * 프로젝트 API
 * - 관리자용 프로젝트 생성/조회/수정/삭제
 */

// 프로젝트 생성
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

// 전체 프로젝트 목록 조회
export const getAllProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

// 진행 중인 프로젝트만 조회
export const getActiveProjects = async () => {
  const response = await api.get('/projects/active');
  return response.data;
};

// 특정 프로젝트 상세 조회
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// 프로젝트 정보 수정
export const updateProject = async (projectId, updateData) => {
  const response = await api.put(`/projects/${projectId}`, updateData);
  return response.data;
};

// 프로젝트 삭제
export const deleteProject = async (projectId) => {
  await api.delete(`/projects/${projectId}`);
};

/**
 * [신규] 협력사(참여자) 관리 API
 */

// 협력사 목록 조회
export const getProjectParticipants = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/participants`);
  return response.data;
};

// 협력사 추가
export const addProjectParticipant = async (projectId, companyName, role = 'PARTNER') => {
  const response = await api.post(`/projects/${projectId}/participants`, null, {
    params: { company_name: companyName, role }
  });
  return response.data;
};

// 프로젝트 참여 작업자 조회
export const getProjectWorkers = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/workers`);
  return response.data;
};

// [신규] 멤버(작업자) 상태 조회 및 승인 관리
export const getProjectMembers = async (projectId, status) => {
  const params = status ? { status } : {};
  const response = await api.get(`/projects/${projectId}/members`, { params });
  return response.data;
};

export const approveProjectMembers = async (projectId, userIds, action = 'APPROVE') => {
  const response = await api.patch(`/projects/${projectId}/members/approval`, {
    user_ids: userIds,
    action
  });
  return response.data;
};

/** 프로젝트 현장(Site) 및 도면 */
export const getProjectSites = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/sites`);
  return response.data;
};

export const createProjectSite = async (projectId, { name, address }) => {
  const response = await api.post(`/projects/${projectId}/sites`, { name, address: address || '' });
  return response.data;
};

export const uploadSiteFloorPlan = async (projectId, siteId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/projects/${projectId}/sites/${siteId}/floor-plan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

