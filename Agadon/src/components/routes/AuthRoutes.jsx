import { Navigate, Outlet } from 'react-router-dom';

const hasAccessToken = () => Boolean(localStorage.getItem('accessToken'));

/**
 * 1. 로그인 전용 라우트 (Protected Route)
 * - 로그인 안 한 유저가 접근 시: /Login 으로 이동
 */
export const ProtectedRoute = () => {
  if (!hasAccessToken()) {
    localStorage.removeItem('isLoggedIn');
    return <Navigate to="/Login" replace />;
  }

  return <Outlet />;
};

/**
 * 2. 게스트 전용 라우트 (Public Only Route)
 * - 이미 로그인한 유저가 Start, Login, Signup 접근 시: /Menu 로 이동
 */
export const PublicOnlyRoute = () => {
  if (hasAccessToken()) {
    return <Navigate to="/Menu" replace />;
  }

  localStorage.removeItem('isLoggedIn');
  return <Outlet />;
};
