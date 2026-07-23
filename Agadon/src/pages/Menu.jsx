import { useState } from 'react';
import Navbar from '../components/layouts/Navbar';
import KakaoMap from '../components/layouts/KakaoMap';
import useCurrentLocation from '../hooks/useCurrentLocation';
import { calcWalkingTime } from '../hooks/calcWalkingTime';

const Menu = () => {
  const { address: currentAddr } = useCurrentLocation();

  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);

  const handleSearch = async () => {
    if (!destination.trim()) return;
    setSearchedDestination(destination);
    const result = await calcWalkingTime(destination);
    setWalkInfo(result);
  };

  return (
    <div>
      {/* 상단 */}
      <header>
        <div>
          <div>현위치</div>
          <div>{currentAddr || '위치 불러오는 중...'}</div>
        </div>

        <div>
          <input
            type="text"
            placeholder="도착지를 입력하세요"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <button className="hover" onClick={handleSearch}>검색</button>
        </div>
      </header>

      {/* 지도 */}
      <section>
        <KakaoMap destination={searchedDestination} />
      </section>

      {/* 하단 네비 */}
      <Navbar />
    </div>
  );
};

export default Menu;
