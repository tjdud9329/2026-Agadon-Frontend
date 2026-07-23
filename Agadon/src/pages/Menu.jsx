import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Navbar from '../components/layouts/Navbar';
import KakaoMap from '../components/layouts/KakaoMap';
import CircularTimer from '../components/main/CircularTimer';
import TransportModal from '../components/main/TransportModal';
import AlarmModal from '../components/main/AlarmModal';
import { MOCK_STATIONS } from '../mock/metroMockData';
import uil_exchange from '../assets/uil_exchange.svg';

import audio30 from '../assets/audio/30m.mp3';
import audio15 from '../assets/audio/15m.mp3';
import audio5 from '../assets/audio/5m.mp3';
import audio0 from '../assets/audio/0m.mp3';

const TRIGGER_POINTS = [30 * 60, 15 * 60, 5 * 60, 0];

const AUDIO_MAP = {
  30: audio30,
  15: audio15,
  5: audio5,
  0: audio0,
};

const Menu = () => {
  const HONGIK_ADDRESS = '서울특별시 마포구 와우산로 94';
  const HONGIK_COORDS = '126.9254,37.5515';

  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);

  // 🚨 좌표 상태를 객체가 아닌 개별 원시값 또는 안정된 상태로 분리하여 불필요한 리렌더링 방지
  const [destCoords, setDestCoords] = useState('');

  // 교통수단 모달
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 알람 모달 관련 상태
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmSeconds, setAlarmSeconds] = useState(1800);
  const triggeredRef = useRef(new Set());
  const audioRef = useRef(null);

  const getSelectedStationId = () => {
    if (!searchedDestination) return 1;

    const found = MOCK_STATIONS.find(
      (station) =>
        station.name.includes(searchedDestination) ||
        searchedDestination.includes(station.name.replace('역', ''))
    );

    return found ? found.id : 1;
  };

  const currentStationData =
    MOCK_STATIONS.find((s) => s.id === getSelectedStationId()) ||
    MOCK_STATIONS[0];

  const lastTrainTime = useMemo(() => {
    const t = new Date();
    const [h, m] = currentStationData.lastTrainTime.split(':').map(Number);
    t.setHours(h, m, 0, 0);
    if (h < 5) t.setDate(t.getDate() + 1);
    return t;
  }, [currentStationData]);

  const goldenTime = useMemo(() => {
    const walkMins = walkInfo
      ? walkInfo.minutes
      : currentStationData.walkingTime;
    return new Date(lastTrainTime.getTime() - walkMins * 60 * 1000);
  }, [walkInfo, lastTrainTime, currentStationData]);

  const goldenTimeStr = useMemo(() => {
    if (!goldenTime) return '';
    const h = goldenTime.getHours();
    const m = String(goldenTime.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${ampm} ${h % 12 || 12}:${m}`;
  }, [goldenTime]);

  const firstTrainMin = useMemo(() => {
    const firstTrain = new Date(lastTrainTime);
    firstTrain.setHours(5, 30, 0, 0);
    if (firstTrain <= lastTrainTime)
      firstTrain.setDate(firstTrain.getDate() + 1);
    return Math.floor((firstTrain - lastTrainTime) / 60000);
  }, [lastTrainTime]);

  const openAlarm = (stageMin) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setAlarmSeconds(stageMin * 60);
    setAlarmOpen(true);

    const src = AUDIO_MAP[stageMin];
    if (src) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  };

  const closeAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAlarmOpen(false);
  };

  useEffect(() => {
    if (!goldenTime) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((goldenTime - Date.now()) / 1000);

      for (const point of TRIGGER_POINTS) {
        if (
          remaining <= point &&
          remaining > point - 5 &&
          !triggeredRef.current.has(point)
        ) {
          triggeredRef.current.add(point);
          openAlarm(point / 60);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [goldenTime]);

  useEffect(() => {
    triggeredRef.current.clear();
  }, [searchedDestination]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSearch = () => {
    if (!destination.trim()) return;
    setSearchedDestination(destination);
  };

  const handleOtherWaysClick = () => {
    setIsModalOpen(true);
  };

  // 🚨 좌표 변경 핸들러를 useCallback으로 고정하여 자식 컴포넌트의 무한 렌더링 차단
  const handleCoordsChange = useCallback((coords) => {
    if (coords && coords.destination) {
      setDestCoords((prev) =>
        prev === coords.destination ? prev : coords.destination
      );
    }
  }, []);

  return (
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

      {/* 3. 원형 타이머 */}
      <div className="flex justify-center items-center my-2">
        <CircularTimer
          selectedStationId={getSelectedStationId()}
          onOtherWaysClick={handleOtherWaysClick}
        />
      </div>

      {/* 4. 교통수단 모달 */}
      {isModalOpen && (
        <TransportModal
          onClose={() => setIsModalOpen(false)}
          originCoords={HONGIK_COORDS}
          destCoords={destCoords}
        />
      )}

      {/* 5. 알람 모달 */}
      <AlarmModal
        isOpen={alarmOpen}
        onClose={closeAlarm}
        goldenTime={goldenTimeStr}
        initialSeconds={alarmSeconds}
        firstTrainMin={firstTrainMin}
      />

      {/* 6. 나의 경로 섹션 */}
      <div className="mt-2 flex flex-col gap-3 m-4">
        <h3 className="text-base font-bold text-white px-1">나의 경로</h3>

        <div className="w-full h-[220px] bg-[#00E676] rounded-[24px] overflow-hidden shadow-inner flex items-center justify-center relative">
          <KakaoMap
            destination={searchedDestination}
            origin={HONGIK_COORDS}
            onWalkingTime={(min, m) => setWalkInfo({ minutes: min, meters: m })}
            onCoordsChange={handleCoordsChange}
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

      {/* 7. 하단 네비게이션 바 */}
      <Navbar />
    </div>
  );
};

export default Menu;
