import { useState } from 'react';
import Navbar from '../components/layouts/Navbar';
import KakaoMap from '../components/layouts/KakaoMap';
import useCurrentLocation from '../hooks/useCurrentLocation';
import CircularTimer from '../components/main/CircularTimer';
import TransportModal from '../components/main/TransportModal';
import uil_exchange from '../assets/uil_exchange.svg';

const Menu = () => {
  const { address: currentAddr } = useCurrentLocation();

  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);
  const [mapCoords, setMapCoords] = useState({
    origin: '126.9237,37.5571', // 기본 현위치 경도,위도
    destination: '',
  });

  // 🚨 모달 열림/닫힘 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = () => {
    if (!destination.trim()) return;
    setSearchedDestination(destination);
  };

  // 🚨 [다른 방법 보기] 클릭 시 모달 열기
  const handleOtherWaysClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen text-white flex flex-col pt-0 pb-24 relative overflow-x-hidden gap-4">
      {/* 1. 상단 출발/도착지 카드 */}
      <div className="w-full top-0 bg-green-15 p-10 text-black font-semibold flex flex-col items-center justify-between shadow-lg">
        <div className="flex w-full">
          <div className="flex flex-col gap-2.5 flex-1 mr-3 text-white">
            {/* 현위치 표시 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
              <span className="shrink-0 font-bold">현위치:</span>
              <span className="truncate">
                {currentAddr || '서울 마포구 상수동 309-18'}
              </span>
            </div>

            {/* 도착지 입력창 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
              <span className="shrink-0 font-bold">도착지:</span>
              <input
                type="text"
                placeholder="도착지를 입력해주세요."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent border-none outline-none w-full text-white text-xs"
              />
            </div>
          </div>

          {/* 우측 상하 전환 & 옵션 아이콘 */}
          <div className="flex flex-col items-center justify-between gap-3 text-black/70">
            <button
              type="button"
              onClick={handleSearch}
              className="p-1 hover:text-black transition"
              title="검색"
            >
              <img src={uil_exchange} alt="전환 아이콘" />
            </button>
            <button
              type="button"
              className="p-1 text-white transition"
              title="더보기"
            >
              ⋮
            </button>
          </div>
        </div>
      </div>

      {/* 2. 타이머 안내 문구 */}
      <p className="text-center text-[12px] text-gray-400 mb-2">
        타이머는 30분, 15분, 5분 전, 정각에 울립니다
      </p>

      {/* 3. 원형 타이머 메인 영역 (onOtherWaysClick 함수 전달) */}
      <div className="flex justify-center items-center my-2">
        <CircularTimer onOtherWaysClick={handleOtherWaysClick} />
      </div>

      {/* 6. 대체 이동 수단 모달 (TransportModal) */}
      {isModalOpen && (
        <TransportModal
          onClose={() => setIsModalOpen(false)}
          originCoords={mapCoords.origin}
          destCoords={mapCoords.destination}
        />
      )}

      {/* 4. 나의 경로 섹션 */}
      <div className="mt-6 flex flex-col gap-3 m-4">
        <h3 className="text-base font-bold text-white px-1">나의 경로</h3>

        {/* 카카오 맵 컨테이너 */}
        <div className="w-full h-[220px] bg-[#00E676] rounded-[24px] overflow-hidden shadow-inner flex items-center justify-center relative">
          <KakaoMap
            destination={searchedDestination}
            onWalkingTime={(min, m) => setWalkInfo({ minutes: min, meters: m })}
            onCoordsChange={(coords) => {
              setMapCoords({
                origin: coords.origin,
                destination: coords.destination,
              });
            }}
          />

          {/* 지도 정보 안내 오버레이 */}
          {walkInfo && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-[16px] text-xs text-white flex justify-between items-center z-10 border border-white/10">
              <span>도보 약 {walkInfo.minutes}분</span>
              <span className="text-gray-400">
                (직선 {(walkInfo.meters / 1000).toFixed(1)}km)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 5. 하단 플로팅 네비게이션 바 */}
      <Navbar />
    </div>
  );
};

export default Menu;
