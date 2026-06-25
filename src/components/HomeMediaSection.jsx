"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Images, ChevronLeft, ZoomIn, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchJsonCached } from '../lib/prefetchCache';
import ImageWithSkeleton from './ImageWithSkeleton';
import { isVideoUrl, normalizeMediaUrl } from '../lib/mediaUtils';



/* ─── Main Component ─── */
const HomeMediaSection = ({ setCurrentPage }) => {
  const { t, language } = useLanguage();
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lightbox,    setLightbox]    = useState(null);
  const [hovered,     setHovered]     = useState(null);
  const sectionRef = useRef(null);
  /* fetch — only images the admin marked for homepage */
  useEffect(() => {
    fetchJsonCached('/api/media/homepage')
      .then(data => {
        const fmt = Array.isArray(data)
          ? data.map(item => ({
            ...item,
            url: normalizeMediaUrl(item.image_url),
            thumbUrl: normalizeMediaUrl(item.image_url),
            isVideo: isVideoUrl(item.image_url)
          }))
          : [];
        setItems(fmt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);


  /* intersection observer for header */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('hms-visible'); });
    }, { threshold: 0.15 });
    const els = sectionRef.current?.querySelectorAll('.hms-reveal');
    els?.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  /* keyboard close */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const goToGallery = () => setCurrentPage?.('media');

  const renderGrid = () => {
    if (items.length === 0) return (
      <div className="hms-empty">{t('homeMedia.empty')}</div>
    );

    const needsMarquee = items.length > 5;

    const renderTrack = (keyPrefix) => (
      <div className="hms-marquee-track" aria-hidden={keyPrefix === 'track2' ? "true" : "false"}>
        {items.map((item, idx) => (
          <div
            key={`${keyPrefix}-${item.id}-${idx}`}
            className="hms-card"
            onMouseEnter={() => setHovered(`${keyPrefix}-${idx}`)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setLightbox(item)}
          >
            <ImageWithSkeleton src={item.thumbUrl} alt={item.title || t('homeMedia.imageAlt')} loading="lazy" />

            <div className={`hms-overlay${hovered === `${keyPrefix}-${idx}` ? ' hms-overlay-active' : ''}`}>
              <ZoomIn size={28} strokeWidth={2} className="hms-zoom-icon" />
              {item.title && <span className="hms-overlay-title">{item.title}</span>}
            </div>

            {(idx === 0) && !needsMarquee && (
              <span className="hms-feature-badge">
                <Eye size={14} /> {t('homeMedia.latest')}
              </span>
            )}
          </div>
        ))}
      </div>
    );

    return (
      <div className="hms-marquee-container scroll-reveal" dir="ltr">
        <div className={`hms-marquee-wrapper ${needsMarquee ? 'is-animated' : ''}`}>
          {renderTrack('track1')}
          {needsMarquee && renderTrack('track2')}
        </div>
      </div>
    );
  };

  return (
    <section className="hms-section" id="media-home" ref={sectionRef} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background decorations */}
      <div className="hms-bg-orb hms-orb-1" aria-hidden="true" />
      <div className="hms-bg-orb hms-orb-2" aria-hidden="true" />

      <div className="hms-container">
        {/* ── Header ── */}
        <div className="hms-header hms-reveal">
          <h2 className="hms-title">{t('homeMedia.title')}<br /><span className="hms-title-accent">{t('homeMedia.titleAccent')}</span></h2>
        </div>

        {loading
          ? <div className="hms-marquee-container" dir="ltr">
              <div className="hms-marquee-wrapper">
                <div className="hms-marquee-track">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="hms-card hms-skeleton" />
                  ))}
                </div>
              </div>
            </div>
          : renderGrid()
        }

        {/* ── CTA ── */}
        {!loading && items.length > 0 && (
          <div className="hms-cta-wrapper hms-reveal">
            <button className="hms-cta-btn" onClick={() => { if(setCurrentPage) setCurrentPage('media'); window.scrollTo(0,0); }}>
              <span>{t('homeMedia.cta')}</span>
              <ChevronLeft size={20} />
            </button>

          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && typeof document !== 'undefined' && createPortal(
        <div className="hms-lightbox" onClick={() => setLightbox(null)}>
          <button className="hms-lb-close" onClick={() => setLightbox(null)} aria-label={t('homeMedia.close')}>
            <X size={22} />
          </button>
          <div className="hms-lb-inner" onClick={e => e.stopPropagation()}>
            {lightbox.isVideo ? (
              <video src={lightbox.url} className="hms-lb-media" controls playsInline preload="metadata" />
            ) : (
              <img src={lightbox.url} alt={lightbox.title} className="hms-lb-media" />
            )}
            {lightbox.title && <p className="hms-lb-caption">{lightbox.title}</p>}
          </div>
        </div>,
        document.body
      )}

      {/* ── Styles ── */}
      <style>{`
        /* ============================================================
           HOME MEDIA SECTION — Premium Styles
        ============================================================ */

        .hms-section {
          position: relative;
          padding: 7rem 0 8rem;
          overflow: hidden;
          background: #f8fafc;
          direction: ${language === 'ar' ? 'rtl' : 'ltr'};
        }

        /* Background */
        .hms-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .hms-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(20, 90, 36, 0.07), transparent 70%);
          top: -10%; left: -8%;
        }
        .hms-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(139, 195, 74, 0.06), transparent 70%);
          bottom: 0; right: -5%;
        }
        /* Container */
        .hms-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        /* ── Scroll reveal ── */
        .hms-reveal {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hms-visible, .hms-reveal.hms-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Header ── */
        .hms-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .hms-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1.2rem;
          background: rgba(20, 90, 36, 0.08);
          border: 1px solid rgba(20, 90, 36, 0.2);
          border-radius: 100px;
          color: #145a24;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .hms-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #182018;
          line-height: 1.15;
          margin-bottom: 1rem;
          letter-spacing: -1px;
        }
        .hms-title-accent {
          background: linear-gradient(135deg, #145a24 0%, #2e7d32 50%, #4caf50 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hms-subtitle {
          font-size: 1.15rem;
          color: #556b55;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 500;
        }

        /* ── Marquee / Slider ── */
        .hms-marquee-container {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          overflow: hidden;
          position: relative;
          margin-bottom: 3.5rem;
          padding: 1rem 0;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
        }

        .hms-marquee-wrapper {
          display: flex;
          width: max-content;
        }

        .hms-marquee-wrapper.is-animated {
          animation: marquee-move-right 40s linear infinite;
        }
        
        .hms-marquee-wrapper.is-animated:hover {
          animation-play-state: paused;
        }

        .hms-marquee-track {
          display: flex;
          width: max-content;
          gap: 1.5rem;
          padding-right: 1.5rem; /* Matches the gap so spacing between track1 and track2 is perfect */
        }

        @keyframes marquee-move-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        /* Card base */
        .hms-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: #e8ece4;
          border: 1px solid rgba(0, 0, 0, 0.07);
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.4s ease;
          transform-style: preserve-3d;
          
          /* Show max 5 items on screen */
          width: calc(20vw - 1.5rem);
          min-width: 280px; /* but don't get too small on mobile */
          max-width: 400px;
          height: 360px; /* larger height */
          flex-shrink: 0;
        }
        .hms-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(20, 90, 36, 0.15);
          border-color: rgba(20, 90, 36, 0.2);
          z-index: 2;
        }
        .hms-card img,
        .hms-card video {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .hms-card:hover img,
        .hms-card:hover video {
          transform: scale(1.08);
        }

        /* Overlay */
        .hms-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.2) 50%,
            transparent 100%
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .hms-overlay-active { opacity: 1; }
        .hms-zoom-icon {
          color: white;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
          transform: scale(0.8);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hms-overlay-active .hms-zoom-icon { transform: scale(1); }
        .hms-overlay-title {
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          text-align: center;
          padding: 0 1rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        /* Feature badge */
        .hms-feature-badge {
          position: absolute;
          top: 1rem; right: 1rem;
          background: rgba(255,255,255,0.92);
          color: #145a24;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.12);
          z-index: 5;
        }

        /* ── Skeleton ── */
        .hms-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-auto-rows: 260px;
          gap: 1.2rem;
          margin-bottom: 3.5rem;
        }
        .hms-skeleton {
          border-radius: 20px;
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.06) 25%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.06) 75%
          );
          background-size: 200% 100%;
          animation: hms-shimmer 1.8s infinite;
        }

        @keyframes hms-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty state ── */
        .hms-empty {
          text-align: center;
          color: #9aad9a;
          font-size: 1.2rem;
          padding: 4rem;
        }

        /* ── CTA ── */
        .hms-cta-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }
        .hms-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #145a24 0%, #2e7d32 100%);
          color: #ffffff;
          border: none;
          border-radius: 100px;
          font-size: 1.05rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 30px rgba(20, 90, 36, 0.3);
          position: relative;
          overflow: hidden;
        }
        .hms-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .hms-cta-btn:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 40px rgba(20, 90, 36, 0.45);
        }
        .hms-cta-btn:hover::before { opacity: 1; }
        .hms-cta-hint {
          color: #8aaa8a;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* ── Lightbox ── */
        .hms-lightbox {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: hms-lbIn 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes hms-lbIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .hms-lb-close {
          position: fixed;
          top: 1.5rem; right: 1.5rem;
          width: 50px; height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
        }
        .hms-lb-close:hover {
          background: #ef4444;
          border-color: #ef4444;
          transform: scale(1.15) rotate(90deg);
        }
        .hms-lb-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          max-width: 90vw;
          max-height: 90vh;
        }
        .hms-lb-media {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 18px;
          object-fit: contain;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          animation: hms-mediaPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes hms-mediaPop {
          from { transform: scale(0.5) translateY(60px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        .hms-lb-caption {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
        }


        /* ── Tablet (641px – 1024px) ── */
        @media (min-width: 641px) and (max-width: 1024px) {
          .hms-section { padding: 5rem 0 6rem; }
          .hms-container { padding: 0 1.5rem; }
          .hms-title { font-size: clamp(2rem, 4.5vw, 3rem); }
          .hms-card {
            width: calc(33.333vw - 1.5rem);
            height: 300px;
          }
          .hms-cta-btn { padding: 0.95rem 2.2rem; font-size: 1rem; }
        }

        /* ── Mobile (max 640px) ── */
        @media (max-width: 640px) {
          .hms-section { padding: 3rem 0 4rem; }
          .hms-container { padding: 0 0.85rem; }
          .hms-header { margin-bottom: 1.8rem; }

          .hms-title {
            font-size: 1.85rem;
            line-height: 1.25;
            letter-spacing: -0.5px;
          }
          .hms-title-accent { font-size: 2.1rem; }

          .hms-card { 
            border-radius: 13px;
            width: calc(65vw - 1rem); /* show ~1.5 items on screen */
            min-width: 240px;
            height: 250px;
          }

          .hms-feature-badge {
            font-size: 0.68rem;
            padding: 0.2rem 0.5rem;
            top: 0.5rem; right: 0.5rem;
          }

          .hms-zoom-icon { display: none; }

          /* CTA */
          .hms-cta-wrapper { gap: 0.5rem; }
          .hms-cta-btn {
            width: 100%;
            max-width: 300px;
            padding: 0.9rem 1.5rem;
            font-size: 0.95rem;
            justify-content: center;
          }
          .hms-cta-hint { font-size: 0.78rem; }

          /* Lightbox */
          .hms-lightbox { padding: 0.75rem; }
          .hms-lb-close { top: 0.75rem; right: 0.75rem; width: 38px; height: 38px; }
          .hms-lb-media { border-radius: 10px; max-height: 75vh; }
          .hms-lb-caption { font-size: 0.85rem; }
        }
      `}</style>

    </section>
  );
};

export default HomeMediaSection;
