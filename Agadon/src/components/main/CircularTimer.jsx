import React, { useState, useEffect, useRef } from 'react';
// 🚨 아까 만든 Mock 데이터를 임포트합니다. (경로는 프로젝트에 맞게 수정해주세요)
import { MOCK_STATIONS } from '../../mock/metroMockData';

// 24시 이상 및 일반 시간 문자열을 정확한 Date 객체로 변환하는 함수
const parseDepartTime = (timeStr) => {
  let [h, m, s = 0] = timeStr.split(':').map(Number);

  const isNextDay = h >= 24;
  if (isNextDay) h -= 24;

  const target = new Date();
  target.setHours(h, m, s, 0);

  const nowHours = new Date().getHours();
  if (isNextDay || (h < 5 && nowHours >= 12)) {
    target.setDate(target.getDate() + 1);
  }

  return target;
};

// 시간을 AM/PM 포맷으로 예쁘게 바꿔주는 헬퍼 함수
const formatAmPm = (dateObj) => {
  let h = dateObj.getHours();
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12; // 0시는 12시로 표기
  return `${ampm} ${h}:${m}`;
};

export default function CircularTimer({
  selectedStationId = 1, // 테스트용 (1:상수역, 2:강남역 등)
  onOtherWaysClick = () => {},
  onAlarmTrigger = () => {}, // 알람 모달용
}) {
  const [timeLeft, setTimeLeft] = useState(null); // 남은 초
  const [totalSeconds, setTotalSeconds] = useState(3600);
  const [lastTrainInfo, setLastTrainInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚨 [핵심] '진짜 출발해야 하는 시각(막차시간 - 도보시간)'을 저장할 Ref
  const targetTimeRef = useRef(null);

  // 1. Mock 데이터 계산 로직
  const fetchMockData = () => {
    setLoading(true);

    // 선택된 역 정보 가져오기 (기본값: 상수역)
    const stationData =
      MOCK_STATIONS.find((s) => s.id === selectedStationId) || MOCK_STATIONS[0];

    // 1) 지하철역에서 막차가 떠나는 실제 시간
    const trainDepartTime = parseDepartTime(stationData.lastTrainTime);

    // 2) 🚨 찐 골든타임 계산 (막차시간 - 도보시간)
    const walkMilliseconds = stationData.walkingTime * 60 * 1000;
    const mustLeaveTime = new Date(
      trainDepartTime.getTime() - walkMilliseconds
    );

    // Ref에 저장해두고 매초 현재시간과 비교
    targetTimeRef.current = mustLeaveTime;

    setLastTrainInfo({
      departureStation: stationData.departureStation, // 홍대입구역 or 상수역
      walkingTime: stationData.walkingTime,
      trainTime: stationData.lastTrainTime,
      leaveTimeFormatted: formatAmPm(mustLeaveTime), // 예: PM 11:42
    });

    const now = new Date();
    const diffInSeconds = Math.floor((mustLeaveTime - now) / 1000);

    setTimeLeft(diffInSeconds);
    setTotalSeconds(diffInSeconds > 3600 ? diffInSeconds : 3600);
    setLoading(false);
  };

  useEffect(() => {
    fetchMockData();
  }, [selectedStationId]);

  // 2. 🚨 실시간 카운트다운 (새로고침/백그라운드 방어 로직)
  useEffect(() => {
    if (!targetTimeRef.current) return;

    const timer = setInterval(() => {
      const now = new Date();
      // 단순히 -1을 하는게 아니라, 목표시각과 현재시각의 찐 차이를 매초 구함
      const diffInSeconds = Math.floor((targetTimeRef.current - now) / 1000);

      // 알람 트리거 (30분, 15분, 5분, 정각)
      if ([1800, 900, 300, 0].includes(diffInSeconds)) {
        onAlarmTrigger(diffInSeconds);
      }

      setTimeLeft(diffInSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [onAlarmTrigger]);

  // 상태 판단 (막차 지남 여부 및 경고)
  const isExpired = timeLeft !== null && timeLeft <= 0;
  const isWarning = isExpired || (timeLeft !== null && timeLeft <= 1200);

  // SVG 원 설정
  const size = 290;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;

  // 게이지 진행률 계산
  const progress = isExpired
    ? 1
    : timeLeft && totalSeconds
      ? timeLeft / totalSeconds
      : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const angle = (1 - progress) * 360 - 90;
  const knobX = center + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = center + radius * Math.sin((angle * Math.PI) / 180);

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const absSecs = Math.abs(seconds);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return seconds < 0 ? `+${timeStr}` : timeStr;
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 text-xs">
        도보 시간을 반영하여 골든타임을 계산 중입니다...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 1. 원형 타이머 SVG */}
      <div className="relative flex items-center justify-center relative z-10">
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-gray-700/50"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-linear ${isWarning ? 'stroke-[#FF2B2B]' : 'stroke-green-15'}`}
          />
        </svg>

        {/* 게이지 끝 노브 */}
        <div
          className="absolute w-5 h-5 bg-white rounded-full shadow-md transition-all duration-1000 ease-linear"
          style={{
            left: `${knobX}px`,
            top: `${knobY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* 원 중앙 텍스트 */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={`text-5xl font-extrabold tracking-wider mb-1 ${isExpired ? 'text-[#FF2B2B]' : 'text-white'}`}
          >
            {formatTime(timeLeft)}
          </span>

          <span
            className={`text-base font-bold whitespace-pre-line ${isWarning ? 'text-[#FF2B2B]' : 'text-green-15'}`}
          >
            {isExpired
              ? '골든 타임\n경과'
              : isWarning
                ? '막차 임박!'
                : '골든 타임'}
          </span>

          {/* 🚨 도보 시간 및 탑승역 안내 텍스트 추가 */}
          {lastTrainInfo && !isExpired && (
            <div className="flex flex-col items-center mt-2 text-gray-400">
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-sm mb-1">
                {lastTrainInfo.departureStation}까지 도보{' '}
                {lastTrainInfo.walkingTime}분
              </span>
              <span className="text-xs font-semibold text-white">
                {lastTrainInfo.leaveTimeFormatted} 에 출발하세요!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. [다른 방법 보기] 버튼 */}
      <div className="w-full flex items-center justify-between px-2 mt-4 relative z-50">
        <span className="text-xs text-gray-400 font-medium">
          막차 카운트다운이 끝났습니다
        </span>
        <button
          type="button"
          onClick={onOtherWaysClick}
          className="px-4 py-2 bg-[#FF2B2B]/20 text-[#FF2B2B] hover:bg-[#FF2B2B]/30 font-bold text-xs rounded-full border border-[#FF2B2B]/40 transition cursor-pointer relative z-50"
        >
          다른 방법 보기
        </button>
      </div>
    </div>
  );
}
