'use client';

import React, { useState } from 'react';
import { Crosshair, Bus, Layers, AlertCircle, Compass } from 'lucide-react';

interface MapContainerProps {
  onRecenter?: () => void;
  onToggleBusRadar?: (active: boolean) => void;
}

/**
 * 메인 맵 영역 컴포넌트
 * - 화면 중앙의 메인 영역을 채우는 반응형 지도 컨테이너
 * - 추후 카카오맵 Web JS SDK 연동용 DOM 엘리먼트(#kakao-map)
 * - AMOLED Black 다크 테마 시각화 및 플로팅 컨트롤
 * - 서울/강남 방면(빨강), 수원/병점/오산 방면(파랑) 폴리라인 범례 오버레이
 */
export default function MapContainer({ onRecenter, onToggleBusRadar }: MapContainerProps) {
  const [busRadarActive, setBusRadarActive] = useState<boolean>(true);
  const [activeEscapeLine, setActiveEscapeLine] = useState<'ROUTE_1' | 'ROUTE_39' | 'ALL'>('ALL');

  const handleToggleBus = () => {
    const nextState = !busRadarActive;
    setBusRadarActive(nextState);
    if (onToggleBusRadar) onToggleBusRadar(nextState);
  };

  return (
    <section className="flex-1 w-full relative bg-black overflow-hidden flex flex-col justify-between">
      {/* 실제 카카오맵이 주입될 지도 DOM 컨테이너 */}
      <div id="kakao-map" className="absolute inset-0 w-full h-full bg-[#0a0a0a]">
        {/* 카카오맵 SDK 로드 전 다크 그리드 & 레이더 백그라운드 프리뷰 */}
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* 심야 레이더 펄스 시각화 효과 */}
          <div className="relative flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-emerald-500/20 animate-ping duration-1000" />
            <div className="w-48 h-48 rounded-full border border-emerald-500/30 absolute" />
            <div className="w-24 h-24 rounded-full border border-emerald-500/40 absolute" />
            <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_12px_#10b981] absolute flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
            
            {/* 현재 기사 위치 레이블 */}
            <div className="absolute mt-10 px-2 py-0.5 bg-black/80 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono">
              내 위치 (발리오스CC)
            </div>
          </div>
        </div>
      </div>

      {/* 상단 오버레이: 심야 버스 & 탈출선 범례 (기획서 3.3 반영) */}
      <div className="relative z-10 p-3 flex flex-col gap-2 pointer-events-none">
        <div className="self-start flex flex-wrap gap-1.5 pointer-events-auto">
          {/* 서울/강남 방면 폴리라인 범례 */}
          <div className="flex items-center gap-1.5 bg-black/85 border border-zinc-800 px-2 py-1 rounded-md text-[11px] text-zinc-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
            <span className="font-semibold text-rose-300">서울/강남 방면</span>
          </div>

          {/* 수원/병점/오산 방면 폴리라인 범례 */}
          <div className="flex items-center gap-1.5 bg-black/85 border border-zinc-800 px-2 py-1 rounded-md text-[11px] text-zinc-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
            <span className="font-semibold text-blue-300">1번 국도 (수원·병점)</span>
          </div>
        </div>
      </div>

      {/* 우측 플로팅 컨트롤 버튼 (야간 장갑 착용 고려한 큼직한 터치 영역) */}
      <div className="absolute right-3 top-16 z-20 flex flex-col gap-2.5">
        {/* 현위치 재탐색 버튼 */}
        <button
          type="button"
          onClick={onRecenter}
          aria-label="내 위치로 중심 이동"
          className="w-11 h-11 bg-black/90 text-white rounded-xl border border-zinc-800 shadow-xl flex items-center justify-center active:scale-90 active:bg-zinc-800 transition-all hover:border-zinc-700"
        >
          <Crosshair className="w-5 h-5 text-emerald-400" />
        </button>

        {/* 심야 버스 레이더 토글 버튼 */}
        <button
          type="button"
          onClick={handleToggleBus}
          aria-label="심야 버스 레이더 켜기/끄기"
          className={`w-11 h-11 rounded-xl border shadow-xl flex items-center justify-center active:scale-90 transition-all ${
            busRadarActive
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
              : 'bg-black/90 border-zinc-800 text-zinc-500'
          }`}
        >
          <Bus className="w-5 h-5" />
        </button>

        {/* 탈출 노선 필터 버튼 */}
        <button
          type="button"
          onClick={() => setActiveEscapeLine(prev => (prev === 'ALL' ? 'ROUTE_1' : prev === 'ROUTE_1' ? 'ROUTE_39' : 'ALL'))}
          aria-label="탈출 안전선 변경"
          className="w-11 h-11 bg-black/90 text-white rounded-xl border border-zinc-800 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-all hover:border-zinc-700"
        >
          <Layers className="w-4 h-4 text-zinc-300" />
          <span className="text-[9px] font-bold text-zinc-400 leading-none mt-0.5">
            {activeEscapeLine === 'ALL' ? '전체' : activeEscapeLine === 'ROUTE_1' ? '1번선' : '39번'}
          </span>
        </button>
      </div>

      {/* 하단 지도 오버레이 팁 메시지 */}
      <div className="relative z-10 px-3 pb-2 pointer-events-none">
        <div className="self-center bg-black/85 border border-zinc-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] text-zinc-300 pointer-events-auto">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>현재 시각: 덕우리 저수지·구장사거리 2차 뒤풀이 콜 집중 구간</span>
        </div>
      </div>
    </section>
  );
}
