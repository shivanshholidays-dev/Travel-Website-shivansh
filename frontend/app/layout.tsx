import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense, cache } from 'react';
import Providers from '../src/components/shared/Providers';
import JSInitializer from '../src/components/shared/JSInitializer';
import SecurityDeterrent from '../src/components/shared/SecurityDeterrent';
import Preloader from '../src/components/shared/Preloader';
import './globals.css';

import { settingsApi } from '../src/lib/api/settings.api';
import { getImgUrl } from '../src/lib/utils/image';

// Singleton cache for settings to strictly prevent 429 errors during SSR across all requests
let globalSettingsCache: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

const getCachedSettings = async () => {
  const now = Date.now();
  if (globalSettingsCache && (now - lastFetchTime < CACHE_TTL))
  {
    return globalSettingsCache;
  }

  try
  {
    const settings = await settingsApi.getSettings();
    globalSettingsCache = settings || null;
    lastFetchTime = now;
    return globalSettingsCache;
  } catch (err)
  {
    console.error('Failed to fetch settings for metadata:', err);
    // Return stale cache if available, otherwise null
    return globalSettingsCache || null;
  }
};

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta: Metadata = {
    title: 'Shivansh Holidays – Tour & Travel Booking',
    description: 'Discover and book amazing tours across India. Best prices, verified packages, and seamless booking with Shivansh Holidays.',
  };

  try
  {
    const settings = await getCachedSettings();
    if (!settings) return defaultMeta;

    const other = settings?.otherSettings;
    const business = settings?.businessDetails;

    const titleStr = other?.seoMetaTitle || defaultMeta.title as string;
    const descStr = other?.seoMetaDescription || defaultMeta.description as string;
    const logoUrl = getImgUrl(other?.logoUrl, '/assets/img/logo/the-trek-stories.png');

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://Shivansh Holidays.in'),
      title: {
        default: titleStr,
        template: `%s | ${titleStr}`,
      },
      description: descStr,
      keywords: ['Shivansh Holidays', 'india tours', 'trekking india', 'adventure travel', 'tour booking', 'travel packages', 'travel', 'holidays', 'tours', 'booking', 'vacation', 'holiday', 'India', 'trekking', 'adventure', 'himachal pradesh', 'kedarnath', 'kedarnath yatra', 'kedarnath yatra package'],
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://Shivansh Holidays.in',
        siteName: business?.supportEmail || 'Shivansh Holidays',
        title: titleStr,
        description: descStr,
        images: [{ url: logoUrl, width: 120, height: 40 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: titleStr,
        description: descStr,
        images: [logoUrl],
      },
    };
  } catch (error)
  {
    console.warn('Metadata generation fallback triggered:', error);
    return defaultMeta;
  }
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/css/bootstrap.css" />

        <link rel="stylesheet" href="/assets/css/swiper-bundle.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/font-awesome-pro.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body suppressHydrationWarning>
        <Preloader />
        <Providers>
          <JSInitializer />
          <SecurityDeterrent />
          <div className="togo-back-wrapper">
            <button id="back-btn-top" type="button" className="togo-back-btn">
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M11 6L6 1L1 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {children}
        </Providers>

        <Script src="/assets/js/vendor/jquery.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/incluid-bundle.js" strategy="afterInteractive" />
        <Script src="/assets/js/bootstrap-bundle.js" strategy="afterInteractive" />
        <Script src="/assets/js/range-slider.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/fecha.js" strategy="afterInteractive" />
        <Script src="/assets/js/hotel-datepicker.js" strategy="afterInteractive" />
        <Script src="/assets/js/nice-select.js" strategy="afterInteractive" />
        <Script src="/assets/js/swiper-bundle.js" strategy="afterInteractive" />
        <Script src="/assets/js/purecounter.js" strategy="afterInteractive" />
        <Script src="/assets/js/magnific-popup.js" strategy="afterInteractive" />
        <Script src="/assets/js/scripts.js?v=2" strategy="afterInteractive" />
      </body>
    </html>
  );
}
