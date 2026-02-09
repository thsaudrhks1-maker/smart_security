
import client from './client';

export const noticeApi = {
    // [DAILY] 일일 공지사항 목록
    getNotices: (projectId) => client.get('/daily/notices', { params: { project_id: projectId } }),
    
    // [DAILY] 신규 공지 작성
    // data: { project_id, title, content, notice_type, notice_role, created_by }
    createNotice: (data) => client.post('/daily/notices', data),
    
    // [DAILY] 최신 긴급 알람 조회
    getLatestEmergency: (projectId) => client.get(`/daily/notices/latest-emergency/${projectId}`),

    // [DAILY] 일일 안전 정보 (TBM용)
    getSafetyInfo: (date) => client.get('/daily/notices/safety-info', { params: { d: date } }),
};

export default noticeApi;
