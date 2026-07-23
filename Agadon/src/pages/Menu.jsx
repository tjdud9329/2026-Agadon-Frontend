import { useState } from 'react';
import Navbar from '../components/layouts/Navbar';
import KakaoMap from '../components/layouts/KakaoMap';
import useCurrentLocation from '../hooks/useCurrentLocation';
import CircularTimer from '../components/main/CircularTimer';
import uil_exchange from '../assets/uil_exchange.svg';

const Menu = () => {
  const { address: currentAddr } = useCurrentLocation();

  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);

  const handleSearch = () => {
    if (!destination.trim()) return;
    setSearchedDestination(destination);
  };

  return (
    <div className="min-h-screen text-white flex flex-col pt-0 pb-24 relative overflow-x-hidden gap-4">
      <div className="w-full top-0 bg-green-15 p-10 text-black font-semibold flex flex-col items-center justify-between shadow-lg  ">
        <div className="flex">
          <div className="flex flex-col gap-2.5 flex-1 mr-3 text-white">
            {/* 현위치 표시 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
              <span className=" shrink-0 font-bold">현위치:</span>
              <span className="truncate">
                {currentAddr || '서울 마포구 상수동 309-18'}
              </span>
            </div>

            {/* 도착지 입력창 */}
            <div className="flex items-center gap-2 text-xs bg-white/20 px-7 py-2 rounded-sm text-white">
              <span className=" shrink-0 font-bold">도착지:</span>
              <input
                type="text"
                placeholder="서울 강남구 역삼동 790-4"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent border-none outline-none w-full text-black placeholder-white text-xs"
              />
            </div>
          </div>

          {/* 우측 상하 전환 & 옵션 아이콘 */}
          <div className="flex flex-col items-center justify-between gap-3 text-black/70">
            <button
              type="button"
              onClick={handleSearch}
              className="p-1 hover:text-black transition"
              title="검색"
            >
              <img src={uil_exchange} />
            </button>
            <button
              type="button"
              className="p-1 text-white transition"
              title="더보기"
            >
              ⋮
            </button>
          </div>
        </div>
      </div>

      {/* 3. 타이머 안내 문구 */}
      <p className="text-center text-[12px] text-gray-400 mb-2">
        타이머는 30분, 15분, 5분 전, 정각에 울립니다
      </p>

      {/* 4. 원형 타이머 메인 영역 */}
      <div className="flex justify-center items-center my-2">
        <CircularTimer />
      </div>

      {/* 5. 나의 경로 섹션 */}
      <div className="mt-6 flex flex-col gap-3 m-4">
        <h3 className="text-base font-bold text-white px-1">나의 경로</h3>

        {/* 카카오 맵 컨테이너 */}
        <div className="w-full h-[220px] bg-[#00E676] rounded-[24px] overflow-hidden shadow-inner flex items-center justify-center relative ">
          <KakaoMap
            destination={searchedDestination}
            onWalkingTime={(min, m) => setWalkInfo({ minutes: min, meters: m })}
          />

          {/* 지도 정보 안내 오버레이 (정보가 있을 경우만 표시) */}
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

      {/* 6. 하단 플로팅 네비게이션 바 */}
      <Navbar />
    </div>
  );
};

export default Menu;
