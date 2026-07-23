import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axiosInstance';
import KakaoMap from '../components/layouts/KakaoMap';
import CircularTimer from '../components/main/CircularTimer';
import TransportModal from '../components/main/TransportModal';
import AlarmModal from '../components/main/AlarmModal';
import uilExchange from '../assets/uil_exchange.svg';

import audio30 from '../assets/audio/30m.mp3';
import audio15 from '../assets/audio/15m.mp3';
import audio5 from '../assets/audio/5m.mp3';
import audio0 from '../assets/audio/0m.mp3';

const HONGIK = {
  name: '홍익대학교',
  address: '서울특별시 마포구 와우산로 94',
  latitude: 37.5515,
  longitude: 126.9254,
};

const HONGIK_COORDS = `${HONGIK.longitude},${HONGIK.latitude}`;
const TRIGGER_POINTS = [30 * 60, 15 * 60, 5 * 60, 0];
const AUDIO_MAP = {
  30: audio30,
  15: audio15,
  5: audio5,
  0: audio0,
};

const parseDate = (value) => (value ? new Date(value) : null);

const formatClock = (value) => {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const Menu = () => {
  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmSeconds, setAlarmSeconds] = useState(1800);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const [serverDeltaMs, setServerDeltaMs] = useState(0);
  const [testOffsetSeconds, setTestOffsetSeconds] = useState(0);

  const tripRef = useRef(null);
  const requestKeyRef = useRef('');
  const searchKeywordRef = useRef('');
  const previousRemainingRef = useRef(null);
  const triggeredRef = useRef(new Set());
  const audioRef = useRef(null);

  const syncTrip = useCallback((nextTrip) => {
    tripRef.current = nextTrip;
    setTrip(nextTrip);
    setTestOffsetSeconds(0);
    previousRemainingRef.current = nextTrip?.timer?.remainingSeconds ?? null;
    triggeredRef.current.clear();

    const serverTime = parseDate(nextTrip?.timer?.serverTime);
    setServerDeltaMs(serverTime ? serverTime.getTime() - Date.now() : 0);
  }, []);

  const loadCurrentTrip = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/trips/current');
      const currentTrip = response.data.data;
      if (currentTrip) {
        syncTrip(currentTrip);
        setDestination(currentTrip.destination.name);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          '진행 중인 여정을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [syncTrip]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadCurrentTrip, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCurrentTrip]);

  useEffect(() => {
    const interval = window.setInterval(() => setClockMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const openAlarm = useCallback((stageMin) => {
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
  }, []);

  const closeAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAlarmOpen(false);
  }, []);

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    []
  );

  const goldenTime = parseDate(trip?.timer?.goldenTime);
  const simulatedNowMs =
    clockMs + serverDeltaMs + testOffsetSeconds * 1000;
  const remainingSeconds = goldenTime
    ? Math.floor((goldenTime.getTime() - simulatedNowMs) / 1000)
    : null;
  const timerState =
    remainingSeconds == null
      ? 'UNAVAILABLE'
      : remainingSeconds > 0
        ? 'RUNNING'
        : 'EXPIRED';

  useEffect(() => {
    if (remainingSeconds == null) return;

    const previous = previousRemainingRef.current;
    if (previous != null && remainingSeconds < previous) {
      const crossed = TRIGGER_POINTS.filter(
        (point) => previous > point && remainingSeconds <= point
      )
        .filter((point) => !triggeredRef.current.has(point))
        .sort(
          (a, b) =>
            Math.abs(remainingSeconds - a) - Math.abs(remainingSeconds - b)
        );

      if (crossed.length > 0) {
        const point = crossed[0];
        triggeredRef.current.add(point);
        openAlarm(point / 60);
      }
    }

    previousRemainingRef.current = remainingSeconds;
  }, [remainingSeconds, openAlarm]);

  const regularRoutes = useMemo(
    () =>
      (trip?.routes || [])
        .filter((route) => ['SUBWAY', 'BUS'].includes(route.type))
        .filter(
          (route) =>
            route.departureDeadline &&
            new Date(route.departureDeadline).getTime() >= simulatedNowMs
        )
        .sort((a, b) => Number(b.recommended) - Number(a.recommended)),
    [trip, simulatedNowMs]
  );
  const recommendedRoute =
    regularRoutes.find((route) => route.recommended) || regularRoutes[0] || null;

  const startTrip = useCallback(
    async (resolvedLocation) => {
      const requestKey = `${resolvedLocation.destination}:${resolvedLocation.destinationAddress}`;
      if (requestKeyRef.current === requestKey) return;
      requestKeyRef.current = requestKey;

      setLoading(true);
      setError('');
      setNotice('');

      try {
        const activeTrip = tripRef.current;
        if (activeTrip && activeTrip.status == null) {
          await api.delete(`/api/v1/trips/${activeTrip.tripId}`);
        }

        const response = await api.post('/api/v1/trips', {
          origin: HONGIK,
          destination: {
            name:
              resolvedLocation.destinationName ||
              searchKeywordRef.current,
            address:
              resolvedLocation.destinationAddress ||
              searchKeywordRef.current,
            latitude: resolvedLocation.latitude,
            longitude: resolvedLocation.longitude,
          },
        });

        syncTrip(response.data.data);
        setNotice('막차 경로와 골든타임을 계산했습니다.');
      } catch (requestError) {
        requestKeyRef.current = '';
        if (requestError.response?.data?.code === 'TRIP-002') {
          await loadCurrentTrip();
          setNotice('이미 진행 중인 여정을 불러왔습니다.');
        } else {
          setError(
            requestError.response?.data?.message ||
              '막차 경로를 계산하지 못했습니다.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [loadCurrentTrip, syncTrip]
  );

  const handleDestinationResolved = useCallback(
    (resolvedLocation) => {
      startTrip(resolvedLocation);
    },
    [startTrip]
  );

  const handleSearch = () => {
    const keyword = destination.trim();
    if (!keyword) {
      setError('도착지를 입력해주세요.');
      return;
    }

    requestKeyRef.current = '';
    searchKeywordRef.current = keyword;
    setError('');
    setNotice('목적지 좌표를 찾고 있습니다.');
    setSearchedDestination(keyword);
  };

  const setTestRemaining = (targetSeconds) => {
    if (!goldenTime) return;

    const actualRemaining = Math.floor(
      (goldenTime.getTime() - (clockMs + serverDeltaMs)) / 1000
    );
    setTestOffsetSeconds(actualRemaining - targetSeconds);
    previousRemainingRef.current = targetSeconds + 1;
    triggeredRef.current.delete(targetSeconds);
    openAlarm(targetSeconds / 60);
  };

  const resetTestTime = () => {
    setTestOffsetSeconds(0);
    previousRemainingRef.current = null;
    triggeredRef.current.clear();
    closeAlarm();
  };

  const submitResult = async (status) => {
    if (!trip) return;
    try {
      const response = await api.patch(
        `/api/v1/trips/${trip.tripId}/result`,
        { status }
      );
      syncTrip(response.data.data);
      setNotice(
        status === 'SUCCESS'
          ? '막차 탑승 성공을 기록했습니다.'
          : '막차를 놓친 결과를 기록했습니다.'
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || '탑승 결과를 저장하지 못했습니다.'
      );
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col pb-24 relative overflow-x-hidden gap-4">
      <div className="w-full bg-green-15 p-10 text-black font-semibold flex flex-col items-center shadow-lg">
        <div className="flex w-full">
          <div className="flex flex-col gap-2.5 flex-1 mr-3 text-white">
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm">
              <span className="shrink-0 font-bold">출발지:</span>
              <span className="truncate">{HONGIK.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm">
              <span className="shrink-0 font-bold">도착지:</span>
              <input
                type="text"
                placeholder="도착지를 입력해주세요 (예: 강남역)"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                onKeyDown={(event) =>
                  event.key === 'Enter' && handleSearch()
                }
                className="bg-transparent border-none outline-none w-full text-white text-xs placeholder-white/70"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="p-1 hover:text-black transition cursor-pointer"
              title="막차 경로 검색"
              disabled={loading}
            >
              <img src={uilExchange} alt="막차 경로 검색" />
            </button>
            <button type="button" className="p-1 text-white" title="더보기">
              ⋮
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-gray-400 mb-0">
        타이머는 30분, 15분, 5분 전, 정각에 울립니다
      </p>

      {error && (
        <div className="mx-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}
      {notice && (
        <div className="mx-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-300">
          {notice}
        </div>
      )}

      {trip?.timer?.goldenTime && (
        <div className="flex justify-center items-center gap-2">
          {[30, 15, 5, 0].map((minute) => (
            <button
              key={minute}
              type="button"
              onClick={() => setTestRemaining(minute * 60)}
              className="text-white text-[11px] px-2.5 py-1.5 bg-gray-800 rounded-full border border-white/10 cursor-pointer"
            >
              {minute === 0 ? '정각 테스트' : `${minute}분 전`}
            </button>
          ))}
          {testOffsetSeconds !== 0 && (
            <button
              type="button"
              onClick={resetTestTime}
              className="text-[11px] text-gray-300 underline cursor-pointer"
            >
              실제 시간
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center items-center my-1">
        <CircularTimer
          loading={loading}
          timer={trip?.timer}
          remainingSeconds={remainingSeconds}
          timerState={timerState}
          route={recommendedRoute}
          onOtherWaysClick={() => setIsModalOpen(true)}
        />
      </div>

      {regularRoutes.length > 0 && timerState === 'RUNNING' && (
        <div className="mx-4 flex flex-col gap-3">
          {regularRoutes.map((route) => (
            <div
              key={route.routeId}
              className="bg-[#2A2D35] border border-white/10 rounded-[16px] p-4 flex flex-col gap-2 shadow-md"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {route.recommended ? '추천 막차 경로' : '다른 막차 경로'}
                </span>
                <div className="flex items-center gap-1.5">
                  {route.recommended && (
                    <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded">
                      추천
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded">
                    {route.type}
                  </span>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{route.name}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {route.guide}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-2">
                    정류장까지 도보 {route.walkMinutes}분 · 총 약{' '}
                    {route.totalMinutes}분 ·{' '}
                    {Number(route.fare).toLocaleString('ko-KR')}원
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-gray-400 block">막차</span>
                  <strong className="text-sm text-[#FF5A52]">
                    {formatClock(route.scheduledAt)}
                  </strong>
                  <span className="text-[10px] text-gray-500 block mt-1">
                    출발 {formatClock(route.departureDeadline)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {trip && trip.status == null && (
        <div className="mx-4 flex gap-2">
          {timerState === 'EXPIRED' ? (
            <button
              type="button"
              onClick={() => submitResult('MISSED')}
              className="flex-1 rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-xs font-bold text-red-300"
            >
              막차를 놓쳤어요
            </button>
          ) : (
            <button
              type="button"
              onClick={() => submitResult('SUCCESS')}
              className="flex-1 rounded-xl bg-green-500/15 border border-green-500/30 px-4 py-3 text-xs font-bold text-green-300"
            >
              막차 탑승 완료
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <TransportModal
          onClose={() => setIsModalOpen(false)}
          routes={trip?.routes || []}
          currentTimeMs={simulatedNowMs}
        />
      )}

      <AlarmModal
        key={`${alarmOpen}-${alarmSeconds}`}
        isOpen={alarmOpen}
        onClose={closeAlarm}
        goldenTime={formatClock(goldenTime)}
        initialSeconds={alarmSeconds}
      />

      <div className="mt-2 flex flex-col gap-3 m-4">
        <h3 className="text-base font-bold text-white px-1">나의 경로</h3>
        <div className="w-full h-[220px] bg-[#00E676] rounded-[24px] overflow-hidden shadow-inner flex items-center justify-center relative">
          <KakaoMap
            destination={searchedDestination}
            origin={HONGIK_COORDS}
            onCoordsChange={handleDestinationResolved}
            onError={setError}
          />
          {!searchedDestination && (
            <span className="absolute text-sm font-bold text-black/60">
              도착지를 검색하면 경로가 표시됩니다
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
