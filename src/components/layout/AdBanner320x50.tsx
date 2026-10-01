'use client';

import React from 'react';
import { MembershipTier } from '@/types/user';
import { ShieldCheck } from 'lucide-react';

interface AdBanner320x50Props {
  membershipTier?: MembershipTier;
}

/**
 * 320x50 하단 고정 배너 광고 영역
 * - 기획서 6장 비즈니스 모델 반영
 * - FREE 회원 대상 320x50 광고 인벤토리 (카카오 AdFit / Google AdSense) 노출
 * - DAY_PASS 또는 PRO 회원은 광고가 자동 제거되며 프로 뱃지로 대체
 * - AMOLED Black(#000000) 배경 및 SafeArea 처리
 */
export default function AdBanner320x50({ membershipTier = 'FREE' }: AdBanner320x50Props) {
  // 유료 회원은 광고 완전 제거
  if (membershipTier === 'DAY_PASS' || membershipTier === 'PRO') {
    return (
      <footer className="w-full bg-black border-t border-zinc-900 py-1.5 px-4 flex items-center justify-between z-40 shrink-0 text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{membershipTier} 패스 적용 중 (광고 없음)</span>
        </span>
        <span className="text-zinc-600">CallNavi Pro</span>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-black border-t border-zinc-900 flex flex-col items-center justify-center z-40 shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
      {/* 정확한 320x50 광고 컨테이너 규격 */}
      <div className="w-[320px] h-[50px] bg-zinc-950 border border-zinc-800 flex items-center justify-between px-3 text-zinc-400 relative overflow-hidden select-none">
        {/* 광고 스폰서 마크 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            [광고] 심야 대리 전문 운전자 보험
          </span>
          <span className="text-xs text-white font-semibold">
            사고 걱정 끝! 일 800원으로 든든하게
          </span>
        </div>

        {/* Ad 배크그라운드 태그 */}
        <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
          AD
        </span>
      </div>
    </footer>
  );
}
