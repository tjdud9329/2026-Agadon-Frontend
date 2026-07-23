import { useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';

const KakaoMap = ({ destination }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const currentCoordsRef = useRef(null);  // 추가

  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao) return;

    kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          currentCoordsRef.current = coords;  // 저장
          const current = new kakao.maps.LatLng(coords.latitude, coords.longitude);
          const map = new kakao.maps.Map(mapRef.current, { center: current, level: 4 });
          mapInstance.current = map;
          startMarkerRef.current = new kakao.maps.Marker({ map, position: current, title: '현재 위치' });
        },
        () => {
          const center = new kakao.maps.LatLng(37.5571, 126.9237);
          const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });
          mapInstance.current = map;
          startMarkerRef.current = new kakao.maps.Marker({ map, position: center, title: '현재 위치' });
        }
      );
    });
  }, []);

  useEffect(() => {
    if (!destination || !mapInstance.current || !currentCoordsRef.current) return;

    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(destination, async (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;

      const destLat = parseFloat(result[0].y);
      const destLng = parseFloat(result[0].x);

      const { longitude, latitude  } = currentCoordsRef.current;  // 저장된 좌표 사용

      try {
        const response = await axiosInstance.post('/api/directions', {
          origin: `${longitude},${latitude}`,
          destination: `${destLng},${destLat}`,
        });

        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        if (polylineRef.current) polylineRef.current.setMap(null);

        endMarkerRef.current = new kakao.maps.Marker({
          map: mapInstance.current,
          position: new kakao.maps.LatLng(destLat, destLng),
          title: '목적지',
        });

        const route = response.data.routes[0];
        const path = [];

        route.sections.forEach((section) => {
          section.roads.forEach((road) => {
            const vertexes = road.vertexes;
            for (let i = 0; i < vertexes.length; i += 2) {
              path.push(new kakao.maps.LatLng(vertexes[i + 1], vertexes[i]));
            }
          });
        });

        polylineRef.current = new kakao.maps.Polyline({
          map: mapInstance.current,
          path,
          strokeWeight: 6,
          strokeColor: '#3A7AFE',
          strokeOpacity: 0.9,
          strokeStyle: 'solid',
        });

        const bounds = new kakao.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        mapInstance.current.setBounds(bounds);
      } catch (err) {
        console.error('길찾기 API 오류', err);
      }
    });
  }, [destination]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default KakaoMap;