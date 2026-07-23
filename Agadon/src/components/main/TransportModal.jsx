// src/components/main/TransportModal.jsx
import React from 'react';

export default function TransportModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E1E] border border-gray-800 w-full max-w-[340px] rounded-[24px] p-5 shadow-2xl flex flex-col gap-4 text-white">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#FF2B2B]">
            🚨 대체 이동 수단 안내
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          지하철 막차 운행이 종료되었습니다.
          <br />
          이용 가능한 심야 이동 수단을 확인해 보세요.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => alert('심야 N버스 노선으로 연결합니다.')}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-[14px] text-xs font-bold transition flex items-center justify-between px-4 cursor-pointer"
          >
            <span>🚌 심야 버스(N버스) 검색</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => alert('택시 호출 화면으로 연결합니다.')}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-[14px] text-xs font-bold transition flex items-center justify-between px-4 cursor-pointer"
          >
            <span>🚖 심야 택시 호출하기</span>
            <span>→</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-700/40 text-gray-300 rounded-[12px] text-xs font-medium cursor-pointer"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
