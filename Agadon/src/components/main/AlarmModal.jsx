import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 와우막차 알람 모달
 *
 * @param {boolean}  isOpen           모달 표시 여부
 * @param {Function} onClose          알람 해제 시 콜백
 * @param {string}   goldenTime       골든타임 표시 문자열 (예: "PM 11:36")
 * @param {number}   initialSeconds   남은 시간 (초). 기본 1800 (30분)
 * @param {number}   firstTrainMin    첫차까지 남은 분 (0:00 도달 시 표시용)
 */
const AlarmModal = ({
  isOpen,
  onClose,
  goldenTime = 'PM 11:36',
  initialSeconds = 1800,
  firstTrainMin = 263,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [dragX, setDragX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const maxDrag = useRef(0);
  const dragXRef = useRef(0);
  const sliderRef = useRef(null);

  /* ── 카운트다운 ── */
  useEffect(() => {
    if (!isOpen) return undefined;
    const id = setInterval(
      () =>
        setSeconds((currentSeconds) => {
          if (currentSeconds <= 1) {
            clearInterval(id);
            return 0;
          }
          return currentSeconds - 1;
        }),
      1000
    );
    return () => clearInterval(id);
  }, [isOpen]);

  /* ── 단계 판별 ── */
  const getStage = useCallback(() => {
    if (seconds > 15 * 60) {
      return {
        msg: '지금 일어나면 우아하게\n걸어갈 수 있는 골든타임',
        emoji: '🚶‍♀️',
        urgent: false,
      };
    }
    if (seconds > 5 * 60) {
      return {
        msg: '이제 경보 속도로\n걸어야 할 수 있습니다',
        emoji: '🏃‍♂️🏃‍♀️',
        urgent: false,
      };
    }
    if (seconds > 0) {
      return {
        msg: '뛰어!!! 뛰어!!!\n숨 쉬지 말고 뛰어!!!',
        emoji: '😱',
        urgent: true,
      };
    }
    const h = Math.floor(firstTrainMin / 60);
    const m = firstTrainMin % 60;
    return {
      msg: `첫차까지 ${h}시간 ${m}분\n남음...`,
      emoji: '😎',
      urgent: true,
    };
  }, [seconds, firstTrainMin]);

  const stage = getStage();
  const { urgent } = stage;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  /* ── 슬라이더 드래그 ── */
  const THUMB = 52;

  const calcMax = () => {
    if (!sliderRef.current) return 250;
    return sliderRef.current.offsetWidth - THUMB - 12;
  };

  const onStart = useCallback((clientX) => {
    isDragging.current = true;
    startX.current = clientX;
    maxDrag.current = calcMax();
    setTransitioning(false);
  }, []);

  const onMove = useCallback((clientX) => {
    if (!isDragging.current) return;
    const diff = clientX - startX.current;
    const clamped = Math.max(0, Math.min(diff, maxDrag.current));
    dragXRef.current = clamped;
    setDragX(clamped);
  }, []);

  const onEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragXRef.current > maxDrag.current * 0.65) {
      onClose?.();
    }
    setTransitioning(true);
    dragXRef.current = 0;
    setDragX(0);
  }, [onClose]);

  /* 전역 이벤트 */
  useEffect(() => {
    const handleMouseMove = (e) => onMove(e.clientX);
    const handleMouseUp = () => onEnd();
    const handleTouchMove = (e) => onMove(e.touches[0].clientX);
    const handleTouchEnd = () => onEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMove, onEnd]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-6"
      onClick={onClose}
    >
      <div
        className={`
          flex w-full max-w-[390px] flex-col items-center
          rounded-[28px] border-[3px] bg-black
          px-6 pb-7 pt-9
          ${urgent ? 'border-[#FF3B30]' : 'border-[#34C759]'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <p className="m-0 self-start text-[15px] font-semibold text-white">
          와우막차 🍺
        </p>

        {/* 골든타임 */}
        <p className="mt-7 text-[13px] font-bold text-[#FF6B6B]">골든 타임</p>
        <p className="mt-0.5 text-[13px] font-bold text-[#FF6B6B]">
          {goldenTime}
        </p>

        {/* 카운트다운 */}
        <p
          className={`
            my-3 text-[88px] font-bold tracking-tighter
            tabular-nums
            ${urgent ? 'text-[#FF3B30]' : 'text-white'}
          `}
        >
          {mm}:{ss}
        </p>

        {/* 메시지 */}
        <div className="mb-9 flex items-center gap-2.5 px-3">
          <span className="whitespace-pre-line text-right text-[13px] leading-relaxed text-white">
            {stage.msg}
          </span>
          <span className="shrink-0 text-4xl">{stage.emoji}</span>
        </div>

        {/* 밀어서 알람해제 */}
        <div
          ref={sliderRef}
          className="relative flex h-[58px] w-full select-none items-center rounded-full bg-white/10 px-1 touch-pan-y"
        >
          <div
            className="z-[2] flex h-[52px] w-[52px] shrink-0 cursor-grab items-center justify-center rounded-full bg-[rgba(100,30,30,0.85)] active:cursor-grabbing"
            style={{
              transform: `translateX(${dragX}px)`,
              transition: transitioning ? 'transform 0.3s ease' : 'none',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onStart(e.clientX);
            }}
            onTouchStart={(e) => onStart(e.touches[0].clientX)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill="#fff"
              />
              <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-white/45">
            밀어서 알람해제
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlarmModal;
