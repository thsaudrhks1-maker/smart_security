import api from './client';

export const getManagerDashboard = async () => {
    const response = await api.get('/api/manager/dashboard');
    return response.data;
};

export const getMyCompanies = async () => {
    const response = await api.get('/api/manager/companies');
    return response.data;
};

export const getMyWorkers = async () => {
    const response = await api.get('/api/manager/workers');
    return response.data;
};
