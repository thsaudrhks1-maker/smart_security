
import client from './client';

export const userApi = {
    getUsers: () => client.get('/sys/users'),
    getUsersByCompany: (companyId) => client.get(`/sys/users/company/${companyId}`),
};
