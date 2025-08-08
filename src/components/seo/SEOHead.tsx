import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead: React.FC = () => (
  <Helmet>
    <title>SABO ARENA - Nền tảng Billiards đầu tiên tại Việt Nam</title>
    <meta name="description" content="Theo dõi phong độ, tham gia giải đấu realtime, thách đấu bạn bè, xây dựng cộng đồng cơ thủ." />
    <meta name="application-name" content="SABO ARENA" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="SABO" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#1e293b" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SABO ARENA" />
    <meta property="og:title" content="SABO ARENA - Nền tảng Billiards Việt Nam" />
    <meta property="og:description" content="Quản lý giải đấu, ELO minh bạch, thách đấu realtime." />
    <meta property="og:image" content="/og-image.jpg" />
    <meta property="og:locale" content="vi_VN" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="SABO ARENA" />
    <meta name="twitter:description" content="Theo dõi phong độ & giải đấu realtime." />
    <meta name="twitter:image" content="/og-image.jpg" />

    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  </Helmet>
);

export default SEOHead;
