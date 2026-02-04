import api from './client';

/**
 * 나의 오늘 출근 기록 조회
 */
export const getMyTodayAttendance = async () => {
    const response = await api.get('/api/attendance/today');
    return response.data;
};

/**
 * 출근 하기
 * @param {Object} data { project_id, work_type_id(옵션), check_in_method }
 */
export const checkIn = async (data) => {
    const response = await api.post('/api/attendance/check-in', data);
    return response.data;
};

/**
 * 퇴근 하기
 * @param {number} attendanceId 
 */
export const checkOut = async (attendanceId) => {
    const response = await api.post('/api/attendance/check-out', { attendance_id: attendanceId });
    return response.data;
};

/**
 * 프로젝트별 출역 현황 조회 (관리자용)
 * @param {number} projectId 
 * @param {string} date YYYY-MM-DD (옵션)
 */
export const getProjectAttendance = async (projectId, date = null) => {
    const url = date ? `/api/attendance/project/${projectId}?date=${date}` : `/api/attendance/project/${projectId}`;
    const response = await api.get(url);
    return response.data;
};
