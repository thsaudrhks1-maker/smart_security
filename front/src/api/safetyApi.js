
import client from './client';

export const safetyApi = {
    // [DAILY] 프로젝트별 위험 지역 조회
    getHazards: (projectId, date) => 
        client.get('/daily/safety_logs', { params: { project_id: projectId, date: date } }),

    // [DAILY] 위험 신고 및 사진 업로드 (Multipart/FormData)
    reportDanger: (formData) => 
        client.post('/daily/safety_logs/report', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // [DAILY] 타임라인별 안전 상태 요약 조회 (관리자용 등)
    getSafetyTimeline: (projectId, date) => 
        client.get('/daily/safety_logs/timeline', { params: { project_id: projectId, date: date } }),

    // [DAILY] 안전 점검 로그 생성
    createSafetyLog: (data) => 
        client.post('/daily/safety_logs/logs', data),

    // [CONTENT] 위험 요소 템플릿 목록 조회
    getDangerTemplates: () => 
        client.get('/content/danger_info'),

    // [DAILY] 위험 신고 승인
    approveHazard: (dangerId) => 
        client.put(`/daily/safety_logs/approve/${dangerId}`),

    // [DAILY] 위험 구역 삭제
    deleteHazard: (dangerId) =>
        client.delete(`/daily/safety_logs/danger/${dangerId}`),
};

export default safetyApi;
