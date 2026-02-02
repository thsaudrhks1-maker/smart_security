// api/companyApi.js
import apiClient from './client';

// 협력사 목록 조회
export const getAllCompanies = async () => {
  const response = await apiClient.get('/company'); // /api 접두어는 apiClient 설정에 따라 다름. 보통 baseURL에 포함됨.
  // backend router path is /company, so full path is /api/company if baseURL ends with /api
  // router 정의를 보면 @router.get("/company") 이고 prefix설정이 main.py에 /api로 되어 있을 것임.
  return response.data;
};

// 협력사 등록
export const createCompany = async (data) => {
  const response = await apiClient.post('/company', data);
  return response.data;
};
