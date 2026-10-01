import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';

const firebaseConfig = {
  apiKey: "AIzaSyAHRWNYYPieHxzgdgF3ylvVNaQus8-U8OA",
  authDomain: "callnavi-driver-agent.firebaseapp.com",
  projectId: "callnavi-driver-agent",
  storageBucket: "callnavi-driver-agent.firebasestorage.app",
  messagingSenderId: "390696692744",
  appId: "1:390696692744:web:9e2d96aa503911a819f5bd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_HOT_SPOTS = [
  {
    id: 'spot-balios-cc',
    spotName: '발리오스CC 클럽하우스',
    category: 'GOLF_CLUB',
    lat: 37.1512,
    lng: 126.9038,
    escapeAxis: 'ROUTE_1',
    targetHours: '17:30-18:30',
    callScore: 95,
    tipDescription: '17:30~18:30 골프 라운딩 종료 직출 고단가 콜 집중 타깃',
    isCrowdsourced: false,
    crowdsourceCount: 38,
  },
  {
    id: 'spot-deokwoori-lake',
    spotName: '덕우리 저수지 가든형 식당 라인',
    category: 'RESTAURANT',
    lat: 37.1435,
    lng: 126.9210,
    escapeAxis: 'ROUTE_1',
    targetHours: '18:30-21:00',
    callScore: 88,
    tipDescription: '18:30~21:00 클럽하우스 후 인근 가든형 식당 2차 뒤풀이 콜 유도',
    isCrowdsourced: false,
    crowdsourceCount: 24,
  },
  {
    id: 'spot-gujang-intersection',
    spotName: '팔탄 구장사거리 맛집 라인',
    category: 'RESTAURANT',
    lat: 37.1648,
    lng: 126.9082,
    escapeAxis: 'ROUTE_39',
    targetHours: '18:30-21:00',
    callScore: 84,
    tipDescription: '팔탄 공단 및 골프장 연계 회식 장소, 39번 국도(안산 방면) 합류 용이',
    isCrowdsourced: false,
    crowdsourceCount: 19,
  },
  {
    id: 'spot-byeongjeom-safety-line',
    spotName: '1번 국도 병점 중심상가 (생존 안전선)',
    category: 'ESCAPE_SAFETY_LINE',
    lat: 37.2065,
    lng: 127.0345,
    escapeAxis: 'ROUTE_1',
    targetHours: '23:30-02:00',
    callScore: 92,
    tipDescription: '경기 남부 핵심 혈맥. 심야 버스 환승 및 수원·오산 연계 복귀 최고 확률 지점',
    isCrowdsourced: false,
    crowdsourceCount: 52,
  },
  {
    id: 'spot-ansan-jungang-rodeo',
    spotName: '39번 국도 안산 중앙역 로데오 (생존 안전선)',
    category: 'NIGHTLIFE',
    lat: 37.3168,
    lng: 126.8388,
    escapeAxis: 'ROUTE_39',
    targetHours: '23:30-02:00',
    callScore: 90,
    tipDescription: '39번 국도 최단 합류 지점. 시흥·안산·부천 심야 콜 다수 발생',
    isCrowdsourced: false,
    crowdsourceCount: 41,
  },
  {
    id: 'spot-suwon-ingyedong-box',
    spotName: '수원 인계동 박스 (골든 피크)',
    category: 'NIGHTLIFE',
    lat: 37.2635,
    lng: 127.0322,
    escapeAxis: 'ROUTE_1',
    targetHours: '23:30-02:00',
    callScore: 98,
    tipDescription: '심야 피크시간 전국 최대급 콜 수요지. 서울/수도권 전역 복귀 콜 지속 배차',
    isCrowdsourced: false,
    crowdsourceCount: 88,
  },
];

const INITIAL_BUS_ROUTES = [
  {
    routeId: 'bus-seoul-m4403',
    routeName: 'M4403 (동탄 ↔ 강남역)',
    direction: 'SEOUL_GANGNAM',
    polylineColor: '#ef4444',
    polylinePath: [
      { lat: 37.205, lng: 127.075 },
      { lat: 37.28, lng: 127.05 },
      { lat: 37.4979, lng: 127.0276 },
    ],
    firstBusTime: '05:00',
    lastBusTime: '02:00',
    intervalMinutes: 15,
  },
  {
    routeId: 'bus-suwon-7770',
    routeName: '7770 (수원역 ↔ 사당역 심야운행)',
    direction: 'SUWON_BYEONGJEOM_OSAN',
    polylineColor: '#3b82f6',
    polylinePath: [
      { lat: 37.266, lng: 127.001 },
      { lat: 37.32, lng: 126.99 },
      { lat: 37.4765, lng: 126.9816 },
    ],
    firstBusTime: '04:30',
    lastBusTime: '03:40',
    intervalMinutes: 10,
  },
];

async function runSeed() {
  console.log('🚀 [Firestore Seeder] Firebase 프로젝트에 스키마 데이터 생성 시작: callnavi-driver-agent');

  // 1. hot_spots 컬렉션 생성 및 데이터 삽입
  for (const item of INITIAL_HOT_SPOTS) {
    const hash = geohashForLocation([item.lat, item.lng]);
    const docData = {
      ...item,
      geoPoint: new GeoPoint(item.lat, item.lng),
      geohash: hash,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = doc(db, 'hot_spots', item.id);
    await setDoc(docRef, docData, { merge: true });
    console.log(`  ✅ [hot_spots] ${item.spotName} (Geohash: ${hash}) 저장 완료`);
  }

  // 2. night_bus_routes 컬렉션 생성 및 데이터 삽입
  for (const route of INITIAL_BUS_ROUTES) {
    const docRef = doc(db, 'night_bus_routes', route.routeId);
    await setDoc(docRef, { ...route, updatedAt: Timestamp.now() }, { merge: true });
    console.log(`  ✅ [night_bus_routes] ${route.routeName} 저장 완료`);
  }

  console.log('🎉 모든 초기 컬렉션 및 문서가 Firestore에 완벽히 생성되었습니다!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeder 에러:', err);
  process.exit(1);
});
