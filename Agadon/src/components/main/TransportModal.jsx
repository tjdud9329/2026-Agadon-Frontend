import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance'; // 🚨 경로가 맞는지 확인해 주세요!

export default function TransportModal({ onClose, originCoords, destCoords }) {
  // 택시 API 데이터를 담을 상태
  const [taxiInfo, setTaxiInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTaxiInfo = async () => {
      console.log('📍 모달로 전달받은 출발지 좌표:', originCoords);
      console.log('📍 모달로 전달받은 도착지 좌표:', destCoords);
      //  도착지 좌표가 아직 없으면 API를 부르지 않고 대기
      if (!destCoords) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);

        // 부모 컴포넌트(Menu)에서 좌표를 안 넘겨줬을 경우를 대비한 스웨거 기본값
        const payload = {
          origin: originCoords || '127.111202,37.394912',
          destination: destCoords || '127.099323,37.401120',
        };

        // 기존 코드 ...
        const response = await api.post('/api/directions', payload);
        const data = response.data;

        // 🚨 올려주신 JSON 구조 (data.routes[0].summary) 에 맞춰서 파싱합니다!
        if (data && data.routes && data.routes.length > 0) {
          const summary = data.routes[0].summary; // summary 객체 추출

          setTaxiInfo({
            fare: summary.fare.taxi || 0,
            distance: summary.distance || 0,
            duration: summary.duration || 0,
          });
        }
      } catch (error) {
        console.error('택시 정보 로드 실패:', error);
        // 에러 시 폴백(Fallback) 데이터 표시
        setTaxiInfo({ fare: 19900, distance: 17900, duration: 2700 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxiInfo();
  }, [originCoords, destCoords]);

  // 🛠️ 데이터 포맷팅 함수들
  const formatDuration = (seconds) => {
    const totalMinutes = Math.ceil(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} 시간 ${mins} 분`;
    }
    return `${mins} 분`;
  };

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1); // km 단위로 변환 후 소수점 1자리까지
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] flex flex-col justify-end items-center pb-[100px] px-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] bg-[#42454C] rounded-[16px] p-5 text-white shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🚖 택시 섹션 */}
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 font-medium">택시</span>

            {/* 로딩 처리 및 API 데이터 바인딩 */}
            {isLoading || !taxiInfo ? (
              <div className="text-[22px] font-bold leading-tight text-gray-400 animate-pulse">
                계산 중...
              </div>
            ) : (
              <>
                <div className="text-[22px] font-bold leading-tight">
                  {formatDuration(taxiInfo.duration)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {formatDistance(taxiInfo.distance)}km{' '}
                  <span className="mx-1 opacity-50">|</span> 카드 약{' '}
                  {taxiInfo.fare.toLocaleString()}원
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="px-4 py-1.5 bg-[#666B74] text-white text-[11px] font-medium rounded-full hover:bg-gray-500 transition cursor-pointer mb-1"
          >
            자세히 보기
          </button>
        </div>

        {/* ➖ 구분선 */}
        <div className="w-full h-[1px] bg-gray-600/50 mb-4"></div>

        {/* 🚌 N버스 섹션 */}
        <div className="flex flex-col gap-0.5 relative">
          <span className="text-[11px] text-gray-400 font-medium">N버스</span>
          <div className="text-[22px] font-bold leading-tight">
            1 시간 49 분
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            오전 1:56~3:46 <span className="mx-1 opacity-50">|</span> 2,500원
          </div>

          <div className="mt-4 text-[12px] text-gray-300 font-medium flex items-center gap-1.5">
            동교동삼거리{' '}
            <span className="text-gray-500 text-[11px]">14061</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-1.5 py-0.5 bg-[#FF2B2B] text-white text-[9px] font-bold rounded-sm">
              간선
            </span>
            <span className="text-sm font-bold">N75(심야)</span>
          </div>

          <div className="text-[11px] text-gray-400 mt-1">강남역9번출구</div>

          <button
            type="button"
            className="absolute bottom-0 right-0 px-4 py-1.5 bg-[#666B74] text-white text-[11px] font-medium rounded-full hover:bg-gray-500 transition cursor-pointer"
            onClick={() => alert('상세 경로 페이지로 이동합니다.')}
          >
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  );
}
