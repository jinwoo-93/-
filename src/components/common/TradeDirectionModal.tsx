'use client';

import { useEffect, useState } from 'react';

export type TradeDirection = 'CN_TO_KR' | 'KR_TO_CN';

// localStorage: 선택한 방향 저장 (세션 간 유지)
const DIRECTION_KEY = 'jikguyeokgu_trade_direction';
// sessionStorage: 이번 세션에 팝업을 이미 봤는지 여부
const SESSION_SHOWN_KEY = 'jikguyeokgu_popup_shown';

interface TradeDirectionModalProps {
  onSelect: (direction: TradeDirection) => void;
  isOpen?: boolean;          // 외부에서 강제로 열기
  onClose?: () => void;      // 외부에서 닫힐 때 콜백
}

export function TradeDirectionModal({ onSelect, isOpen, onClose }: TradeDirectionModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // isOpen prop이 true로 바뀌면 강제로 열기
    if (isOpen) {
      setVisible(true);
      return;
    }

    // 첫 마운트: sessionStorage에 없으면 팝업 표시
    // (브라우저 탭/창 닫고 다시 열면 sessionStorage가 초기화됨)
    const alreadyShown = sessionStorage.getItem(SESSION_SHOWN_KEY);
    if (!alreadyShown) {
      setVisible(true);
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleSelect = (direction: TradeDirection) => {
    // 선택한 방향은 localStorage에 저장 (재방문 시에도 기억)
    localStorage.setItem(DIRECTION_KEY, direction);
    // 이번 세션에 팝업 봤다고 표시
    sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    setVisible(false);
    onClose?.();
    onSelect(direction);
  };

  const handleClose = () => {
    // 닫기 시에도 세션에 표시 (이번 세션엔 다시 안뜸)
    sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    setVisible(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-sm mx-4">
        {/* 헤더 */}
        <div className="px-8 pt-10 pb-6 text-center">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">
            JIKGUYEOKGU
          </p>
          <h2 className="text-[22px] font-black text-black leading-tight mb-2">
            어떤 서비스를<br />이용하시겠어요?
          </h2>
          <p className="text-[13px] text-gray-400">
            您想使用哪种服务？
          </p>
        </div>

        {/* 선택 버튼 */}
        <div className="px-6 pb-8 space-y-3">
          {/* 직구 */}
          <button
            onClick={() => handleSelect('CN_TO_KR')}
            className="w-full group border border-gray-200 hover:border-black transition-all duration-150 p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px]">🇨🇳</span>
                  <span className="text-[11px]">→</span>
                  <span className="text-[18px]">🇰🇷</span>
                </div>
                <p className="text-[16px] font-black text-black">직구</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  중국 상품을 한국에서 구매
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  中国商品韩国购买
                </p>
              </div>
              <div className="w-8 h-8 border border-gray-200 group-hover:border-black group-hover:bg-black transition-all duration-150 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* 역직구 */}
          <button
            onClick={() => handleSelect('KR_TO_CN')}
            className="w-full group border border-gray-200 hover:border-black transition-all duration-150 p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px]">🇰🇷</span>
                  <span className="text-[11px]">→</span>
                  <span className="text-[18px]">🇨🇳</span>
                </div>
                <p className="text-[16px] font-black text-black">역직구</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  한국 상품을 중국에서 구매
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  韩国商品中国购买
                </p>
              </div>
              <div className="w-8 h-8 border border-gray-200 group-hover:border-black group-hover:bg-black transition-all duration-150 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* 닫기 (이전 선택 유지) */}
          <button
            onClick={handleClose}
            className="w-full text-[12px] text-gray-400 hover:text-black transition-colors py-2 underline underline-offset-2"
          >
            둘 다 볼게요 · 全部查看
          </button>
        </div>
      </div>
    </div>
  );
}

// 방향 저장/조회 유틸
export function getSavedDirection(): TradeDirection | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DIRECTION_KEY) as TradeDirection | null;
}

export function setSavedDirection(direction: TradeDirection) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DIRECTION_KEY, direction);
}
