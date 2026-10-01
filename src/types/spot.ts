export type TimeSlot = '17:30-18:30' | '18:30-21:00' | '21:00-23:30' | '23:30-02:00';

export interface HotSpot {
  id: string;
  spotName: string;
  category: 'GOLF_CLUB' | 'NIGHTLIFE' | 'OFFICE' | 'RESTAURANT' | 'ESCAPE_SAFETY_LINE';
  lat: number;
  lng: number;
  geohash: string;
  targetHours: string; // 예: '21-23', '23-02'
  distanceKm?: number;
  escapeAxis: 'ROUTE_1' | 'ROUTE_39' | 'LOCAL'; // 1번 국도 축선(수원-병점-오산) vs 39번 국도 축선(안산)
  callScore: number; // 1~100 예측 점수
  isCrowdsourced: boolean;
  crowdsourceCount?: number;
  tipDescription?: string;
}
