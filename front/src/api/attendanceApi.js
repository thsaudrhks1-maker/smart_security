
import client from './client';

export const attendanceApi = {
    // [DAILY] 특정 프로젝트 일일 출역 현황
    getAttendance: (projectId, date) => 
        client.get('/daily/attendance', { params: { project_id: projectId, d: date } }),
    
    // [DAILY] 출근 처리
    checkIn: (data) => client.post('/daily/attendance/check-in', data),

    // [DAILY] 나의 출역 현황 조회
    getMyAttendance: (userId) => client.get('/daily/attendance/me', { params: { user_id: userId } }),

    // [MANAGER] 프로젝트 투입 인원 출퇴근 및 안전점검 현황
    getProjectStatus: (projectId, date) => 
        client.get('/daily/attendance/project-status', { params: { project_id: projectId, d: date } }),
};

export const { getAttendance, checkIn, getMyAttendance, getProjectStatus } = attendanceApi;
export default attendanceApi;
