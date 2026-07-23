
function SuccessGauge({ percent = 88 }) {
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const startAngle = 135;
  const totalArc = 270;
  const filledArc = (percent / 100) * totalArc;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPoint = (angle) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const bgStart = arcPoint(startAngle);
  const bgEnd = arcPoint(startAngle + totalArc);
  const filledEnd = arcPoint(startAngle + filledArc);

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;
  const filledPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${filledArc > 180 ? 1 : 0} 1 ${filledEnd.x} ${filledEnd.y}`;

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={bgPath}
          fill="none"
          stroke="#3F3F46"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
        </defs>
        <path
          d={filledPath}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-sm text-gray-400 font-medium">막차 성공률</span>
        <span className="text-[44px] font-extrabold leading-tight text-green-400">
          {percent}%
        </span>
      </div>
    </div>
  );
}

// --- Weekly Bar Chart ---
function WeeklyBars() {
  const data = [
    { h: "h-[10px]", day: "월" },
    { h: "h-[24px]", day: "화" },
    { h: "h-[16px]", day: "수" },
    { h: "h-[12px]", day: "목" },
    { h: "h-[22px]", day: "금" },
    { h: "h-[18px]", day: "토" },
    { h: "h-[44px]", day: "일", active: true },
  ];

  return (
    <div className="flex items-end justify-center gap-1.5 mt-4">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`w-7 rounded ${item.h} ${
              item.active ? "bg-green-400" : "bg-zinc-700"
            }`}
          />
          <span className="text-[10px] text-gray-500">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

// --- History Item ---
function HistoryItem({ date, icon, label, route, amount, saved }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-800/30 last:border-b-0">
      <span className="text-gray-400 text-sm font-semibold min-w-[36px]">
        {date}
      </span>
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-500">({route})</div>
      </div>
      <span
        className={`text-sm font-bold whitespace-nowrap px-2.5 py-1 rounded-md ${
          saved
            ? "text-green-400 bg-green-400/10"
            : "text-red-400 bg-red-400/10"
        }`}
      >
        ₩{amount.toLocaleString()} {saved ? "절약" : "소비"}
      </span>
    </div>
  );
}

// --- Bottom Nav ---
function BottomNav() {
  const items = [
    {
      id: "alarm",
      label: "막차",
      icon: (c) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path d="M12 6v6l4 2" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
          <path d="M5 3L2 6M22 6l-3-3" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "home",
      label: "홈",
      icon: (c) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path
            d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z"
            stroke={c} strokeWidth="2" strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "transit",
      label: "교통",
      icon: (c) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="14" rx="2" stroke={c} strokeWidth="2" />
          <circle cx="8" cy="20" r="1.5" stroke={c} strokeWidth="1.5" />
          <circle cx="16" cy="20" r="1.5" stroke={c} strokeWidth="1.5" />
          <line x1="4" y1="12" x2="20" y2="12" stroke={c} strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "my",
      label: "마이",
      active: true,
      icon: (c) => (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex justify-around items-center pt-2.5 pb-5 bg-[#1A1A1E] border-t border-zinc-700">
      {items.map((item) => {
        const color = item.active ? "#EF4444" : "#6B7280";
        return (
          <button
            key={item.id}
            className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer px-3 py-1"
          >
            {item.icon(color)}
            <span
              className={`text-[11px] ${
                item.active ? "text-red-500 font-bold" : "text-gray-500 font-medium"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- Main Page ---
export default function MyPage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen text-gray-100 font-sans max-w-[440px] mx-auto flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-5 pt-3 text-sm font-semibold text-white">
        <span>9:41</span>
        <div className="flex gap-1.5 items-center">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <rect x="0" y="6" width="3" height="6" rx="1" />
            <rect x="4.5" y="4" width="3" height="8" rx="1" />
            <rect x="9" y="1.5" width="3" height="10.5" rx="1" />
            <rect x="13" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <path d="M8 3C10.7 3 13 4.3 14.5 6.5L8 12 1.5 6.5C3 4.3 5.3 3 8 3z" />
          </svg>
          <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
            <rect x="0.5" y="0.5" width="18" height="11" rx="2" stroke="white" />
            <rect x="2" y="2" width="14" height="8" rx="1" fill="white" />
            <rect x="19.5" y="3.5" width="2" height="5" rx="1" fill="white" />
          </svg>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-[22px] font-extrabold px-5 pt-4 pb-3">마이페이지</h1>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {/* Profile Card */}
        <div className="bg-[#1A1A1E] rounded-2xl p-4 flex items-center gap-3.5 border border-[#2A2A2E]">
          <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
            <svg width="24" height="24" fill="#9CA3AF" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-bold">2호선막차헌터</span>
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                와우산 날다람쥐
              </span>
            </div>
            <span className="text-[13px] text-green-400 font-medium mt-0.5 block">
              Lv2. 눈치코치 프로귀가러
            </span>
          </div>
        </div>

        {/* 나의 막차력 */}
        <div className="bg-[#1A1A1E] rounded-2xl p-5 border border-[#2A2A2E]">
          <h2 className="text-base font-bold mb-3">나의 막차력</h2>

          <SuccessGauge percent={88} />

          {/* Stats Row */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-gray-400">지각 횟수</span>
              <span className="text-[15px] font-extrabold text-red-500">3회</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🏆</span>
              <span className="text-[13px] text-gray-400">강남구 상위</span>
              <span className="text-[15px] font-extrabold text-green-400">10%</span>
            </div>
          </div>

          <WeeklyBars />

          {/* Saved Fare */}
          <div className="flex items-baseline justify-center gap-2 mt-5">
            <span className="text-xs text-gray-500">이번달 절약한 택시비</span>
            <span className="text-[22px] font-extrabold text-white">
              약 78,000원
            </span>
          </div>
        </div>

        {/* 내 주소 & 즐겨찾는 경로 */}
        <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E] space-y-3.5">
          <div className="flex items-start gap-3.5">
            <span className="text-xl mt-0.5">📍</span>
            <div>
              <div className="text-sm font-bold">내 주소</div>
              <div className="text-[13px] text-gray-400 mt-0.5">
                서울 강남구 역삼동 790-4
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <span className="text-xl mt-0.5">⭐</span>
            <div>
              <div className="text-sm font-bold">즐겨찾는 경로</div>
              <div className="text-[13px] text-gray-400 mt-0.5">
                홍익대 T동→강남역 2번출구
              </div>
            </div>
          </div>
        </div>

        {/* 막차 히스토리 */}
        <div className="bg-[#1A1A1E] rounded-2xl px-4 pt-4 pb-2 border border-[#2A2A2E]">
          <h2 className="text-base font-bold mb-1">막차 히스토리</h2>
          <HistoryItem
            date="7/23"
            icon="🚌"
            label="탑승 성공"
            route="홍익대 T동→강남역"
            amount={38000}
            saved
          />
          <HistoryItem
            date="7/15"
            icon="🚐"
            label="N-Bus 이용"
            route="홍대 조선시대→강남역"
            amount={35000}
            saved
          />
          <HistoryItem
            date="7/10"
            icon="🚕"
            label="택시 이용"
            route="홍대입구역→강남역"
            amount={35000}
            saved={false}
          />
        </div>

        {/* Bottom Spacer */}
        <div className="h-2" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}