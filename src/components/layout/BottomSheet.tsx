'use client';

import React, { useState } from 'react';
import {
  Navigation2,
  Share2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Zap,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { HotSpot } from '@/types/spot';

interface BottomSheetProps {
  selectedSpot?: HotSpot | null;
  onPinSuccess?: () => void;
}

/**
 * 하단 바텀시트 컴포넌트
 * - AMOLED Black 카드 스타일 및 Zero-Typing 원터치 내비게이션
 * - 기획서 3.5: 네이버 지도, 카카오맵, 티맵 URL Scheme 원클릭 연동
 * - 기획서 3.4: '복귀 성공 핀' 크라우드소싱 등록 트리거
 */
export default function BottomSheet({ selectedSpot, onPinSuccess }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 기본 프리셋 스팟 (사용자가 맵에서 선택하지 않았을 때의 추천 1순위 탈출 스팟)
  const spot: HotSpot = selectedSpot || {
    id: 'spot-balios-escape-1',
    spotName: '1번 국도 병점 중심상가 방면 합류점',
    category: 'ESCAPE_SAFETY_LINE',
    lat: 37.2065,
    lng: 127.0345,
    geohash: 'wydm6',
    targetHours: '23-02',
    escapeAxis: 'ROUTE_1',
    callScore: 92,
    isCrowdsourced: false,
    tipDescription: '발리오스CC 퇴근 후 병점 축선으로 이동 시 복귀 콜 수신율 3.4배 상승',
  };

  // 원터치 딥링크 실행 함수 (기획서 3.5 구현)
  const openDeepLink = (app: 'naver' | 'kakao' | 'tmap') => {
    const lat = spot.lat;
    const lng = spot.lng;
    const name = encodeURIComponent(spot.spotName);

    let url = '';
    switch (app) {
      case 'naver':
        // 네이버 지도 앱 도보 길찾기 스킴
        url = `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${name}&appname=CallNavi`;
        break;
      case 'kakao':
        // 카카오맵 대중교통 길찾기 스킴
        url = `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;
        break;
      case 'tmap':
        // 티맵 차량 경로안내 스킴
        url = `tmap://route?goalname=${name}&goallat=${lat}&goallng=${lng}`;
        break;
    }

    // 딥링크 호출 (앱 미설치 시 웹 브라우저 폴백 처리 가능)
    window.location.href = url;
  };

  return (
    <section
      className={`w-full bg-zinc-950 border-t border-zinc-800 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.8)] z-30 transition-all duration-300 flex flex-col shrink-0 select-none ${
        isExpanded ? 'max-h-[75vh]' : 'max-h-[320px]'
      }`}
    >
      {/* 바텀시트 드래그/토글 핸들 바 */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-label="바텀시트 펼치기/접기"
        className="w-full py-2.5 flex flex-col items-center justify-center hover:bg-zinc-900/50 active:bg-zinc-900 transition-colors rounded-t-2xl"
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full" />
      </button>

      {/* 바텀시트 본문 컨텐츠 */}
      <div className="px-4 pb-3 flex flex-col gap-3 overflow-y-auto">
        {/* 헤더: 추천 뱃지 & 점수 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-400" />
              AI 최단 탈출 추천
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-semibold">
              {spot.escapeAxis === 'ROUTE_1' ? '1번 국도 축선' : '39번 국도 축선'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-zinc-400 font-medium">콜 확률</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {spot.callScore}%
            </span>
          </div>
        </div>

        {/* 스팟 명칭 및 설명 */}
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{spot.spotName}</span>
          </h2>
          {spot.tipDescription && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {spot.tipDescription}
            </p>
          )}
        </div>

        {/* Zero-Typing 원터치 딥링크 내비게이션 버튼 3종 (기획서 3.5) */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            원터치 내비 딥링크 (Zero-Typing)
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. 네이버 지도 (도보) */}
            <button
              type="button"
              onClick={() => openDeepLink('naver')}
              className="h-11 bg-zinc-900 border border-zinc-700/80 hover:border-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#03C75A]" />
              네이버지도
            </button>

            {/* 2. 카카오맵 (대중교통) */}
            <button
              type="button"
              onClick={() => openDeepLink('kakao')}
              className="h-11 bg-zinc-900 border border-zinc-700/80 hover:border-amber-500 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#FEE500]" />
              카카오맵
            </button>

            {/* 3. 티맵 (차량) */}
            <button
              type="button"
              onClick={() => openDeepLink('tmap')}
              className="h-11 bg-zinc-900 border border-zinc-700/80 hover:border-blue-500 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#E61E2B]" />
              티맵(차량)
            </button>
          </div>
        </div>

        {/* 유저 크라우드소싱: '복귀 성공 핀' 등록 버튼 (기획서 3.4) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onPinSuccess}
            className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs active:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            여기서 복귀 콜 성공! (성공 핀 공유)
          </button>
        </div>
      </div>
    </section>
  );
}
