import { useState } from 'react';
import Navbar from '../components/layouts/Navbar';
import useCurrentLocation from '../hooks/useCurrentLocation';
import uil_exchange from '../assets/uil_exchange.svg';

/* ── 지하철 호선 색상 ── */
const LINE_COLORS = {
  1: '#0052A4',
  2: '#00A84D',
  3: '#EF7C1C',
  4: '#00A5DE',
  5: '#996CAC',
  6: '#CD7C2F',
  7: '#747F00',
  8: '#E6186C',
  9: '#BDB092',
};

const BUS_COLORS = {
  간선: '#3363AC',
  지선: '#5DB730',
};

/* ── 목 데이터 (TODO: API 연동) ── */
const MOCK_ROUTES = [
  {
    id: 1,
    type: '지하철&버스',
    icon: 'bus',
    duration: '52 분',
    timeRange: '오후 11:56~오전 12:49',
    price: '1,750원',
    steps: [
      { kind: 'subway', line: '6', station: '상수역', lineName: '3호선' },
      { kind: 'subway', line: '3', station: '약수역', lineName: '3호선' },
      { kind: 'busStop', stop: '압구정역4번출구', busId: '23105' },
      {
        kind: 'busInfo',
        buses: [
          { type: '간선', number: '463' },
          { type: '지선', number: '4211' },
        ],
      },
      { kind: 'end', name: '총지사' },
    ],
  },
  {
    id: 2,
    type: '지하철&버스',
    icon: 'bus',
    duration: '1 시간  02 분',
    timeRange: '오후 11:53~오전 12:55',
    price: '1,750원',
    steps: [
      { kind: 'subway', line: '6', station: '상수역', lineName: '3호선' },
      { kind: 'subway', line: '2', station: '합정역', lineName: '2호선' },
      { kind: 'busStop', stop: '역삼역6번출구', busId: '23282' },
      {
        kind: 'busInfo',
        buses: [{ type: '간선', number: '147, 463' }],
      },
      { kind: 'end', name: '영동중앙교회' },
    ],
  },
  {
    id: 3,
    type: 'N버스',
    icon: 'bus',
    duration: '1 시간  49 분',
    timeRange: '오전 1:56~3:46',
    price: '2,500원',
    steps: [
      { kind: 'busStop', stop: '동교동삼거리', busId: '14061' },
      {
        kind: 'busInfo',
        buses: [{ type: '간선', number: 'N75(심야)' }],
      },
      { kind: 'end', name: '강남역9번출구' },
    ],
  },
  {
    id: 4,
    type: '택시',
    icon: 'taxi',
    duration: '45 분',
    timeRange: '',
    price: '',
    extra: '17.9km  카드 약 19,900원',
    steps: [],
  },
];

/* ── 호선 뱃지 ── */
const LineBadge = ({ line }) => (
  <span
    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shrink-0"
    style={{ backgroundColor: LINE_COLORS[line] || '#888' }}
  >
    {line}
  </span>
);

/* ── 버스 종류 뱃지 ── */
const BusTypeBadge = ({ type, number }) => (
  <span
    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
    style={{ backgroundColor: BUS_COLORS[type] || '#888' }}
  >
    {type}
  </span>
);

/* ── 교통 아이콘 ── */
const TransportIcon = ({ type }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    className="text-gray-400 shrink-0"
  >
    {type === 'taxi' ? (
      <>
        <path
          d="M19 9.5h-1.28l-.32-1A3 3 0 0014.56 6H9.44a3 3 0 00-2.84 2.5l-.32 1H5a2 2 0 00-2 2v4a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-4a2 2 0 00-2-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <rect
          x="4"
          y="3"
          width="16"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 21l2-4h4l2 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="13" r="1" fill="currentColor" />
        <circle cx="16" cy="13" r="1" fill="currentColor" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
      </>
    )}
  </svg>
);

/* ── 경로 스텝 ── */
const RouteSteps = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="mt-3 ml-1 space-y-1.5 border-l-2 border-gray-600 pl-4">
      {steps.map((step, i) => {
        switch (step.kind) {
          case 'subway':
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <LineBadge line={step.line} />
                <span className="text-white">{step.station}</span>
                <span className="text-gray-400 text-xs">{step.lineName}</span>
              </div>
            );
          case 'busStop':
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-white font-medium">{step.stop}</span>
                <span className="text-gray-400 text-xs">{step.busId}</span>
              </div>
            );
          case 'busInfo':
            return (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                {step.buses.map((bus, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <BusTypeBadge type={bus.type} />
                    <span className="text-white text-xs">{bus.number}</span>
                  </div>
                ))}
              </div>
            );
          case 'end':
            return (
              <p key={i} className="text-sm text-gray-300">
                {step.name}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

/* ── 경로 카드 ── */
const RouteCard = ({ route }) => (
  <div className="bg-[#2A2A2E] rounded-2xl p-5">
    {/* 헤더: 교통 타입 + 아이콘 */}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{route.type}</p>
        <p className="text-2xl font-bold text-white mt-1">{route.duration}</p>
        {route.timeRange && (
          <p className="text-xs text-gray-400 mt-1">
            {route.timeRange}
            {route.price && <span className="ml-2">{route.price}</span>}
          </p>
        )}
        {route.extra && (
          <p className="text-xs text-gray-400 mt-1">{route.extra}</p>
        )}
      </div>
      <TransportIcon type={route.icon} />
    </div>

    {/* 경로 상세 */}
    <RouteSteps steps={route.steps} />
  </div>
);

/* ── 메인 페이지 ── */
const MyTransportation = () => {
  const { address: currentAddr } = useCurrentLocation();
  const [destination] = useState();

  return (
    <div className="min-h-screen text-white flex flex-col pb-24">
      {/* 상단 헤더 */}
      <div className="w-full bg-green-15 p-10 text-black font-semibold flex flex-col shadow-lg">
        {/* 앱 타이틀 */}

        <div className="flex w-full">
          <div className="flex flex-col gap-2.5 flex-1 mr-3 text-white">
            {/* 현위치 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm">
              <span className="shrink-0 font-bold">현위치:</span>
              <span className="truncate">
                {currentAddr || '서울 마포구 상수동 309-18'}
              </span>
            </div>

            {/* 도착지 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm">
              <span className="shrink-0 font-bold">도착지:</span>
              <span className="truncate text-xs">
                {destination || (
                  <span className="text-white/70">
                    도착지를 입력해주세요 (예: 강남역)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 우측 아이콘 */}
          <div className="flex flex-col items-center justify-between gap-3">
            <button type="button" className="p-1">
              <img src={uil_exchange} alt="전환" />
            </button>
            <button type="button" className="text-yellow-400 text-xl">
              ★
            </button>
          </div>
        </div>
      </div>

      {/* 경로 목록 */}
      <div className="flex flex-col gap-4 p-4 mt-2">
        {MOCK_ROUTES.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>

      {/* 하단 네비게이션 */}
      <Navbar />
    </div>
  );
};

export default MyTransportation;
