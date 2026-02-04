import apiClient from './client';

// 특정 프로젝트의 날짜별 출역 현황 조회 (매니저용)
export const getProjectAttendance = async (projectId, date) => {
  const params = date ? { date } : {};
  const response = await apiClient.get(`/api/attendance/project/${projectId}`, { params });
  return response.data;
};

// 나의 오늘 출근 기록 (근로자용 대시보드)
export const getMyTodayAttendance = async () => {
  const response = await apiClient.get('/api/attendance/today');
  return response.data;
};

// 나의 출근 내역 리스트 (근로자용 상세페이지 - WorkerAttendance.jsx에서 사용)
export const getMyAttendance = async (start, end) => {
  const response = await apiClient.get('/api/attendance/my', { params: { start, end } });
  return response.data;
};

// 출근하기
export const checkIn = async (data) => {
  const response = await apiClient.post('/api/attendance/check-in', data);
  return response.data;
};

// 퇴근하기
export const checkOut = async (attendanceId) => {
  const response = await apiClient.post('/api/attendance/check-out', { attendance_id: attendanceId });
  return response.data;
};

// 기존 객체 방식 호환을 위해 추가
export const attendanceApi = {
  getProjectAttendance,
  getMyTodayAttendance,
  getMyAttendance,
  checkIn,
  checkOut
};
