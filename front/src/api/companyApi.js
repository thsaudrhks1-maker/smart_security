// api/companyApi.js
import apiClient from './client';

// 협력사 목록 조회
export const getAllCompanies = async () => {
  const response = await apiClient.get('/company'); 
  return response.data;
};

// 협력사 등록
export const createCompany = async (data) => {
  const response = await apiClient.post('/company', data);
  return response.data;
};

// 회사 소속 직원 조회 (역할 필터링)
export const getCompanyUsers = async (companyId, role) => {
  const params = role ? { role } : {};
  const response = await apiClient.get(`/company/${companyId}/users`, { params });
  return response.data;
};
