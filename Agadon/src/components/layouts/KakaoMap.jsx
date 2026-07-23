import { useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';

// 🚨 홍익대학교 정문 고정 좌표 상수 (위도, 경도)
const HONGIK_LAT = 37.5515;
const HONGIK_LNG = 126.9254;

const KakaoMap = ({ destination, origin, onWalkingTime, onCoordsChange }) => {
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

    ps.keywordSearch(destination, async (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;

      const destLat = parseFloat(result[0].y);
      const destLng = parseFloat(result[0].x);

      // 출발지 좌표 (Menu에서 넘어온 origin이 있으면 사용, 없으면 홍익대 고정)
      const originCoords = origin || `${HONGIK_LNG},${HONGIK_LAT}`;

      if (onCoordsChange) {
        onCoordsChange({
          origin: originCoords,
          destination: `${destLng},${destLat}`,
        });
      }

      try {
        const response = await axiosInstance.post('/api/directions', {
          origin: originCoords,
          destination: `${destLng},${destLat}`,
        });

        // 기존 마커 및 선 지우기
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        if (polylineRef.current) polylineRef.current.setMap(null);

        // 도착지 마커 표시
        endMarkerRef.current = new kakao.maps.Marker({
          map: mapInstance.current,
          position: new kakao.maps.LatLng(destLat, destLng),
          title: '목적지',
        });

        const route = response.data.routes[0];
        const path = [];

        // 경로 좌표 파싱
        route.sections.forEach((section) => {
          section.roads.forEach((road) => {
            const vertexes = road.vertexes;
            for (let i = 0; i < vertexes.length; i += 2) {
              path.push(new kakao.maps.LatLng(vertexes[i + 1], vertexes[i]));
            }
          });
        });

        // 경로 선 그리기
        polylineRef.current = new kakao.maps.Polyline({
          map: mapInstance.current,
          path,
          strokeWeight: 6,
          strokeColor: '#3A7AFE',
          strokeOpacity: 0.9,
          strokeStyle: 'solid',
        });

        // 출발지~목적지 경로 전체가 지도에 보이도록 바운드 조절
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(new kakao.maps.LatLng(HONGIK_LAT, HONGIK_LNG));
        path.forEach((point) => bounds.extend(point));
        mapInstance.current.setBounds(bounds);
      } catch (err) {
        console.error('길찾기 API 오류', err);
      }
    });
  }, [destination, origin, onCoordsChange]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default KakaoMap;
