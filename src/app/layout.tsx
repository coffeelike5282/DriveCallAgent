import type { Metadata, Viewport } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: '콜나비 (CallNavi) - 대리기사 AI 가이드 에이전트',
  description: '심야 오지 유배지 고립 방지 및 최단 탈출 안전선 AI 가이드 모바일 웹(PWA)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '콜나비',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full bg-black">
      <body className="h-full bg-black text-white antialiased overflow-hidden font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
