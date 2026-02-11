import React, { useState, useEffect } from 'react';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { Shield, Smartphone, Bluetooth, Play, Square } from 'lucide-react';

const BeaconScannerTest = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState(null);
    const [scanTime, setScanTime] = useState(0);

    useEffect(() => {
        let interval;
        if (isScanning) {
            interval = setInterval(() => {
                setScanTime(prev => prev + 1);
            }, 1000);
        } else {
            setScanTime(0);
        }
        return () => clearInterval(interval);
    }, [isScanning]);

    const startScan = async () => {
        try {
            setError(null);
            setDevices([]); // 초기화

            await BleClient.initialize();

            // 권한 요청 (안드로이드 필수)
            // await BleClient.requestLEScan(); // 일부 버전에서 필요할 수 있음

            setIsScanning(true);
            console.log("📡 BLE 스캔 시작...");

            // 5초간 스캔 (또는 무제한)
            // allowDuplicates: true여야 RSSI 변화를 계속 감지함
            await BleClient.requestLEScan(
                {
                    allowDuplicates: true, 
                },
                (result) => {
                    console.log('New BLE Device:', result);
                    setDevices(prev => {
                        const existing = prev.find(d => d.device.deviceId === result.device.deviceId);
                        if (existing) {
                            // RSSI 업데이트
                            return prev.map(d => d.device.deviceId === result.device.deviceId ? result : d);
                        }
                        return [...prev, result];
                    });
                }
            );

            // 30초 후 스캔 자동 종료 (배터리 보호)
            setTimeout(() => {
                stopScan();
            }, 30000);

        } catch (err) {
            console.error("BLE Scan Error:", err);
            setError(err.message || "스캔 중 오류 발생 (앱 빌드 상태가 아니거나 권한이 없습니다)");
            setIsScanning(false);
        }
    };

    const stopScan = async () => {
        try {
            await BleClient.stopLEScan();
            setIsScanning(false);
            console.log("🛑 BLE 스캔 종료");
        } catch (err) {
            console.error("Stop Scan Error:", err);
        }
    };

    // RSSI 신호 강도에 따른 색상
    const getSignalColor = (rssi) => {
        if (rssi > -60) return '#22c55e'; // 강함 (가까움)
        if (rssi > -80) return '#eab308'; // 중간
        return '#ef4444'; // 약함 (멈)
    };

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Bluetooth size={24} color="#3b82f6" />
                <h3 style={{ margin: 0 }}>비콘/BLE 신호 테스트</h3>
            </div>

            <div style={{ marginBottom: '15px', color: '#64748b', fontSize: '0.9rem' }}>
               ※ 이 기능은 <strong>앱(APK)으로 빌드된 상태</strong>에서만 작동합니다. <br/>
               (웹 브라우저에서는 보안상 작동하지 않습니다)
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {!isScanning ? (
                    <button 
                        onClick={startScan}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                        <Play size={18} fill="white" /> 스캔 시작
                    </button>
                ) : (
                    <button 
                        onClick={stopScan}
                        style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                        <Square size={18} fill="white" /> 스캔 중지 ({scanTime}s)
                    </button>
                )}
            </div>

            {error && (
                <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
                    🚨 {error}
                </div>
            )}

            <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#f8fafc', borderRadius: '10px', padding: '10px' }}>
                {devices.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                        {isScanning ? "신호 찾는 중..." : "스캔 버튼을 눌러주세요"}
                    </div>
                ) : (
                    devices.map((d, idx) => (
                        <div key={d.device.deviceId} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                                    {d.device.name || 'Unknown Device'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    ID: {d.device.deviceId}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {/* 제조사 데이터 등 파싱 필요 시 추가 */}
                                    Raw: {d.manufacturerData ? JSON.stringify(d.manufacturerData) : 'N/A'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: getSignalColor(d.rssi) }}>
                                    {d.rssi}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>dBm</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BeaconScannerTest;
