import React, { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
}

/**
 * AMOLED Black 전용 모바일 최적화 컨테이너
 * - 데스크톱 및 태블릿 브라우저에서는 중앙 max-w-md 뷰포트 지원
 * - 모바일 브라우저 주소창 고려 h-[100dvh] 전체화면
 * - 순수 블랙(#000000) 배경 및 고대비 텍스트
 */
export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="w-full h-[100dvh] bg-black flex justify-center items-center overflow-hidden">
      <main className="w-full max-w-md h-full bg-black text-white flex flex-col relative overflow-hidden shadow-2xl border-x border-zinc-900">
        {children}
      </main>
    </div>
  );
}
