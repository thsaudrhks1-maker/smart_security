
import client from './client';

export const dangerApi = {
    // [CONTENT] 위험 요소 정보 목록
    getDangerInfoList: async () => {
        const response = await client.get('/content/danger_info');
        return response.data;
    },
    
    // [CONTENT] 새로운 위험 요소 정보 생성
    createDangerInfo: async (data) => {
        const response = await client.post('/content/danger_info', data);
        return response.data;
    }
};

export default dangerApi;
