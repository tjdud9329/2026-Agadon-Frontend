import React from 'react';
import { useNavigate } from 'react-router-dom';
import red_alarm from '../assets/red_alarm.svg';

export default function Start() {
  const navigate = useNavigate();

  const handleStart = () => {
    // 시작하기 클릭 시 로그인 페이지(또는 메인 페이지)로 이동
    navigate('/Login');
  };

  return (
    <div className="min-h-screen bg-bg text-txt flex flex-col justify-between items-center px-6 py-16">
      {/* 1. 상단 여백 보정용 빈 공간 */}
      <div />

      {/* 2. 중앙 타이틀 & 로고 이미지 */}
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-05">
          와우막차
        </h1>
        <img src={red_alarm} alt="알람 로고" className="w-20 h-20" />
      </div>

      {/* 3. 하단 시작하기 버튼 */}
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 rounded-[20px] bg-red-10 hover:bg-primary-10 text-white text-lg font-bold transition duration-200 active:scale-[0.99] cursor-pointer"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
