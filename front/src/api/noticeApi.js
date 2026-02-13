
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

    // [REAL-TIME] 개인/전체 푸시 알림 발송
    sendPushAlert: (data) => client.post('/daily/notices/push-alert', data),

    // [REAL-TIME] SSE 연결 URL 생성
    getSseUrl: (projectId, userId) => {
        let baseUrl = import.meta.env.VITE_API_URL || '';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        
        // baseUrl에 이미 /api가 포함되어 있는지 확인
        const apiPath = baseUrl.includes('/api') ? '' : '/api';
        const url = `${baseUrl}${apiPath}/daily/notices/sse/${projectId}/${userId}`;
        
        // 최종 URL 보정 (http가 없으면 현재 host 붙임)
        return url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
};

export default noticeApi;
