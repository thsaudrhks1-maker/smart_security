
import client from "./client";

/**
 * [DAILY] 작업자 위치 전송
 * @param {Object} data 
 * @param {number} data.worker_id 
 * @param {number} data.lat 
 * @param {number} data.lng 
 * @param {string} data.tracking_mode ('GPS' | 'BLE')
 */
export const sendWorkerLocation = async (data) => {
  try {
    const response = await client.post("/api/daily/worker/location", data);
    return response.data;
  } catch (error) {
    console.error("위치 전송 실패:", error);
    // 위치 전송 실패는 사용자에게 알리지 않고 조용히 넘김 (UX)
    return null;
  }
};
