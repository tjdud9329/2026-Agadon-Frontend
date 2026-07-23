import { useEffect, useRef } from 'react';

// 🚨 홍익대학교 정문 고정 좌표 상수 (위도, 경도)
const HONGIK_LAT = 37.5515;
const HONGIK_LNG = 126.9254;

const KakaoMap = ({ destination, origin, onCoordsChange, onError }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // 1. 지도 초기화 (홍익대학교 중심으로 고정)
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao) return;

    kakao.maps.load(() => {
      // GPS 수신 대신 홍익대학교 좌표 사용
      const center = new kakao.maps.LatLng(HONGIK_LAT, HONGIK_LNG);

      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });
      mapInstance.current = map;

      // 출발지(홍익대학교) 마커 표시
      startMarkerRef.current = new kakao.maps.Marker({
        map,
        position: center,
        title: '홍익대학교 (출발지)',
      });
    });
  }, []);

  // 2. 목적지 검색 및 경로 표시
  useEffect(() => {
    if (!destination || !mapInstance.current) return;

    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(destination, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || !result[0]) {
        onError?.('검색한 목적지의 좌표를 찾지 못했습니다.');
        return;
      }

      const place = result[0];
      const destLat = parseFloat(place.y);
      const destLng = parseFloat(place.x);

      // 출발지 좌표 (Menu에서 넘어온 origin이 있으면 사용, 없으면 홍익대 고정)
      const originCoords = origin || `${HONGIK_LNG},${HONGIK_LAT}`;

      if (onCoordsChange) {
        onCoordsChange({
          origin: originCoords,
          destination: `${destLng},${destLat}`,
          destinationName: place.place_name || destination,
          destinationAddress:
            place.road_address_name || place.address_name || destination,
          latitude: destLat,
          longitude: destLng,
        });
      }

      // 지도 표시를 위해 카카오 길찾기 API를 중복 호출하지 않는다.
      // 실제 교통 경로와 택시 정보는 Trip API 응답을 사용한다.
      if (endMarkerRef.current) endMarkerRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);

      const startPosition = new kakao.maps.LatLng(HONGIK_LAT, HONGIK_LNG);
      const destinationPosition = new kakao.maps.LatLng(destLat, destLng);

      endMarkerRef.current = new kakao.maps.Marker({
        map: mapInstance.current,
        position: destinationPosition,
        title: '목적지',
      });

      polylineRef.current = new kakao.maps.Polyline({
        map: mapInstance.current,
        path: [startPosition, destinationPosition],
        strokeWeight: 4,
        strokeColor: '#3A7AFE',
        strokeOpacity: 0.65,
        strokeStyle: 'shortdash',
      });

      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(startPosition);
      bounds.extend(destinationPosition);
      mapInstance.current.setBounds(bounds);
    });
  }, [destination, origin, onCoordsChange, onError]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default KakaoMap;
