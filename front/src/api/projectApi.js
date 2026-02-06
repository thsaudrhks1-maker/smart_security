
import client from './client';

export const projectApi = {
    getProjects: () => client.get('/project/master'),
    getProject: (id) => client.get(`/project/master/${id}`),
    createProject: (data) => client.post('/project/master', data),
    getMembers: (id) => client.get(`/project/master/${id}/members`),
};

// 개별 익스포트 지원 (AdminDashboard 등에서 사용)
export const getProjects = projectApi.getProjects;
export const getProject = projectApi.getProject;
