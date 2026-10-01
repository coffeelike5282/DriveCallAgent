'use client';

import React from 'react';
import { Navigation, Radio, Shield, User } from 'lucide-react';
import { MembershipTier } from '@/types/user';

interface TopHeaderProps {
  currentLocationName?: string;
  membershipTier?: MembershipTier;
  gpsActive?: boolean;
}

/**
 * 상단 헤더 컴포넌트
 * - AMOLED Black(#000000) 배경 및 고대비(High Contrast)
 * - GPS 연결 상태 표시 (초록색 펄스)
 * - 현재 위치 텍스트
 * - 피크타임 안내 및 멤버십 뱃지 (FREE / DAY / PRO)
 */
export default function TopHeader({
  currentLocationName = '화성 향남 · 발리오스CC 인근',
  membershipTier = 'FREE',
  gpsActive = true,
}: TopHeaderProps) {
  return (
    <header className="w-full bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 z-30 flex flex-col gap-1.5 shrink-0 select-none">
      {/* 1행: 서비스 로고 & GPS 상태 & 프로필/멤버십 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Navigation className="w-4 h-4 transform rotate-45 fill-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              콜나비
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                AI 가이드
              </span>
            </span>
          </div>
        </div>

        {/* 멤버십 뱃지 & 유저 프로필 버튼 */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              membershipTier === 'PRO'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : membershipTier === 'DAY_PASS'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {membershipTier}
          </span>
          <button
            type="button"
            aria-label="내 계정 프로필"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95 transition-transform"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2행: 현 위치 정보 및 실시간 상태 바 */}
      <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-900 text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          {/* GPS 상태 인디케이터 */}
          <span className="relative flex h-2 w-2 shrink-0">
            {gpsActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                gpsActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="font-medium text-zinc-200 truncate">{currentLocationName}</span>
        </div>

        {/* 심야 상태 인디케이터 */}
        <div className="flex items-center gap-1 shrink-0 text-[11px] text-emerald-400 font-semibold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>심야 피크 가이드 ON</span>
        </div>
      </div>
    </header>
  );
}
