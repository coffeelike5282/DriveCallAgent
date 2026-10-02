'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Crosshair, Bus, Layers, AlertCircle, Info } from 'lucide-react';
import { HotSpot } from '@/types/spot';
import { useKakaoMapLoader } from '@/lib/map/useKakaoMapLoader';
import { INITIAL_BUS_ROUTES } from '@/lib/firebase/seedData';
import {
  KakaoMapInstance,
  KakaoCustomOverlay,
  KakaoPolyline,
} from '@/types/kakao';

interface MapContainerProps {
  spots?: HotSpot[];
  selectedSpot?: HotSpot | null;
  onSelectSpot?: (spot: HotSpot) => void;
  currentLocation?: { lat: number; lng: number; name: string };
  onRecenter?: () => void;
  onToggleBusRadar?: (active: boolean) => void;
}

/**
 * 카카오맵 Web JS SDK 연동 메인 맵 컴포넌트
 * - AMOLED Black 야간 다크모드 타일 필터 (.kakao-dark-map)
 * - 내 위치(GPS) 실시간 에메랄드 펄스 마커
 * - Firestore 실시간 황금 콜 스팟 커스텀 마커 (콜 점수 뱃지, 카테고리 컬러)
 * - 서울(빨강), 수원(파랑) 심야 버스 레이더 폴리라인
 * - 장갑 착용 고려한 원터치 플로팅 컨트롤
 */
export default function MapContainer({
  spots = [],
  selectedSpot = null,
  onSelectSpot,
  currentLocation = {
    lat: 37.1512,
    lng: 126.9038,
    name: '발리오스CC 클럽하우스',
  },
  onRecenter,
  onToggleBusRadar,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const myLocationOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const spotOverlaysRef = useRef<Map<string, KakaoCustomOverlay>>(new Map());
  const busPolylinesRef = useRef<KakaoPolyline[]>([]);

  const { isLoaded, error: sdkError } = useKakaoMapLoader();
  const [busRadarActive, setBusRadarActive] = useState<boolean>(true);
  const [activeEscapeLine, setActiveEscapeLine] = useState<'ALL' | 'ROUTE_1' | 'ROUTE_39'>('ALL');

  // 1. 카카오맵 인스턴스 초기화 (Step 2)
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current || !window.kakao?.maps) {
      return;
    }

    const { maps } = window.kakao;
    const center = new maps.LatLng(currentLocation.lat, currentLocation.lng);

    // 모바일 환경에 최적화된 줌 레벨 (level: 6 - 반경 3~5km 한눈에 조망)
    const map = new maps.Map(mapContainerRef.current, {
      center,
      level: 6,
    });

    mapInstanceRef.current = map;

    // 모바일 Flex 컨테이너 레이아웃 안정화 후 지도 크기 재계산
    setTimeout(() => {
      map.relayout();
    }, 150);

    // 리사이즈 시 지도 크기 재계산
    const handleResize = () => map.relayout();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mapInstanceRef.current = null;
    };
  }, [isLoaded, currentLocation.lat, currentLocation.lng]);

  // 2. 내 위치(GPS) 실시간 에메랄드 펄스 마커 (Step 3)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    const { maps } = window.kakao;
    const map = mapInstanceRef.current;
    const position = new maps.LatLng(currentLocation.lat, currentLocation.lng);

    if (!myLocationOverlayRef.current) {
      const pulseContainer = document.createElement('div');
      pulseContainer.className = 'custom-pulse-marker relative flex flex-col items-center select-none pointer-events-none';
      pulseContainer.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 radar-ring absolute"></div>
          <div class="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 absolute"></div>
          <div class="w-4 h-4 bg-emerald-400 rounded-full border-2 border-black shadow-[0_0_14px_#10b981] flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
        </div>
        <div class="mt-1 px-2 py-0.5 bg-black/90 border border-emerald-500/60 rounded text-[10px] text-emerald-300 font-mono whitespace-nowrap shadow-lg">
          📍 ${currentLocation.name}
        </div>
      `;

      const overlay = new maps.CustomOverlay({
        map,
        position,
        content: pulseContainer,
        yAnchor: 0.5,
        zIndex: 100,
      });

      myLocationOverlayRef.current = overlay;
    } else {
      myLocationOverlayRef.current.setPosition(position);
    }
  }, [isLoaded, currentLocation]);

  // 3. Firestore 황금 콜 스팟 커스텀 마커 표출 및 인터랙션 (Step 4 & 5)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    const { maps } = window.kakao;
    const map = mapInstanceRef.current;

    // 기존 스팟 오버레이 초기화
    spotOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    spotOverlaysRef.current.clear();

    spots.forEach((spot) => {
      // 탈출 노선 필터링 적용 (Step 7)
      const matchesFilter =
        activeEscapeLine === 'ALL' ||
        spot.escapeAxis === activeEscapeLine ||
        spot.escapeAxis === 'LOCAL';

      if (!matchesFilter) return;

      const isSelected = selectedSpot?.id === spot.id;
      const position = new maps.LatLng(spot.lat, spot.lng);

      // 카테고리별 테마 컬러
      const categoryColor =
        spot.category === 'ESCAPE_SAFETY_LINE'
          ? '#3b82f6' // 탈출선: 블루
          : spot.category === 'GOLF_CLUB'
          ? '#10b981' // 골프장: 에메랄드
          : spot.category === 'RESTAURANT'
          ? '#f59e0b' // 식당: 오렌지
          : '#a855f7'; // 유흥: 보라

      const markerEl = document.createElement('div');
      markerEl.className = 'custom-overlay-marker cursor-pointer select-none transition-transform duration-200 active:scale-95';
      markerEl.innerHTML = `
        <div class="flex flex-col items-center">
          <!-- 상단 콜 확률 점수 뱃지 -->
          <div style="background-color: ${isSelected ? '#10b981' : '#18181b'}; border-color: ${isSelected ? '#34d399' : categoryColor};" 
               class="px-2 py-0.5 rounded-full border shadow-xl flex items-center gap-1 text-[11px] font-extrabold text-white transition-all ${
                 isSelected ? 'scale-110 ring-2 ring-emerald-400 shadow-[0_0_15px_#10b981]' : ''
               }">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${categoryColor};"></span>
            <span class="font-mono text-emerald-300 font-bold">${spot.callScore}%</span>
            <span class="text-[10px] text-zinc-300 font-normal truncate max-w-[90px]">${spot.spotName}</span>
          </div>
          <!-- 핀 꼬리표 삼각형 -->
          <div class="w-0 h-0 border-x-4 border-x-transparent border-t-4 -mt-[1px]" style="border-t-color: ${isSelected ? '#34d399' : categoryColor};"></div>
        </div>
      `;

      // 터치/클릭 이벤트 (Zero-Typing 연동)
      markerEl.addEventListener('click', () => {
        if (onSelectSpot) {
          onSelectSpot(spot);
        }
        map.panTo(position);
      });

      const overlay = new maps.CustomOverlay({
        map,
        position,
        content: markerEl,
        yAnchor: 1.0,
        zIndex: isSelected ? 80 : 50,
      });

      spotOverlaysRef.current.set(spot.id, overlay);
    });
  }, [isLoaded, spots, selectedSpot, activeEscapeLine, onSelectSpot]);

  // 4. 심야 버스 레이더 폴리라인 렌더링 (Step 6)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    const { maps } = window.kakao;
    const map = mapInstanceRef.current;

    // 기존 폴리라인 제거
    busPolylinesRef.current.forEach((polyline) => polyline.setMap(null));
    busPolylinesRef.current = [];

    if (!busRadarActive) return;

    INITIAL_BUS_ROUTES.forEach((route) => {
      const path = route.polylinePath.map((pt) => new maps.LatLng(pt.lat, pt.lng));

      const polyline = new maps.Polyline({
        map,
        path,
        strokeWeight: 5,
        strokeColor: route.polylineColor,
        strokeOpacity: 0.85,
        strokeStyle: 'solid',
      });

      busPolylinesRef.current.push(polyline);
    });
  }, [isLoaded, busRadarActive]);

  // 플로팅 컨트롤: 현위치 리셋 (Step 7)
  const handleRecenterClick = useCallback(() => {
    if (mapInstanceRef.current && window.kakao?.maps) {
      const { maps } = window.kakao;
      const center = new maps.LatLng(currentLocation.lat, currentLocation.lng);
      mapInstanceRef.current.panTo(center);
    }
    if (onRecenter) onRecenter();
  }, [currentLocation, onRecenter]);

  // 플로팅 컨트롤: 심야 버스 레이더 토글 (Step 7)
  const handleToggleBus = () => {
    const nextState = !busRadarActive;
    setBusRadarActive(nextState);
    if (onToggleBusRadar) onToggleBusRadar(nextState);
  };

  // 플로팅 컨트롤: 탈출 노선 필터 전환 (Step 7)
  const handleToggleEscapeLine = () => {
    setActiveEscapeLine((prev) =>
      prev === 'ALL' ? 'ROUTE_1' : prev === 'ROUTE_1' ? 'ROUTE_39' : 'ALL'
    );
  };

  return (
    <section className="flex-1 w-full relative bg-black overflow-hidden flex flex-col justify-between">
      {/* 실제 카카오맵 타일이 렌더링되는 DOM 엘리먼트 (야간 다크모드 필터 적용) */}
      <div
        id="kakao-map"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full bg-[#050505] kakao-dark-map"
      >
        {/* SDK 로딩 중이거나 키 미등록 시 표시되는 세련된 야간 그리드 & 레이더 백그라운드 */}
        {!isLoaded && (
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* 레이더 펄스 시각화 */}
            <div className="relative flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-emerald-500/20 animate-ping duration-1000" />
              <div className="w-48 h-48 rounded-full border border-emerald-500/30 absolute" />
              <div className="w-24 h-24 rounded-full border border-emerald-500/40 absolute" />
              <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_12px_#10b981] absolute flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>

              {/* 현재 기사 위치 레이블 */}
              <div className="absolute mt-10 px-2 py-0.5 bg-black/80 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono">
                📍 {currentLocation.name}
              </div>
            </div>

            {/* SDK 안내 메시지 (키 미등록 또는 도메인 불일치 시 직관적인 안내) */}
            {sdkError && (
              <div className="absolute top-16 left-3 right-3 z-30 bg-zinc-950/95 border border-amber-500/50 text-amber-200 p-3 rounded-xl text-xs flex items-start gap-2.5 shadow-2xl backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-amber-300 text-xs">카카오맵 SDK 연동 확인 필요</div>
                  <div className="text-[11px] text-zinc-300 mt-1 leading-relaxed break-keep">
                    {sdkError}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1 font-mono">
                    <span>도메인 등록:</span>
                    <a
                      href="https://developers.kakao.com/console/app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline hover:text-amber-300"
                    >
                      developers.kakao.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 상단 오버레이: 심야 버스 & 탈출선 범례 (기획서 3.3 반영) */}
      <div className="relative z-10 p-3 flex flex-col gap-2 pointer-events-none">
        <div className="self-start flex flex-wrap gap-1.5 pointer-events-auto">
          {/* 서울/강남 방면 폴리라인 범례 (빨강) */}
          <div className="flex items-center gap-1.5 bg-black/85 border border-zinc-800 px-2 py-1 rounded-md text-[11px] text-zinc-200 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
            <span className="font-semibold text-rose-300">서울/강남 방면</span>
          </div>

          {/* 수원/병점/오산 방면 폴리라인 범례 (파랑) */}
          <div className="flex items-center gap-1.5 bg-black/85 border border-zinc-800 px-2 py-1 rounded-md text-[11px] text-zinc-200 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
            <span className="font-semibold text-blue-300">1번 국도 (수원·병점)</span>
          </div>
        </div>
      </div>

      {/* 우측 플로팅 컨트롤 버튼 (야간 장갑 착용 고려한 큼직한 터치 영역) */}
      <div className="absolute right-3 top-16 z-20 flex flex-col gap-2.5">
        {/* 1. 현위치 재탐색 버튼 */}
        <button
          type="button"
          onClick={handleRecenterClick}
          aria-label="내 위치로 중심 이동"
          className="w-11 h-11 bg-black/90 text-white rounded-xl border border-zinc-800 shadow-xl flex items-center justify-center active:scale-90 active:bg-zinc-800 transition-all hover:border-zinc-700"
        >
          <Crosshair className="w-5 h-5 text-emerald-400" />
        </button>

        {/* 2. 심야 버스 레이더 토글 버튼 */}
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

        {/* 3. 탈출 노선 필터 버튼 */}
        <button
          type="button"
          onClick={handleToggleEscapeLine}
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
        <div className="self-center bg-black/85 border border-zinc-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] text-zinc-300 pointer-events-auto shadow-lg">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>현재 시각: 덕우리 저수지·구장사거리 2차 뒤풀이 콜 집중 구간</span>
        </div>
      </div>
    </section>
  );
}
