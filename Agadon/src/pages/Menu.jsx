import { useState } from 'react';
import KakaoMap from '../components/layouts/KakaoMap';
import useCurrentLocation from '../hooks/useCurrentLocation';


const Menu = () => {
  const { address: currentAddr } = useCurrentLocation();
  const [address, setAddress] = useState('');
  const [searchedAddr, setSearchedAddr] = useState('');
  const [walkInfo, setWalkInfo] = useState(null);

  const handleSearch = () => {
    if (!address.trim()) return;
    setSearchedAddr(address);
  };

  return (
    <div>
      <div>현위치: {currentAddr || '위치 불러오는 중...'}</div>
      <input
        type="text"
        placeholder="도착지를 입력하세요"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>검색</button>


      {walkInfo && (
        <div>
          <p>도보 약 {walkInfo.minutes}분 (직선 {(walkInfo.meters / 1000).toFixed(1)}km)</p>
          <p>막차: {MOCK_LAST_TRAIN.departTime} → {MOCK_LAST_TRAIN.destination}행</p>
        </div>
      )}

      <KakaoMap destination={searchedAddr} onWalkingTime={(min, m) => setWalkInfo({ minutes: min, meters: m })} />
    </div>
  );
};

export default Menu;