'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const TrackingContext = createContext(null);

export const useTracker = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    if (typeof window !== 'undefined') {
      console.warn('useTracker must be used within a TrackingEngine');
    }
    return { trackViewContent: () => {}, trackAddToCart: () => {}, trackPurchase: () => {}, trackInitiateCheckout: () => {}, settings: null };
  }
  return context;
};

export default function TrackingEngine({ children }) {
  const [settings, setSettings] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(console.error);
    };

    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(loadSettings, { timeout: 2000 })
      : window.setTimeout(loadSettings, 700);

    return () => {
      if (window.cancelIdleCallback && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  const fireEvent = useCallback((eventName, data = {}, options = {}) => {
    if (typeof window === 'undefined' || !settings) return;

    // 1. Meta Pixel
    if (settings.meta_pixel_enabled === 'true' && typeof window.fbq === 'function') {
      if (eventName === 'PageView') {
        window.fbq('track', 'PageView');
      } else {
        if (options.eventId) {
          window.fbq('track', eventName, data.meta || data.common || {}, { eventID: options.eventId });
        } else {
          window.fbq('track', eventName, data.meta || data.common || {});
        }
      }
    }

    // 2. Google Ads
    if (settings.google_ads_enabled === 'true' && typeof window.gtag === 'function') {
      if (eventName !== 'PageView') {
        let gtagEvent = eventName;
        if (eventName === 'AddToCart') gtagEvent = 'add_to_cart';
        if (eventName === 'ViewContent') gtagEvent = 'view_item';
        if (eventName === 'InitiateCheckout') gtagEvent = 'begin_checkout';
        if (eventName === 'Purchase') gtagEvent = 'purchase';
        
        window.gtag('event', gtagEvent, data.google || data.common || {});
      }
    }

    // 3. TikTok Pixel
    if (settings.tiktok_pixel_enabled === 'true' && typeof window.ttq === 'object') {
      if (eventName === 'PageView') {
        window.ttq.page();
      } else {
        let ttqEvent = eventName;
        if (eventName === 'Purchase') ttqEvent = 'CompletePayment';
        window.ttq.track(ttqEvent, data.tiktok || data.common || {});
      }
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      fireEvent('PageView');
    }
  }, [pathname, settings, fireEvent]);

  const trackingAPI = {
    settings,
    trackViewContent: useCallback((product) => {
      fireEvent('ViewContent', {
        common: {
          content_ids: [product.id.toString()],
          content_name: product.title,
          content_type: 'product',
          value: parseFloat(product.price),
          currency: 'EGP'
        },
        google: {
          items: [{ id: product.id.toString(), name: product.title, price: parseFloat(product.price) }],
          value: parseFloat(product.price),
          currency: 'EGP'
        }
      });
    }, [fireEvent]),
    
    trackAddToCart: useCallback((product) => {
      fireEvent('AddToCart', {
        common: {
          content_ids: [product.id.toString()],
          content_name: product.title,
          content_type: 'product',
          value: parseFloat(product.price),
          currency: 'EGP'
        },
        google: {
          items: [{ id: product.id.toString(), name: product.title, price: parseFloat(product.price) }],
          value: parseFloat(product.price),
          currency: 'EGP'
        }
      });
    }, [fireEvent]),

    trackInitiateCheckout: useCallback((cartItems, totalValue) => {
      fireEvent('InitiateCheckout', {
        common: {
          content_ids: cartItems.map(item => item.product.id.toString()),
          num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          value: totalValue,
          currency: 'EGP'
        },
        google: {
          items: cartItems.map(item => ({ id: item.product.id.toString(), price: item.currentPrice, quantity: item.quantity })),
          value: totalValue,
          currency: 'EGP'
        }
      });
    }, [fireEvent]),

    trackPurchase: useCallback((orderData) => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const userData = {};
        if (orderData.email) {
          userData.email = orderData.email.trim().toLowerCase();
        }
        if (orderData.phone) {
          let formattedPhone = orderData.phone.replace(/[^0-9+]/g, '');
          if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
            formattedPhone = '+20' + formattedPhone.substring(1);
          } else if (formattedPhone.startsWith('201') && formattedPhone.length === 12) {
            formattedPhone = '+' + formattedPhone;
          }
          if (formattedPhone) {
            userData.phone_number = formattedPhone;
          }
        }
        
        if (Object.keys(userData).length > 0) {
          window.gtag('set', 'user_data', userData);
        }
      }

      fireEvent('Purchase', {
        common: {
          transaction_id: orderData.id,
          content_ids: orderData.products.map(p => p.id.toString()),
          value: parseFloat(orderData.total),
          currency: 'EGP'
        },
        google: {
          transaction_id: orderData.id,
          value: parseFloat(orderData.total),
          currency: 'EGP',
          items: orderData.products.map(p => ({ id: p.id.toString(), price: p.price, quantity: p.quantity }))
        }
      }, { eventId: orderData.id.toString() });
    }, [fireEvent])
  };

  return (
    <TrackingContext.Provider value={trackingAPI}>
      {/* Meta Pixel */}
      {settings?.meta_pixel_enabled === 'true' && settings?.meta_pixel_id && (
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
      )}

      {/* Google Ads Tag */}
      {settings?.google_ads_enabled === 'true' && settings?.google_tag_id && (
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

      {/* TikTok Pixel */}
      {settings?.tiktok_pixel_enabled === 'true' && settings?.tiktok_pixel_id && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${settings.tiktok_pixel_id}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {children}
    </TrackingContext.Provider>
  );
}
