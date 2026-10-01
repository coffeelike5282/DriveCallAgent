import {
  collection,
  CollectionReference,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { db } from './client';
import {
  UserDocument,
  HotSpotDocument,
  CrowdPinDocument,
  PaymentDocument,
  NightBusRouteDocument,
} from '@/types/database';

// 범용 Firestore 컨버터 팩토리
function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T): DocumentData {
      return modelObject;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): T {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

// 1. 사용자 컬렉션
export const usersCollection = collection(db, 'users').withConverter(
  createConverter<UserDocument>()
);

// 2. 황금 콜 스팟 마스터 컬렉션
export const hotSpotsCollection = collection(db, 'hot_spots').withConverter(
  createConverter<HotSpotDocument>()
);

// 3. 복귀 성공 핀 (크라우드소싱) 컬렉션
export const crowdPinsCollection = collection(db, 'crowd_pins').withConverter(
  createConverter<CrowdPinDocument>()
);

// 4. 결제 내역 컬렉션
export const paymentsCollection = collection(db, 'payments').withConverter(
  createConverter<PaymentDocument>()
);

// 5. 심야 버스 레이더 노선 컬렉션
export const nightBusRoutesCollection = collection(db, 'night_bus_routes').withConverter(
  createConverter<NightBusRouteDocument>()
);
