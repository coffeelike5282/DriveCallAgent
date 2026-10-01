import { GeoPoint, Timestamp, doc, setDoc } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { db } from './client';
import { HotSpotDocument, NightBusRouteDocument } from '@/types/database';

/**
 * 기획서 기반 초기 마스터 데이터 (시드 데이터)
 */
export const INITIAL_HOT_SPOTS = [
  {
    id: 'spot-balios-cc',
    spotName: '발리오스CC 클럽하우스',
    category: 'GOLF_CLUB' as const,
    lat: 37.1512,
    lng: 126.9038,
    escapeAxis: 'ROUTE_1' as const,
    targetHours: '17:30-18:30',
    callScore: 95,
    tipDescription: '17:30~18:30 골프 라운딩 종료 직출 고단가 콜 집중 타깃',
    isCrowdsourced: false,
    crowdsourceCount: 38,
  },
  {
    id: 'spot-deokwoori-lake',
    spotName: '덕우리 저수지 가든형 식당 라인',
    category: 'RESTAURANT' as const,
    lat: 37.1435,
    lng: 126.9210,
    escapeAxis: 'ROUTE_1' as const,
    targetHours: '18:30-21:00',
    callScore: 88,
    tipDescription: '18:30~21:00 클럽하우스 후 인근 가든형 식당 2차 뒤풀이 콜 유도',
    isCrowdsourced: false,
    crowdsourceCount: 24,
  },
  {
    id: 'spot-gujang-intersection',
    spotName: '팔탄 구장사거리 맛집 라인',
    category: 'RESTAURANT' as const,
    lat: 37.1648,
    lng: 126.9082,
    escapeAxis: 'ROUTE_39' as const,
    targetHours: '18:30-21:00',
    callScore: 84,
    tipDescription: '팔탄 공단 및 골프장 연계 회식 장소, 39번 국도(안산 방면) 합류 용이',
    isCrowdsourced: false,
    crowdsourceCount: 19,
  },
  {
    id: 'spot-byeongjeom-safety-line',
    spotName: '1번 국도 병점 중심상가 (생존 안전선)',
    category: 'ESCAPE_SAFETY_LINE' as const,
    lat: 37.2065,
    lng: 127.0345,
    escapeAxis: 'ROUTE_1' as const,
    targetHours: '23:30-02:00',
    callScore: 92,
    tipDescription: '경기 남부 핵심 혈맥. 심야 버스 환승 및 수원·오산 연계 복귀 최고 확률 지점',
    isCrowdsourced: false,
    crowdsourceCount: 52,
  },
  {
    id: 'spot-ansan-jungang-rodeo',
    spotName: '39번 국도 안산 중앙역 로데오 (생존 안전선)',
    category: 'NIGHTLIFE' as const,
    lat: 37.3168,
    lng: 126.8388,
    escapeAxis: 'ROUTE_39' as const,
    targetHours: '23:30-02:00',
    callScore: 90,
    tipDescription: '39번 국도 최단 합류 지점. 시흥·안산·부천 심야 콜 다수 발생',
    isCrowdsourced: false,
    crowdsourceCount: 41,
  },
  {
    id: 'spot-suwon-ingyedong-box',
    spotName: '수원 인계동 박스 (골든 피크)',
    category: 'NIGHTLIFE' as const,
    lat: 37.2635,
    lng: 127.0322,
    escapeAxis: 'ROUTE_1' as const,
    targetHours: '23:30-02:00',
    callScore: 98,
    tipDescription: '심야 피크시간 전국 최대급 콜 수요지. 서울/수도권 전역 복귀 콜 지속 배차',
    isCrowdsourced: false,
    crowdsourceCount: 88,
  },
];

/**
 * 심야 버스 레이더 초기 노선 (기획서 3.3 반영)
 */
export const INITIAL_BUS_ROUTES: NightBusRouteDocument[] = [
  {
    routeId: 'bus-seoul-m4403',
    routeName: 'M4403 (동탄 ↔ 강남역)',
    direction: 'SEOUL_GANGNAM',
    polylineColor: '#ef4444', // 빨간색 선
    polylinePath: [
      { lat: 37.205, lng: 127.075 },
      { lat: 37.28, lng: 127.05 },
      { lat: 37.4979, lng: 127.0276 },
    ],
    firstBusTime: '05:00',
    lastBusTime: '02:00',
    intervalMinutes: 15,
    updatedAt: Timestamp.now(),
  },
  {
    routeId: 'bus-suwon-7770',
    routeName: '7770 (수원역 ↔ 사당역 심야운행)',
    direction: 'SUWON_BYEONGJEOM_OSAN',
    polylineColor: '#3b82f6', // 파란색 선
    polylinePath: [
      { lat: 37.266, lng: 127.001 },
      { lat: 37.32, lng: 126.99 },
      { lat: 37.4765, lng: 126.9816 },
    ],
    firstBusTime: '04:30',
    lastBusTime: '03:40',
    intervalMinutes: 10,
    updatedAt: Timestamp.now(),
  },
];

/**
 * Firestore에 초기 마스터 데이터를 1회 적재하는 헬퍼 함수
 */
export async function seedInitialDatabase() {
  console.log('🌱 Firestore 초기 스팟 및 노선 데이터 적재 시작...');

  // 1. 핫스팟 데이터 적재
  for (const item of INITIAL_HOT_SPOTS) {
    const hash = geohashForLocation([item.lat, item.lng]);
    const spotDoc: HotSpotDocument = {
      ...item,
      geoPoint: new GeoPoint(item.lat, item.lng),
      geohash: hash,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = doc(db, 'hot_spots', item.id);
    await setDoc(docRef, spotDoc, { merge: true });
    console.log(`✅ [HotSpot] ${item.spotName} (Geohash: ${hash}) 적재 완료`);
  }

  // 2. 심야 버스 노선 데이터 적재
  for (const route of INITIAL_BUS_ROUTES) {
    const docRef = doc(db, 'night_bus_routes', route.routeId);
    await setDoc(docRef, route, { merge: true });
    console.log(`✅ [BusRoute] ${route.routeName} 적재 완료`);
  }

  console.log('🎉 Firestore 초기 데이터베이스 세팅 완료!');
}
