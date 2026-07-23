import React, { useState } from 'react';

export default function SignupPage({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    homeAddress: '',
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.agreeTerms) {
      alert('이용약관에 동의해 주세요.');
      return;
    }

    console.log('회원가입 데이터:', formData);
    if (onSignupSuccess) onSignupSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4 py-12">
      {/* 상단 타이틀 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 text-2xl mb-2 border border-amber-500/20">
          ⏱️
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          막차타이머 회원가입
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          계정을 만들고 나만의 막차 골든타임을 설정하세요
        </p>
      </div>

      {/* 회원가입 폼 카드 */}
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-700/50">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 이름 / 닉네임 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              이름 또는 닉네임
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* 학교 이메일 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              이메일 주소
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="gildong@g.hongik.ac.kr"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* 자주 가는 집 주소 (서비스 특화 필드) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                기본 도착지 (집 주소)
              </label>
              <span className="text-[10px] text-amber-400">선택입력</span>
            </div>
            <input
              type="text"
              name="homeAddress"
              value={formData.homeAddress}
              onChange={handleChange}
              placeholder="예: 서울 마포구 와우산로 94"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="8자 이상 입력"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 다시 입력"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          {/* 약관 동의 */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-amber-400 focus:ring-offset-slate-800"
              />
              <span className="text-xs text-slate-300">
                [필수] 서비스 이용약관 및 개인정보 처리방침 동의
              </span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition duration-200 shadow-lg shadow-amber-500/10 active:scale-[0.99]"
          >
            가입하기
          </button>
        </form>

        {/* 로그인 페이지 전환 링크 */}
        <p className="mt-6 text-center text-xs text-slate-400">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-amber-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            로그인하기
          </button>
        </p>
      </div>
    </div>
  );
}
