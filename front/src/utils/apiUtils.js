/**
 * API 호출을 안전하게 처리하는 래퍼 함수입니다.
 * try-catch 반복을 줄이고, 공통 에러 처리를 수행합니다.
 * 
 * @param {Function} apiFunc 실행할 API 함수 (Promise 반환)
 * @param {Function} [onSuccess] 성공 시 실행할 콜백 (데이터 전달됨)
 * @param {Function|string} [onError] 실패 시 실행할 콜백 또는 에러 메시지
 * @returns {Promise<any>} API 결과 또는 null
 */
export const safeRequest = async (apiFunc, onSuccess = null, onError = null) => {
    try {
        const result = await apiFunc();
        if (onSuccess) {
            await onSuccess(result);
        }
        return result;
    } catch (error) {
        console.error("SafeRequest Error:", error);
        
        // 에러 처리
        if (typeof onError === 'function') {
            onError(error);
        } else if (typeof onError === 'string') {
            alert(onError); // 간단한 에러 메시지
        } else {
            // 기본 에러 처리: 서버에서 보낸 메시지 표시
            const msg = error.response?.data?.detail || "작업을 처리하는 중 문제가 발생했습니다.";
            alert(msg);
        }
        return null;
    }
};
