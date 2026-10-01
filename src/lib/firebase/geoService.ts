import {
  query,
  where,
  orderBy,
  startAt,
  endAt,
  getDocs,
} from 'firebase/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import { hotSpotsCollection, crowdPinsCollection } from './collections';
import { HotSpotDocument, CrowdPinDocument } from '@/types/database';

/**
 * 기획서 2.2 구현: 반경 1.5km(또는 지정 반경) 내의 황금 콜 스팟 초고속 조회
 * - Geohash 기반 Bounding Box 쿼리로 Firestore에서 효율적인 공간 필터링 수행
 * - 실제 거리 계산(distanceBetween)을 통해 정밀 필터링 및 거리순 정렬
 */
export async function getNearbyHotSpots(
  centerLat: number,
  centerLng: number,
  radiusInKm: number = 1.5
): Promise<Array<HotSpotDocument & { distanceKm: number }>> {
  const center: [number, number] = [centerLat, centerLng];
  const radiusInM = radiusInKm * 1000;

  // 1. 반경을 포괄하는 지오해시 경계 박스 배열 계산
  const bounds = geohashQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = query(
      hotSpotsCollection,
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    promises.push(getDocs(q));
  }

  // 2. 모든 경계 박스의 스냅샷 수집
  const snapshots = await Promise.all(promises);
  const matchingSpots: Array<HotSpotDocument & { distanceKm: number }> = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      const distanceInKm = distanceBetween([data.lat, data.lng], center);

      // 경계 박스 쿼리 오차를 실제 거리로 필터링
      if (distanceInKm <= radiusInKm) {
        matchingSpots.push({
          ...data,
          distanceKm: Math.round(distanceInKm * 10) / 10,
        });
      }
    }
  }

  // 거리순 정렬
  matchingSpots.sort((a, b) => a.distanceKm - b.distanceKm);
  return matchingSpots;
}

/**
 * 반경 내 최근 '복귀 성공 핀' 조회 (크라우드소싱 집단지성)
 */
export async function getNearbyCrowdPins(
  centerLat: number,
  centerLng: number,
  radiusInKm: number = 3.0
): Promise<Array<CrowdPinDocument & { distanceKm: number }>> {
  const center: [number, number] = [centerLat, centerLng];
  const radiusInM = radiusInKm * 1000;

  const bounds = geofireQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = query(
      crowdPinsCollection,
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);
  const matchingPins: Array<CrowdPinDocument & { distanceKm: number }> = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      const distanceInKm = distanceBetween([data.lat, data.lng], center);

      if (distanceInKm <= radiusInKm) {
        matchingPins.push({
          ...data,
          distanceKm: Math.round(distanceInKm * 10) / 10,
        });
      }
    }
  }

  matchingPins.sort((a, b) => a.distanceKm - b.distanceKm);
  return matchingPins;
}

function geofireQueryBounds(center: [number, number], radiusInM: number) {
  return geohashQueryBounds(center, radiusInM);
}
