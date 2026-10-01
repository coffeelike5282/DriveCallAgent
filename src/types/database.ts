import { Timestamp, GeoPoint } from 'firebase/firestore';

// ========================================================
// 1. 사용자 컬렉션: users/{userId}
// ========================================================
export type MembershipTier = 'FREE' | 'DAY_PASS' | 'PRO';
export type OAuthProvider = 'kakao' | 'google';

export interface UserDocument {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  oauthProvider: OAuthProvider;
  membershipTier: MembershipTier;
  passExpiresAt: Timestamp | null; // DAY_PASS, PRO 만료 일시
  currentLocation?: {
    lat: number;
    lng: number;
    geohash: string;
    updatedAt: Timestamp;
  };
  preferences: {
    favoriteAxis: 'ROUTE_1' | 'ROUTE_39' | 'ALL';
    soundAlert: boolean;
    highContrastMode: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ========================================================
// 2. 황금 콜 스팟 마스터: hot_spots/{spotId}
// ========================================================
export type SpotCategory =
  | 'GOLF_CLUB'           // 골프장 (발리오스CC 등)
  | 'RESTAURANT'          // 가든형 식당/맛집 라인 (덕우리 저수지, 구장사거리)
  | 'NIGHTLIFE'           // 유흥 밀집지 (인계동 박스, 중앙역 로데오, 병점 중심상가)
  | 'OFFICE'              // 오피스 밀집지 (강남 테헤란로, 여의도, 종로)
  | 'ESCAPE_SAFETY_LINE'; // 탈출 안전선 합류점 (1번 국도, 39번 국도)

export type EscapeAxis = 'ROUTE_1' | 'ROUTE_39' | 'LOCAL';

export interface HotSpotDocument {
  id: string;
  spotName: string;
  category: SpotCategory;
  geoPoint: GeoPoint;       // Firebase Native GeoPoint
  lat: number;              // 빠른 클라이언트 접근용
  lng: number;
  geohash: string;          // Geohash 기반 반경 1.5km 초고속 쿼리 인덱스
  escapeAxis: EscapeAxis;   // 1번 국도(수원-병점-오산) vs 39번 국도(안산)
  targetHours: string;      // '17:30-18:30' | '18:30-21:00' | '21:00-23:30' | '23:30-02:00'
  callScore: number;        // 1 ~ 100점 (AI 예측 확률)
  tipDescription: string;   // 기사용 현장 팁
  isCrowdsourced: boolean;  // 공식 마스터 데이터(false) vs 유저 등록(true)
  crowdsourceCount: number; // 추천/검증 횟수
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ========================================================
// 3. 복귀 성공 핀 (크라우드소싱): crowd_pins/{pinId}
// ========================================================
export type CallType = 'ESCAPE_SUCCESS' | 'LONG_DISTANCE' | 'HIGH_FARE';

export interface CrowdPinDocument {
  id: string;
  userId: string;
  authorMaskedName: string; // 예: "화성*기사"
  spotName: string;
  geoPoint: GeoPoint;
  lat: number;
  lng: number;
  geohash: string;
  callType: CallType;
  fareAmount?: number;         // 콜 금액 (예: 45000)
  destinationSummary: string;  // 예: "수원 인계동 복귀 성공"
  comment?: string;
  likesCount: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;        // 24시간 뒤 휘발 (기획서 8.데이터 보안 원칙)
}

// ========================================================
// 4. 결제 내역: payments/{paymentId}
// ========================================================
export type PaymentStatus = 'PAID' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'KAKAOPAY' | 'TOSSPAY';

export interface PaymentDocument {
  id: string;
  userId: string;
  merchantUid: string;        // 주문 고유 번호
  impUid?: string;            // 포트원 결제 고유 번호
  membershipTier: 'DAY_PASS' | 'PRO';
  amount: number;             // 1000 ~ 6900원
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  passStartAt: Timestamp;
  passEndAt: Timestamp;
  createdAt: Timestamp;
}

// ========================================================
// 5. 심야 버스 레이더 노선: night_bus_routes/{routeId}
// ========================================================
export type BusDirection = 'SEOUL_GANGNAM' | 'SUWON_BYEONGJEOM_OSAN';

export interface NightBusRouteDocument {
  routeId: string;
  routeName: string;          // 예: "M4403", "7770", "3100"
  direction: BusDirection;    // 서울/강남(빨강) vs 수원/병점/오산(파랑)
  polylineColor: '#ef4444' | '#3b82f6'; // 빨간색 or 파란색
  polylinePath: Array<{ lat: number; lng: number }>;
  firstBusTime: string;
  lastBusTime: string;
  intervalMinutes: number;
  updatedAt: Timestamp;
}
