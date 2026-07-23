import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '');

const axiosInstance = axios.create({
  baseURL: BASE_URL, //백엔드 API 주소 입력
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 처리 (로그인 페이지 이동 등)
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
