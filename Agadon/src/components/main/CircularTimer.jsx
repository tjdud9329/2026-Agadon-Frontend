const formatDuration = (seconds) => {
  if (seconds == null) return '--:--';

  const absolute = Math.abs(Math.trunc(seconds));
  const hours = Math.floor(absolute / 3600);
  const minutes = Math.floor((absolute % 3600) / 60);
  const restSeconds = absolute % 60;
  const clock =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;

  return seconds < 0 ? `+${clock}` : clock;
};

const formatClock = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export default function CircularTimer({
  loading,
  timer,
  remainingSeconds,
  timerState,
  route,
  onOtherWaysClick,
}) {
  const isExpired = timerState === 'EXPIRED';
  const isUnavailable = timerState === 'UNAVAILABLE';
  const isWarning =
    isExpired || (remainingSeconds != null && remainingSeconds <= 5 * 60);

  const size = 290;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;
  const initialSeconds = Math.max(
    Math.abs(Number(timer?.remainingSeconds) || 0),
    3600
  );
  const progress =
    remainingSeconds == null || isExpired
      ? 0
      : Math.max(0, Math.min(1, remainingSeconds / initialSeconds));
  const strokeDashoffset = circumference - progress * circumference;
  const angle = progress * 360 - 90;
  const knobX = center + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = center + radius * Math.sin((angle * Math.PI) / 180);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 text-xs">
        막차 경로와 택시비를 계산하고 있습니다...
      </div>
    );
  }

  if (!timer) {
    return (
      <div className="w-[290px] h-[290px] rounded-full border-[10px] border-gray-700/60 flex flex-col items-center justify-center text-center">
        <strong className="text-3xl text-[#00E676]">타이머 시작하기</strong>
        <span className="mt-3 text-xs text-gray-400">
          도착지를 검색해주세요
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative flex items-center justify-center z-10">
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

        {!isUnavailable && (
          <div
            className="absolute w-5 h-5 bg-white rounded-full shadow-md transition-all duration-1000 ease-linear"
            style={{
              left: `${knobX}px`,
              top: `${knobY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        <div className="absolute flex flex-col items-center justify-center text-center max-w-[230px]">
          <span
            className={`text-5xl font-extrabold tracking-wider mb-1 ${
              isWarning ? 'text-[#FF2B2B]' : 'text-white'
            }`}
          >
            {isUnavailable ? '--:--' : formatDuration(remainingSeconds)}
          </span>
          <span
            className={`text-base font-bold whitespace-pre-line ${
              isWarning ? 'text-[#FF2B2B]' : 'text-green-15'
            }`}
          >
            {isUnavailable
              ? '시간 정보 없음'
              : isExpired
                ? '골든 타임\n경과'
                : isWarning
                  ? '막차 임박!'
                  : '골든 타임'}
          </span>

          {!isExpired && !isUnavailable && (
            <div className="flex flex-col items-center mt-2 text-gray-400">
              {route && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-sm mb-1">
                  역·정류장까지 도보 {route.walkMinutes}분
                </span>
              )}
              <span className="text-xs font-semibold text-white">
                {formatClock(timer.goldenTime)}에 출발하세요
              </span>
            </div>
          )}
        </div>
      </div>

      {isExpired && (
        <div className="w-full flex items-center justify-between px-2 mt-4 relative z-50">
          <span className="text-xs text-gray-400 font-medium">
            막차 카운트다운이 끝났습니다
          </span>
          <button
            type="button"
            onClick={onOtherWaysClick}
            className="px-4 py-2 bg-[#FF2B2B]/20 text-[#FF2B2B] font-bold text-xs rounded-full border border-[#FF2B2B]/40 cursor-pointer"
          >
            택시·N버스 보기
          </button>
        </div>
      )}
    </div>
  );
}
