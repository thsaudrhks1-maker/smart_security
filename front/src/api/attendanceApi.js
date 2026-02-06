
import client from './client';

export const attendanceApi = {
    // [DAILY] 특정 프로젝트 일일 출역 현황
    getAttendance: (projectId, date) => 
        client.get('/daily/attendance', { params: { project_id: projectId, d: date } }),
    
    // [DAILY] 출근 처리
    checkIn: (data) => client.post('/daily/attendance/check-in', data),

    // [DAILY] 나의 출역 현황 조회
    getMyAttendance: (userId) => client.get('/daily/attendance/me', { params: { user_id: userId } }),

};

export const { getAttendance, checkIn, getMyAttendance } = attendanceApi;
export default attendanceApi;
