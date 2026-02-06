
import client from './client';

export const workApi = {
    // [CONTENT] 표준 공종 매뉴얼 목록
    getManuals: () => client.get('/content/manuals'),
    
    // [DAILY] 오늘의 작업 계획 목록
    getTodayTasks: (siteId) => client.get('/daily/tasks', { params: { site_id: siteId } }),
    
    // [DAILY] 작업자용 오늘의 할 일 (대시보드)
    getWorkerDashboard: (userId) => client.get('/daily/tasks/dashboard', { params: { user_id: userId } }),
};

export default workApi;
