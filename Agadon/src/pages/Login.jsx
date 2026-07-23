import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // 로그인 처리 로직 (API 호출)
    console.log('로그인 시도:', { email, password });
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4 py-12">
      {/* 서비스 상단 로고 및 타이틀 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 text-3xl mb-3 border border-amber-500/20">
          ⏱️
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          막차타이머
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          홍대에서 집까지, 골든타임을 놓치지 마세요
        </p>
      </div>

      {/* 로그인 폼 카드 */}
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-700/50">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              이메일 주소
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gildong@g.hongik.ac.kr"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                비밀번호
              </label>
              <a
                href="#reset"
                className="text-xs text-amber-400 hover:underline"
              >
                비밀번호 재설정
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition duration-200 shadow-lg shadow-amber-500/10 active:scale-[0.99]"
          >
            로그인하기
          </button>
        </form>

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-3 text-slate-400">
              간편 로그인
            </span>
          </div>
        </div>

        {/* 소셜 / 학교 계정 버튼 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => alert('카카오 로그인 연동')}
            className="w-full py-3 px-4 rounded-xl bg-[#FEE500] hover:bg-[#fdd800] text-[#191919] font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <span className="font-extrabold text-xs">💬</span> 카카오로 시작하기
          </button>
        </div>

        {/* 회원가입 안내 */}
        <p className="mt-6 text-center text-xs text-slate-400">
          아직 계정이 없으신가요?{' '}
          <a
            href="#signup"
            className="text-amber-400 font-semibold hover:underline"
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
