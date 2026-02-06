
import client from './client';

export const workApi = {
    // [DAILY] 일일 작업 계획 목록 (날짜별)
    getPlans: async (params = {}) => {
        const response = await client.get('/daily/task_plans', { params });
        return response.data;
    },
    
    // [DAILY] 특정 구역의 작업 계획 및 위험 구역 조회
    getZoneDetail: async (zoneId, date) => {
        const response = await client.get(`/daily/task_plans/zone/${zoneId}`, { 
            params: { d: date } 
        });
        return response.data;
    },
    
    // [DAILY] 작업 계획 생성
    createTask: async (data) => {
        const response = await client.post('/daily/task_plans', data);
        return response.data;
    },
    
    // [DAILY] 작업 계획 수정
    updateTask: async (taskId, data) => {
        const response = await client.put(`/daily/task_plans/${taskId}`, data);
        return response.data;
    },
    
    // [DAILY] 작업 계획 삭제
    deleteTask: async (taskId) => {
        const response = await client.delete(`/daily/task_plans/${taskId}`);
        return response.data;
    },
    
    // [DAILY] 작업자 배정
    assignWorker: async (taskId, workerId) => {
        const response = await client.post(`/daily/task_plans/${taskId}/workers`, {
            worker_id: workerId
        });
        return response.data;
    },
    
    // [DAILY] 작업자 제거
    removeWorker: async (taskId, workerId) => {
        const response = await client.delete(`/daily/task_plans/${taskId}/workers/${workerId}`);
        return response.data;
    },
    
    // [DAILY] 위험 구역 생성
    createDanger: async (data) => {
        const response = await client.post('/daily/task_plans/dangers', data);
        return response.data;
    },
    
    // [DAILY] 위험 구역 삭제
    deleteDanger: async (dangerId) => {
        const response = await client.delete(`/daily/task_plans/dangers/${dangerId}`);
        return response.data;
    }
};

export default workApi;
