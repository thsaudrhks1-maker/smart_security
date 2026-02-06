
import client from './client';

export const noticeApi = {
    // [DAILY] 일일 공지사항 목록
    getNotices: () => client.get('/daily/notices'),
    
    // [DAILY] 신규 공지 작성
    createNotice: (data) => client.post('/daily/notices', data),
    
    // [DAILY] 일일 안전 정보 (TBM용)
    getSafetyInfo: (date) => client.get('/daily/notices/safety-info', { params: { d: date } }),
};

export default noticeApi;
