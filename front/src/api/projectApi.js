
import client from './client';

export const projectApi = {
    // [PROJECT] 전체 프로젝트 목록
    getProjects: () => client.get('/project/master'),
    // [PROJECT] 특정 프로젝트 상세
    getProject: (id) => client.get(`/project/master/${id}`),
    // [PROJECT] 새 프로젝트 등록
    createProject: (data) => client.post('/project/master', data),
    // [PROJECT] 프로젝트 멤버(참여 인력) 조회
    getMembers: (id) => client.get(`/project/master/${id}/members`),
};

export const { getProjects, getProject, createProject, getMembers } = projectApi;
export default projectApi;
