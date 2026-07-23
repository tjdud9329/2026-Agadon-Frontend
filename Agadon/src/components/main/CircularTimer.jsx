import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

//  24시 이상(24:13) 및 일반 시간 문자열을 정확한 Date 객체로 변환하는 유틸 함수
const parseDepartTime = (timeStr) => {
  let [h, m, s = 0] = timeStr.split(':').map(Number);

  const isNextDay = h >= 24;
  if (isNextDay) h -= 24;

  const target = new Date();
  target.setHours(h, m, s, 0);

  // 24시 넘어가거나, 새벽 시각(0~4시)인데 현재가 밤(12시 이후)이면 다음 날로 설정
  const nowHours = new Date().getHours();
  if (isNextDay || (h < 5 && nowHours >= 12)) {
    target.setDate(target.getDate() + 1);
  }

  return target;
};

export default function CircularTimer({ onOtherWaysClick }) {
  const [timeLeft, setTimeLeft] = useState(null); // 남은 초
  const [totalSeconds, setTotalSeconds] = useState(3600);
  const [lastTrainInfo, setLastTrainInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. API 호출 및 계산
  const fetchLastTrain = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/metro/last-train', {
        params: { station: '100', weekTag: 1, inoutTag: 1 },
      });

      const data = response.data;

      if (data && data.lastTrains && data.lastTrains.length > 0) {
        //'00:00:00' 제외하고 실제 운행하는 막차들만 추출
        const validTrains = data.lastTrains.filter(
          (train) => train.departTime && train.departTime !== '00:00:00'
        );

        // 가장 마지막 막차 선택 (없으면 첫 번째 항목)
        const targetTrain =
          validTrains.length > 0
            ? validTrains[validTrains.length - 1]
            : data.lastTrains[0];

        setLastTrainInfo({
          stationName: data.stationName,
          line: data.line,
          departTime: targetTrain.departTime,
          destination: targetTrain.destination,
        });

        // 24:13:00 대응 파싱 함수 적용
        const now = new Date();
        const targetTime = parseDepartTime(targetTrain.departTime);
        const diffInSeconds = Math.floor((targetTime - now) / 1000);

        setTimeLeft(diffInSeconds);
        setTotalSeconds(diffInSeconds > 3600 ? diffInSeconds : 3600);
      } else {
        setError('막차 운행 정보가 없습니다.');
        setTimeLeft(3600);
      }
    } catch (err) {
      console.error('막차 정보 조회 실패:', err);
      setError('막차 정보를 불러오지 못했습니다.');

      // API 실패 시 기본 시간 설정
      setTimeLeft(2850);
      setLastTrainInfo({ departTime: '23:45:00', destination: '성수' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastTrain();
  }, []);

  // 2. 1초마다 카운트다운
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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

  // 게이지 끝 노브(Knob) 좌표
  const angle = (1 - progress) * 360 - 90;
  const knobX = center + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = center + radius * Math.sin((angle * Math.PI) / 180);

  // 시:분 / 초 포맷팅 (경과 시 +01:30 형태)
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
        막차 시간을 계산 중입니다...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 1. 원형 타이머 SVG */}
      <div className="relative flex items-center justify-center">
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
            className={`transition-all duration-1000 ease-linear ${
              isWarning ? 'stroke-[#FF2B2B]' : 'stroke-green-15'
            }`}
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
          {/* 타이머 숫자 (+01:30 or 47:30) */}
          <span
            className={`text-5xl font-extrabold tracking-wider mb-2 ${
              isExpired ? 'text-[#FF2B2B]' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </span>

          {/* 상태 문구 */}
          <span
            className={`text-base font-bold whitespace-pre-line ${
              isWarning ? 'text-[#FF2B2B]' : 'text-green-15'
            }`}
          >
            {isExpired
              ? '골든 타임\n경과'
              : isWarning
                ? '막차 임박!'
                : '골든 타임'}
          </span>

          {/* 출발 시간 */}
          {lastTrainInfo && !isExpired && (
            <span className="text-xs text-gray-400 mt-1">
              PM {lastTrainInfo.departTime.slice(0, 5)} 출발
            </span>
          )}
        </div>
      </div>

      {/* 2. 막차 종료 시 피그마 하단: [다른 방법 보기] 버튼 */}

      <div className="w-full flex items-center justify-between px-2 mt-4">
        <span className="text-xs text-gray-400 font-medium">
          막차 카운트다운이 끝났습니다
        </span>
        <button
          type="button"
          onClick={onOtherWaysClick}
          className="px-4 py-2 bg-[#FF2B2B]/20 text-[#FF2B2B] hover:bg-[#FF2B2B]/30 font-bold text-xs rounded-full border border-[#FF2B2B]/40 transition cursor-pointer"
        >
          다른 방법 보기
        </button>
      </div>
    </div>
  );
}
