// utils/calcWalkingTime.js
const HONGDAE_STATION = { lat: 37.5571, lng: 126.9237 };

export const calcWalkingTime = (address) => {
  return new Promise((resolve, reject) => {
    const kakao = window.kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        reject('주소 검색 실패');
        return;
      }

      const destLat = parseFloat(result[0].y);
      const destLng = parseFloat(result[0].x);

      const polyline = new kakao.maps.Polyline({
        path: [
          new kakao.maps.LatLng(HONGDAE_STATION.lat, HONGDAE_STATION.lng),
          new kakao.maps.LatLng(destLat, destLng),
        ],
      });

      const distanceM = polyline.getLength();
      const walkingMin = Math.ceil(distanceM / 80);

      resolve({
        minutes: walkingMin,
        meters: distanceM,
        destCoords: { lat: destLat, lng: destLng },
      });
    });
  });
};