'use client';

import React, { useState, useEffect } from 'react';
import MobileContainer from '@/components/layout/MobileContainer';
import TopHeader from '@/components/layout/TopHeader';
import MapContainer from '@/components/map/MapContainer';
import BottomSheet from '@/components/layout/BottomSheet';
import AdBanner320x50 from '@/components/layout/AdBanner320x50';
import { MembershipTier } from '@/types/user';
import { HotSpot } from '@/types/spot';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { hotSpotsCollection } from '@/lib/firebase/collections';

export default function HomePage() {
  const [membershipTier, setMembershipTier] = useState<MembershipTier>('FREE');
  const [currentLocationName, setCurrentLocationName] = useState<string>(
    '화성 팔탄 · 발리오스CC 클럽하우스'
  );
  const [spots, setSpots] = useState<HotSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<HotSpot | null>(null);

  // Firestore hot_spots 실시간 연동 (onSnapshot)
  useEffect(() => {
    const q = query(hotSpotsCollection, orderBy('callScore', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedSpots: HotSpot[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            spotName: data.spotName,
            category: data.category,
            lat: data.lat,
            lng: data.lng,
            geohash: data.geohash,
            targetHours: data.targetHours,
            escapeAxis: data.escapeAxis,
            callScore: data.callScore,
            isCrowdsourced: data.isCrowdsourced,
            crowdsourceCount: data.crowdsourceCount,
            tipDescription: data.tipDescription,
          };
        });

        setSpots(fetchedSpots);
        if (fetchedSpots.length > 0 && !selectedSpot) {
          // AI 1순위 추천 스팟 자동 선택
          setSelectedSpot(fetchedSpots[0]);
        }
      },
      (error) => {
        console.error('Firestore hot_spots 구독 에러:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 내 위치 재탐색 핸들러
  const handleRecenter = () => {
    alert('📍 현위치(발리오스CC 클럽하우스)로 지도를 재정렬합니다.');
  };

  // 심야 버스 레이더 토글 핸들러
  const handleToggleBusRadar = (active: boolean) => {
    console.log('심야 버스 레이더 상태:', active);
  };

  // '복귀 성공 핀' 등록 핸들러 (크라우드소싱)
  const handlePinSuccess = () => {
    alert('🎉 복귀 성공 핀이 등록되었습니다! 동료 기사들에게 공유됩니다.');
  };

  return (
    <MobileContainer>
      {/* 1. 상단 헤더 (내 위치, GPS 상태, 멤버십) */}
      <TopHeader
        currentLocationName={currentLocationName}
        membershipTier={membershipTier}
        gpsActive={true}
      />

      {/* 2. 메인 맵 영역 (실시간 맵, 버스 폴리라인, 플로팅 컨트롤) */}
      <MapContainer
        onRecenter={handleRecenter}
        onToggleBusRadar={handleToggleBusRadar}
      />

      {/* 3. 하단 바텀시트 (AI 최단 탈출 추천 스팟 & 원터치 딥링크) */}
      <BottomSheet
        selectedSpot={selectedSpot}
        onPinSuccess={handlePinSuccess}
      />

      {/* 4. 320x50 하단 고정 배너 광고 (FREE 회원 대상) */}
      <AdBanner320x50 membershipTier={membershipTier} />
    </MobileContainer>
  );
}
