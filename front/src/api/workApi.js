
import client from './client';

export const workApi = {
    // [DAILY] 일일 작업 계획 목록 (날짜별)
    getPlans: async (params = {}) => {
        const response = await client.get('/daily/task_plans', { params });
        return response.data;
    },
    // [DAILY] 특정 구역에 작업 할당
    assignWork: async (data) => {
        const response = await client.post('/daily/task_plans', data);
        return response.data;
    }
};

export const { getPlans, assignWork } = workApi;
export default workApi;
