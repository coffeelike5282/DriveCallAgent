import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 환경 변수가 없는 빌드 환경(Cloudflare Pages 등)에서도
// auth/invalid-api-key 에러가 발생하지 않도록 기본 설정 폴백 제공
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyAHRWNYYPieHxzgdgF3ylvVNaQus8-U8OA',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'callnavi-driver-agent.firebaseapp.com',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'callnavi-driver-agent',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'callnavi-driver-agent.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '390696692744',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:390696692744:web:9e2d96aa503911a819f5bd',
};

// 중복 초기화 방지 싱글톤 패턴
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
