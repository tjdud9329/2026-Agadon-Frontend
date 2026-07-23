import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const Layout = () => {
  return (
    <>
      <div className="bg-bg text-white min-h-screen">
        <Outlet />
      </div>
      <Navbar />
    </>
  );
};
