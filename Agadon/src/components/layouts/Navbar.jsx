import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// 아이콘 assets import
import red_alarm from '../../assets/red_alarm.svg';
import red_home from '../../assets/red_home.svg';
import red_profile from '../../assets/red_profile.svg';
import red_transport from '../../assets/red_transport.svg';
import transport from '../../assets/transport.svg';
import profile from '../../assets/profile.svg';
import home from '../../assets/home.svg';

const Navbar = () => {
  const location = useLocation();

  // 각 탭별로 [비활성화 아이콘, 활성화(red) 아이콘] 매핑
  const navItems = [
    {
      icon: red_alarm,
      activeIcon: red_alarm,
    },
    {
      path: '/Menu',
      label: '홈',
      icon: home,
      activeIcon: red_home,
    },
    {
      path: '/MyTransportation',
      label: '교통',
      icon: transport,
      activeIcon: red_transport,
    },
    {
      path: '/MyPage',
      label: '마이',
      icon: profile,
      activeIcon: red_profile,
    },
  ];

  return (
    /* 바닥에서 떠 있는 둥근 플로팅 바 (상단 390px 컨테이너 중앙 정렬 유지) */
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[358px] h-[68px] z-50">
      <div className="w-full h-full bg-gray-200/80 backdrop-blur-md rounded-[28px] border border-white/20 shadow-[0_-4px_20px_rgba(255,255,255,0.15)] flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.icon}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                isActive ? 'text-red-05 font-bold scale-105' : 'text-gray-40'
              }`}
            >
              {/* 활성화 상태일 때 red_ 아이콘으로 전환 */}
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label || 'nav-icon'}
                className="w-8 h-8 object-contain"
              />
              {/* 텍스트 라벨 */}
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
