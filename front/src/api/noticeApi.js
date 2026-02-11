
import client from './client';

export const noticeApi = {
    // [DAILY] 일일 공지사항 목록
    getNotices: (projectId, date) => client.get('/daily/notices', { params: { project_id: projectId, date: date } }),
    
    // [DAILY] 신규 공지 작성
    createNotice: (data) => client.post('/daily/notices', data),
    
    // [DAILY] 최신 긴급 알람 조회
    getLatestEmergency: (projectId) => client.get(`/daily/notices/latest-emergency/${projectId}`),

    // [DAILY] 일일 안전 정보 (TBM용)
    getSafetyInfo: (date) => client.get('/daily/notices/safety-info', { params: { d: date } }),

    // [DAILY] 공지 확인 처리
    markAsRead: (noticeId, userId) => client.post(`/daily/notices/${noticeId}/read`, null, { params: { user_id: userId } }),

    // [DAILY] 공지 확인 인원 조회
    getReadStatus: (noticeId) => client.get(`/daily/notices/${noticeId}/read-status`),
};

export default noticeApi;
