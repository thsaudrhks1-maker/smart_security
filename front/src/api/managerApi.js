import api from './client';

export const getManagerDashboard = async (projectId) => {
    const response = await api.get(`/manager/dashboard?project_id=${projectId}`);
    return response.data;
};

export const getMyCompanies = async (projectId) => {
    const response = await api.get(`/manager/companies?project_id=${projectId}`);
    return response.data;
};

export const getMyWorkers = async (projectId) => {
    const response = await api.get(`/manager/workers?project_id=${projectId}`);
    return response.data;
};

export const approveWorker = async (userId, projectId) => {
    const response = await api.post('/manager/workers/approval', {
        user_id: userId,
        project_id: projectId, // [추가]
        action: 'approve'
    });
    return response.data;
};

export const rejectWorker = async (userId, projectId) => {
    const response = await api.post('/manager/workers/approval', {
        user_id: userId,
        project_id: projectId, // [추가]
        action: 'reject'
    });
    return response.data;
};
