
import client from './client';

export const projectApi = {
    // [PROJECT] 전체 프로젝트 목록
    getProjects: () => client.get('/project/master'),
    // [PROJECT] 특정 프로젝트 상세
    getProject: (id) => client.get(`/project/master/${id}`),
    // [PROJECT] 프로젝트 상세 정보 (업체, 관리자, 협력업체, 작업자 포함)
    getProjectDetail: (id) => client.get(`/project/master/${id}/detail`),
    // [PROJECT] 작업자 승인
    approveWorker: (projectId, userId) => client.post(`/project/master/${projectId}/approve-worker/${userId}`),
    // [PROJECT] 새 프로젝트 등록
    createProject: (data) => client.post('/project/master', data),
    // [PROJECT] 프로젝트 삭제
    deleteProject: (id) => client.delete(`/project/master/${id}`),
    // [PROJECT] 프로젝트 멤버(참여 인력) 조회
    getMembers: (id) => client.get(`/project/master/${id}/members`),
    // [PROJECT] 구역별 작업/위험요소 상세 조회
    getZonesWithDetails: (projectId, date) => client.get(`/project/locations/${projectId}/zones/details`, {
        params: { date }
    }),
};

export const { getProjects, getProject, createProject, deleteProject, getMembers } = projectApi;
export default projectApi;
