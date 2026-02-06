
/**
 * [UTILS] API 통신 관련 공통 유틸리티
 */

/**
 * API 에러 메시지 추출기
 * 서버에서 내려오는 다양한 형태의 에러 객체를 분석하여 사용자에게 보여줄 메시지를 반환합니다.
 */
export const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.message) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
};

/**
 * 날짜 포맷터 (YYYY-MM-DD)
 */
export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toISOString().split('T')[0];
};
