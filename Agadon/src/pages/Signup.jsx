import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import red_alarm from '../assets/red_alarm.svg'; // 👈 import 추가!
import api from '../api/axiosInstance';

export default function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 조건 체크 후 오류 점검 State
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const navigate = useNavigate();

  // 이름 입력
  const handleNameChange = (e) => {
    const currentName = e.target.value;
    setName(currentName);

    if (!currentName) {
      setNameError('닉네임을 입력해주세요.');
    } else {
      setNameError('');
    }
  };

  // 이메일 입력
  const handleEmailChange = (e) => {
    const currentEmail = e.target.value;
    setEmail(currentEmail);

    if (!currentEmail) {
      setEmailError('이메일을 입력해주세요.');
    } else {
      setEmailError('');
    }
  };

  // 비밀번호 입력
  const handlePasswordChange = (e) => {
    const currentPassword = e.target.value;
    setPassword(currentPassword);

    if (confirmPassword.length > 0 && currentPassword !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // 비밀번호 확인 입력
  const handleConfirmPasswordChange = (e) => {
    const currentConfirmPassword = e.target.value;
    setConfirmPassword(currentConfirmPassword);

    if (
      currentConfirmPassword.length > 0 &&
      currentConfirmPassword !== password
    ) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await api.post('api/v1/auth/signup', {
        email: email,
        password: password,
        nickname: name,
      });

      console.log('회원가입 성공:', response.data);
      alert('회원가입이 완료되었습니다!');
      if (onSignupSuccess) onSignupSuccess();
      navigate('/Login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert(
        error.response?.data?.message ||
          '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
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
        <img src={red_alarm} alt="알람 로고" />
      </div>

      {/* 회원가입 폼 카드 */}
      <div className="w-full max-w-md p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* 이름 / 닉네임 입력 */}
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="닉네임을 입력하세요."
                className="w-full p-5 rounded-[20px] border border-gray-40 text-txt placeholder-gray-40 focus:outline-none focus:border-red-06 focus:ring-1 focus:ring-red-10 transition"
              />
            </div>

            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
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
                onChange={handlePasswordChange}
                placeholder="비밀번호를 입력하세요."
                className="w-full p-5 rounded-[20px] border border-gray-40 text-txt placeholder-gray-40 focus:outline-none focus:border-red-05 focus:ring-1 focus:ring-red-10 transition"
              />
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="비밀번호를 다시 입력하세요."
                className="w-full p-5 rounded-[20px] border border-gray-40 text-txt placeholder-gray-40 focus:outline-none focus:border-red-05 focus:ring-1 focus:ring-red-10 transition"
              />
              {confirmPasswordError && (
                <p className="text-red-05 text-xs mt-2 pl-2">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </div>

          {/* 가입하기 버튼 */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-[20px] mt-10 bg-red-10 hover:bg-primary-10 text-white font-bold transition duration-200 active:scale-[0.99] cursor-pointer"
          >
            가입하기
          </button>
        </form>

        {/* 로그인 페이지 이동 링크 */}
        <div className="mt-12 flex items-center justify-center gap-1.5 text-xs">
          <span className="text-gray-40">이미 계정이 있으신가요?</span>
          <Link
            to="/Login"
            className="text-red-10 font-semibold hover:underline cursor-pointer"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
