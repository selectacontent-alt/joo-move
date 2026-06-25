'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

export const trackClientEvent = (eventName, data = {}, platform = 'all') => {
  if (typeof window === 'undefined') return;

  // Track Meta Pixel
  if ((platform === 'all' || platform === 'meta') && typeof window.fbq === 'function') {
    if (eventName === 'PageView') {
      window.fbq('track', 'PageView');
    } else {
      window.fbq('track', eventName, data);
    }
  }

  // Track Google Ads
  if ((platform === 'all' || platform === 'google') && typeof window.gtag === 'function') {
    if (eventName === 'PageView') {
      // Handled by gtag config automatically usually, but can trigger explicitly
    } else {
      let gtagEvent = eventName;
      // Map standard Meta events to Google Standard if necessary, else use custom
      if (eventName === 'AddToCart') gtagEvent = 'add_to_cart';
      if (eventName === 'ViewContent') gtagEvent = 'view_item';
      if (eventName === 'InitiateCheckout') gtagEvent = 'begin_checkout';
      if (eventName === 'Purchase') gtagEvent = 'purchase';
      
      window.gtag('event', gtagEvent, data);
    }
  }
};

export default function TrackingProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (settings) {
      // Trigger PageView on route change
      trackClientEvent('PageView');
    }
  }, [pathname, searchParams, settings]);

  if (!settings) return <>{children}</>;

  return (
    <>
      {/* Meta Pixel */}
      {settings.meta_pixel_id && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${settings.meta_pixel_id}');
              `,
            }}
          />
        </>
      )}

      {/* Google Ads Tag */}
      {settings.google_tag_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_tag_id}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_tag_id}');
              `,
            }}
          />
        </>
      )}

      {children}
    </>
  );
}
