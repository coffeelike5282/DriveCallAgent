/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
        Polyline: new (options: KakaoPolylineOptions) => KakaoPolyline;
        event: {
          addListener: (target: any, type: string, handler: (...args: any[]) => void) => void;
          removeListener: (target: any, type: string, handler: (...args: any[]) => void) => void;
        };
      };
    };
  }
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  panTo: (latlng: KakaoLatLng) => void;
  setLevel: (level: number, options?: { animate?: boolean }) => void;
  getLevel: () => number;
  relayout: () => void;
}

export interface KakaoCustomOverlayOptions {
  position: KakaoLatLng;
  content: HTMLElement | string;
  xAnchor?: number;
  yAnchor?: number;
  zIndex?: number;
  map?: KakaoMapInstance;
}

export interface KakaoCustomOverlay {
  setMap: (map: KakaoMapInstance | null) => void;
  getMap: () => KakaoMapInstance | null;
  setPosition: (position: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setContent: (content: HTMLElement | string) => void;
  setZIndex: (zIndex: number) => void;
}

export interface KakaoPolylineOptions {
  map?: KakaoMapInstance;
  path: KakaoLatLng[];
  strokeWeight?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeStyle?: string;
}

export interface KakaoPolyline {
  setMap: (map: KakaoMapInstance | null) => void;
  getMap: () => KakaoMapInstance | null;
  setPath: (path: KakaoLatLng[]) => void;
}

export {};
