import { useState, useEffect } from 'react';

const useCurrentLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // 1. 브라우저에서 GPS 좌표 받기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });

        // 2. 좌표 → 주소 변환 (카카오 역지오코딩)
        const kakao = window.kakao;
        kakao.maps.load(() => {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(longitude, latitude, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              setAddress(result[0].address.address_name);
            }
          });
        });
      },
      (err) => {
        console.log('위치 권한 거부:', err.message);
      }
    );
  }, []);

  return { location, address };
};

export default useCurrentLocation;
