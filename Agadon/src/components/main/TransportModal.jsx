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

const formatFare = (fare) =>
  fare == null ? '요금 정보 없음' : `${Number(fare).toLocaleString('ko-KR')}원`;

const RouteSection = ({ label, route }) => {
  if (!route) {
    return (
      <div className="py-3">
        <span className="text-[11px] text-gray-400 font-medium">{label}</span>
        <p className="mt-2 text-sm text-gray-300">
          현재 이용 가능한 {label} 경로가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] text-gray-400 font-medium">{label}</span>
          <div className="text-[22px] font-bold leading-tight mt-0.5">
            약 {route.totalMinutes}분
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {formatFare(route.fare)}
            {route.departureDeadline && (
              <>
                <span className="mx-1 opacity-50">|</span>
                현위치 출발 {formatClock(route.departureDeadline)}
              </>
            )}
          </div>
        </div>
        <span className="px-2 py-1 bg-[#666B74] text-white text-[10px] rounded-full">
          {route.type}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold">{route.name}</p>
        <p className="text-[11px] leading-relaxed text-gray-300 mt-1">
          {route.guide}
        </p>
        {route.scheduledAt && (
          <p className="text-[11px] text-[#64F0AD] mt-2">
            탑승 예정 {formatClock(route.scheduledAt)}
          </p>
        )}
      </div>
    </div>
  );
};

export default function TransportModal({ onClose, routes, currentTimeMs }) {
  const taxi = routes.find((route) => route.type === 'TAXI') || null;
  const nextNightBus =
    routes
      .filter((route) => route.type === 'NBUS')
      .filter(
        (route) =>
          !route.departureDeadline ||
          new Date(route.departureDeadline).getTime() >= currentTimeMs
      )
      .sort(
        (a, b) =>
          new Date(a.departureDeadline || 0).getTime() -
          new Date(b.departureDeadline || 0).getTime()
      )[0] || null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] flex flex-col justify-end items-center pb-[100px] px-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] bg-[#42454C] rounded-[16px] px-5 py-3 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-bold">심야 이동 방법</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-300 cursor-pointer"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <RouteSection label="택시" route={taxi} />
        <div className="w-full h-px bg-gray-600/50" />
        <RouteSection label="N버스" route={nextNightBus} />
      </div>
    </div>
  );
}
