import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[83px] bg-red-05 flex items-center justify-around pt-14px z-50 max-w-[390px] left-1/2 -translate-x-1/2 px-[16px]">
      <div className="flex flex items-center text-center h-[42px]">
        <div></div>
      </div>
    </nav>
  );
};

export default Navbar;
