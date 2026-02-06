
import client from './client';

export const companyApi = {
    // [SYS] 모든 업체 목록 조회 (표준 이름: getCompanies)
    getCompanies: () => client.get('/sys/companies'),
    
    // [SYS] 특정 업체 상세 조회
    getCompany: (id) => client.get(`/sys/companies/${id}`),

    // [SYS] 업체 직접 생성
    createCompany: (data) => client.post('/sys/companies', data),
};

export default companyApi;
