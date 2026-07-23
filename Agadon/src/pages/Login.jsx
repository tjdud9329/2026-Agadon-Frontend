import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import red_alarm from '../assets/red_alarm.svg';
import api from '../api/axiosInstance';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 빈칸 방지
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 백엔드 쪽으로 형식 맞춰서 전송
      const response = await api.post('/api/v1/auth/login', {
        email: email,
        password: password,
      });

      console.log('로그인 성공:', response.data);

      // accessToken 저장하기
      const token =
        response.data.accessToken || response.data.data?.accessToken;

      if (token) {
        // 로컬스토리지 저장
        localStorage.setItem('accessToken', token);
        localStorage.setItem('isLoggedIn', 'true');

        // 내 정보 조회
        try {
          const meResponse = await api.get('/api/v1/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('로그인 직후 내 정보 응답:', meResponse.data);
        } catch (meError) {
          console.error('내 정보 가져오기 실패:', meError);
        }

        // 콜백 함수 실행
        if (typeof onLoginSuccess === 'function') {
          await onLoginSuccess(token);
        }
      }

      alert('로그인 성공!');
      navigate('/menu');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(
        error.response?.data?.message ||
          '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
      setPassword(''); // 틀렸을 때 비밀번호 칸만 비우기
    }
  };

  return (
    <div className="min-h-screen text-txt flex flex-col justify-center items-center px-4 py-12 gap-5 bg-bg">
      {/* 상단 로고 및 타이틀 */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-red-05">
          와우막차
        </h2>
      </div>
      <div>
        <img src={red_alarm} />
      </div>

      {/* 로그인 폼 카드 */}
      <div className="w-full max-w-md p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요."
                className="w-full p-5 rounded-[20px] border border-gray-40 text-txt placeholder-gray-40 focus:outline-none focus:border-red-06 focus:ring-1 focus:ring-red-10 transition"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요."
                className="w-full p-5 rounded-[20px] border border-gray-40 text-txt placeholder-gray-40 focus:outline-none focus:border-red-05 focus:ring-1 focus:ring-red-10 transition"
              />
            </div>
          </div>

          {/* 로그인 버튼 (onClick 제거하여 중복 제출 방지) */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-[20px]  mt-10 bg-red-10 hover:bg-primary-10 text-white font-bold transition duration-200 active:scale-[0.99] cursor-pointer"
          >
            로그인
          </button>
        </form>

        {/* 회원가입 페이지 이동 링크 */}
        <div className="mt-30 flex items-center justify-center gap-1.5 text-xs">
          <span className="text-gray-40">아직 계정이 없으신가요?</span>
          <Link
            to="/SignUp"
            className="text-red-10 font-semibold hover:underline cursor-pointer"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
