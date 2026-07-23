import { useEffect, useRef } from 'react';

// 홍대입구역 좌표 (고정)
const HONGDAE_STATION = { lat: 37.5571, lng: 126.9237 };

const KakaoMap = ({ destination, onWalkingTime }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao) return;

    kakao.maps.load(() => {
      const options = {
        center: new kakao.maps.LatLng(HONGDAE_STATION.lat, HONGDAE_STATION.lng),
        level: 5,
      };
      const map = new kakao.maps.Map(mapRef.current, options);
      mapInstance.current = map;

      new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(HONGDAE_STATION.lat, HONGDAE_STATION.lng),
        title: '홍대입구역',
      });
    });
  }, []);

  useEffect(() => {
    if (!destination || !mapInstance.current) return;
    const kakao = window.kakao;

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(destination, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;

      const destLat = parseFloat(result[0].y);
      const destLng = parseFloat(result[0].x);
      const coords = new kakao.maps.LatLng(destLat, destLng);

      // 집 마커
      new kakao.maps.Marker({
        map: mapInstance.current,
        position: coords,
        title: '집',
      });

      // 지도 범위 조정
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(new kakao.maps.LatLng(HONGDAE_STATION.lat, HONGDAE_STATION.lng));
      bounds.extend(coords);
      mapInstance.current.setBounds(bounds);

      // 도보 시간 계산
      const polyline = new kakao.maps.Polyline({
        path: [
          new kakao.maps.LatLng(HONGDAE_STATION.lat, HONGDAE_STATION.lng),
          coords,
        ],
      });
      const distanceM = polyline.getLength();
      const walkingMin = Math.ceil(distanceM / 80);

      // 부모 컴포넌트에 전달
      if (onWalkingTime) {
        onWalkingTime(walkingMin, distanceM);
      }
    });
  }, [destination, onWalkingTime]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default KakaoMap;