import { useState } from 'react';
import Navbar from '../components/layouts/Navbar';
import KakaoMap from '../components/layouts/KakaoMap';
import CircularTimer from '../components/main/CircularTimer';
import TransportModal from '../components/main/TransportModal';
import AlarmModal from '../components/main/AlarmModal';
import { MOCK_STATIONS } from '../mock/metroMockData'; // 🚨 Mock 데이터 임포트
import uil_exchange from '../assets/uil_exchange.svg';

const Menu = () => {
  const HONGIK_ADDRESS = '서울특별시 마포구 와우산로 94';
  const HONGIK_COORDS = '126.9254,37.5515';

  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);
  const [mapCoords, setMapCoords] = useState({
    origin: HONGIK_COORDS,
    destination: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alarmTime, setAlarmTime] = useState(null);

  // 🚨 [핵심] 사용자가 입력한 검색어와 일치하는 Mock 역의 ID를 찾아냄 (없으면 기본값 1번 상수역)
  const getSelectedStationId = () => {
    if (!searchedDestination) return 1; // 검색 전 기본값

    // '강남역' 또는 '강남'처럼 검색해도 매칭되도록 처리
    const found = MOCK_STATIONS.find(
      (station) =>
        station.name.includes(searchedDestination) ||
        searchedDestination.includes(station.name.replace('역', ''))
    );

    return found ? found.id : 1; // 일치하는 역이 없으면 기본 1번 역
  };

  // 🚨 현재 선택된 역의 상세 Mock 데이터 객체를 통째로 가져옴
  const currentStationData =
    MOCK_STATIONS.find((s) => s.id === getSelectedStationId()) ||
    MOCK_STATIONS[0];

  const handleSearch = () => {
    if (!destination.trim()) return;
    setSearchedDestination(destination);
  };

  const handleOtherWaysClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen text-white flex flex-col pt-0 pb-24 relative overflow-x-hidden gap-4">
        {/* 1. 상단 출발/도착지 카드 */}
        <div className="w-full top-0 bg-green-15 p-10 text-black font-semibold flex flex-col items-center justify-between shadow-lg">
          <div className="flex w-full">
            <div className="flex flex-col gap-2.5 flex-1 mr-3 text-white">
              <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
                <span className="shrink-0 font-bold">출발지:</span>
                <span className="truncate">{HONGIK_ADDRESS}</span>
              </div>

              <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
                <span className="shrink-0 font-bold">도착지:</span>
                <input
                  type="text"
                  placeholder="도착지를 입력해주세요 (예: 강남역)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent border-none outline-none w-full text-white text-xs placeholder-white/70"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 text-black/70">
              <button
                type="button"
                onClick={handleSearch}
                className="p-1 hover:text-black transition cursor-pointer"
                title="검색"
              >
                <img src={uil_exchange} alt="전환 아이콘" />
              </button>
              <button
                type="button"
                className="p-1 text-white transition cursor-pointer"
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

        {/* 3. 원형 타이머 메인 영역 (🚨 searchedDestination에 따라 연동된 stationId 전달) */}
        <div className="flex justify-center items-center my-2">
          <CircularTimer
            selectedStationId={getSelectedStationId()}
            onOtherWaysClick={handleOtherWaysClick}
            onAlarmTrigger={(time) => setAlarmTime(time)}
          />
        </div>

        {/* 🚨 [추가됨] 선택된 역의 막차 정보 & 도보 시간 안내 카드 */}
        <div className="mx-4 bg-[#2A2D35] border border-white/10 rounded-[16px] p-4 flex flex-col gap-2 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-medium">
              선택된 노선 정보
            </span>
            <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded">
              {currentStationData.line}
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">
                {currentStationData.name} 행 막차
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                탑승 역:{' '}
                <strong className="text-white">
                  {currentStationData.departureStation}
                </strong>{' '}
                (도보 {currentStationData.walkingTime}분 소요)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">막차 시각</span>
              <span className="text-sm font-extrabold text-[#FF2B2B]">
                {currentStationData.lastTrainTime.slice(0, 5)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. 대체 이동 수단 모달 */}
        {isModalOpen && (
          <TransportModal
            onClose={() => setIsModalOpen(false)}
            originCoords={mapCoords.origin}
            destCoords={mapCoords.destination}
          />
        )}

        {/* 4. 나의 경로 섹션 */}
        <div className="mt-2 flex flex-col gap-3 m-4">
          <h3 className="text-base font-bold text-white px-1">나의 경로</h3>

          <div className="w-full h-[220px] bg-[#00E676] rounded-[24px] overflow-hidden shadow-inner flex items-center justify-center relative">
            <KakaoMap
              destination={searchedDestination}
              origin={HONGIK_COORDS}
              onWalkingTime={(min, m) =>
                setWalkInfo({ minutes: min, meters: m })
              }
              onCoordsChange={(coords) => {
                setMapCoords({
                  origin: coords.origin || HONGIK_COORDS,
                  destination: coords.destination,
                });
              }}
            />

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

        <Navbar />
      </div>

      {/* 알람 모달 */}
      {alarmTime !== null && (
        <AlarmModal timeLeft={alarmTime} onClose={() => setAlarmTime(null)} />
      )}
    </>
  );
};

export default Menu;
