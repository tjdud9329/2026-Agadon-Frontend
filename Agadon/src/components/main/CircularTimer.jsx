import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance'; // 설정해두신 axios 인스턴스

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(null); // 남은 초
  const [totalSeconds, setTotalSeconds] = useState(3600); // 전체 게이지 기준 (기본 1시간)
  const [lastTrainInfo, setLastTrainInfo] = useState(null); // 막차 정보
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. API 호출 및 남은 시간(초) 계산 함수
  const fetchLastTrain = async () => {
    try {
      setLoading(true);
      setError('');

      // 📌 파라미터 값 설정 (예: 홍대입구 '0239', 평일 1, 상행 1)
      const response = await api.get('/api/metro/last-train', {
        params: {
          station: '0239', // 역 외부코드
          weekTag: 1, // 1: 평일, 2: 토요일, 3: 일요일/공휴일
          inoutTag: 1, // 1: 상행/내선, 2: 하행/외선
        },
      });

      const data = response.data;
      console.log('막차 조회 응답:', data);

      if (data && data.lastTrains && data.lastTrains.length > 0) {
        // 첫 번째 막차 정보 추출
        const targetTrain = data.lastTrains[0];
        setLastTrainInfo({
          stationName: data.stationName, //역 이름
          line: data.line, //호선
          departTime: targetTrain.departTime, // 도착시간
          destination: targetTrain.destination, //목적지
        });

        // ⏱️ 남은 초 계산 로직
        const now = new Date();
        const [hours, minutes, seconds = 0] = targetTrain.departTime
          .split(':')
          .map(Number);

        const targetTime = new Date();
        targetTime.setHours(hours, minutes, seconds, 0);

        // 막차 시간이 새벽(00시, 01시 등)인데 현재 시각이 밤(23시 등)이면 다음날 새벽으로 설정
        if (hours < 5 && now.getHours() >= 12) {
          targetTime.setDate(targetTime.getDate() + 1);
        }

        const diffInSeconds = Math.floor((targetTime - now) / 1000);

        if (diffInSeconds > 0) {
          setTimeLeft(diffInSeconds);
          // 전체 게이지 기준값 설정 (막차가 1시간 이상 남았으면 그 값으로, 아니면 1시간 기준)
          setTotalSeconds(diffInSeconds > 3600 ? diffInSeconds : 3600);
        } else {
          setTimeLeft(0); // 이미 막차가 지난 경우
        }
      } else {
        setError('막차 운행 정보가 없습니다.');
      }
    } catch (err) {
      console.error('막차 정보 조회 실패:', err);
      setError('막차 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastTrain();
  }, []);

  // 2. 1초마다 타이머 카운트다운
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // SVG 원 및 게이지 설정
  const size = 300;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;

  // 타이머 진행률 및 20분(1200초) 이하 경고 조건
  const progress = timeLeft && totalSeconds ? timeLeft / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;
  const isWarning = timeLeft !== null && timeLeft <= 1200;

  // 게이지 끝 노브(Knob) 좌표 계산
  const angle = (1 - progress) * 360 - 90;
  const knobX = center + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = center + radius * Math.sin((angle * Math.PI) / 180);

  // 시:분:초 포맷팅
  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-txt flex items-center justify-center">
        막차 시간을 계산 중입니다...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-txt flex flex-col justify-center items-center px-4 py-8">
      {/* 1. 동그란 원형 타이머 UI */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* 배경 트랙 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-gray-60/40"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 프로그래스 트랙 (Tailwind 커스텀 색상 클래스 적용) */}
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
              isWarning ? 'stroke-red-05' : 'stroke-green-15'
            }`}
          />
        </svg>

        {/* 게이지 끝 노브(Dot) */}
        {timeLeft > 0 && (
          <div
            className="absolute w-5 h-5 bg-gray-20 rounded-full shadow-md transition-all duration-1000 ease-linear"
            style={{
              left: `${knobX}px`,
              top: `${knobY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* 원 중앙 정보 */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {/* 남은 시간 */}
          <span className="text-5xl font-extrabold text-white tracking-wider mb-2">
            {formatTime(timeLeft)}
          </span>

          {/* 상태 문구 (20분 미만 시 변경) */}
          <span
            className={`text-base font-bold transition-colors ${
              isWarning ? 'text-red-05' : 'text-green-15'
            }`}
          >
            {isWarning ? '막차 임박!' : '골든 타임'}
          </span>

          {/* API로 받아온 출발 시각 (예: PM 11:45) */}
          {lastTrainInfo && (
            <span
              className={`text-sm font-medium mt-1 transition-colors ${
                isWarning ? 'text-red-05/80' : 'text-green-15/80'
              }`}
            >
              {lastTrainInfo.departTime.slice(0, 5)} 출발 (
              {lastTrainInfo.destination}행)
            </span>
          )}
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && <p className="text-red-05 text-sm mt-4">{error}</p>}

      {/* 새로고침 버튼 */}
      <button
        type="button"
        onClick={fetchLastTrain}
        className="mt-8 px-6 py-3 rounded-[20px] bg-gray-60/30 text-white font-medium hover:bg-gray-60/50 transition cursor-pointer"
      >
        막차 시간 다시 조회
      </button>
    </div>
  );
}
