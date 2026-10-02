'use client';

import { useState, useEffect } from 'react';

interface UseKakaoMapLoaderResult {
  isLoaded: boolean;
  error: string | null;
}

/**
 * 카카오맵 Web JS SDK 비동기 로더 훅
 * - Next.js App Router 및 PWA 환경에서 중복 로딩 없이 안전하게 SDK 초기화
 * - autoload=false 파라미터 적용 후 kakao.maps.load() 명시적 호출
 */
export function useKakaoMapLoader(): UseKakaoMapLoaderResult {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 이미 kakao.maps 객체가 완전히 로드되어 있는 경우
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
      setIsLoaded(true);
      return;
    }

    const appKey =
      process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ||
      '36619c5b804b122f1a33129df2da2621';

    // 키가 설정되지 않은 경우
    if (!appKey || appKey === 'dummy_kakao_key') {
      setError('카카오맵 JavaScript 키(NEXT_PUBLIC_KAKAO_MAP_API_KEY)가 등록되지 않았습니다.');
      return;
    }

    // 이미 스크립트 태그가 삽입되어 있는지 확인
    const SCRIPT_ID = 'kakao-map-sdk';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const onScriptLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
        });
      } else {
        setError('카카오맵 SDK 초기화 실패: kakao 객체를 찾을 수 없습니다.');
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
      script.async = true;

      script.onload = onScriptLoaded;
      script.onerror = () => {
        const origin = window.location.origin;
        console.error(`[KakaoMapSDK] 스크립트 로드 실패. 카카오 개발자 콘솔(developers.kakao.com)의 [Web 플랫폼 사이트 도메인]에 '${origin}'이 등록되어 있는지 확인해주세요.`);
        setError(`카카오맵 SDK 로드 차단 (401 domain mismatched 가능성). 카카오 디벨로퍼스 콘솔의 [Web 플랫폼 사이트 도메인]에 '${origin}'을 등록해 주세요.`);
      };

      document.head.appendChild(script);
    } else {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
        });
      } else {
        script.addEventListener('load', onScriptLoaded);
      }
    }
  }, []);

  return { isLoaded, error };
}
