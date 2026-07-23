import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const Layout = () => {
  return (
    <>
      <div className="pt-20 bg-bg text-white min-h-screen">
        <Outlet />
      </div>
      <Navbar />
    </>
  );
};
