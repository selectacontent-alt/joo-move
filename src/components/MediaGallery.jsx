import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, Play, Filter } from 'lucide-react';
import '../app/globals.css';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchJsonCached } from '../lib/prefetchCache';
import ImageWithSkeleton from './ImageWithSkeleton';


const MediaGallery = () => {
  const { t, language } = useLanguage();
  const [selectedImg, setSelectedImg] = useState(null);
  const galleryRef = useRef(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colCount, setColCount] = useState(4);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!loading && mediaItems.length > 0) {
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          if (prev < mediaItems.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 100); // Reveal one image every 100ms
      return () => clearInterval(interval);
    }
  }, [loading, mediaItems]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) setColCount(2);
      else if (window.innerWidth <= 900) setColCount(2);
      else if (window.innerWidth <= 1200) setColCount(3);
      else setColCount(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchJsonCached('/api/media')
      .then(data => {
        const formattedData = Array.isArray(data) ? data.map((item) => ({
          ...item,
          url: item.image_url,
          thumbUrl: item.image_url
        })) : [];
        setMediaItems(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load media gallery:', err);
        setLoading(false);
      });
  }, []);

  // Scroll Animation Logic
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    if (galleryRef.current) {
      const elements = galleryRef.current.querySelectorAll('.scroll-reveal');
      elements.forEach((el, index) => {
        // Add staggered delay to grid items
        if (el.classList.contains('masonry-item')) {
          el.style.transitionDelay = `${(index % 4) * 0.1}s`;
        }
        observer.observe(el);
      });
    }

    return () => observer.disconnect();
  }, [mediaItems, visibleCount]);

  return (
    <div className="media-gallery-section" id="media" ref={galleryRef} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="media-container">
        <div className="media-gallery-header scroll-reveal">
          <h2 className="media-title">{t('media.title')}</h2>
          <p className="media-subtitle">{t('media.subtitle')}</p>
        </div>

        {loading ? null : mediaItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem', fontSize: '1.2rem' }}>{t('media.empty')}</div>
        ) : (
          <div className="masonry-grid-flex">
            {Array.from({ length: colCount }).map((_, colIndex) => (
              <div key={colIndex} className="masonry-column">
                {mediaItems.slice(0, visibleCount).filter((_, i) => i % colCount === colIndex).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="masonry-item scroll-reveal" 
                    onClick={() => setSelectedImg(item)}
                  >
                      <ImageWithSkeleton src={item.thumbUrl} alt={item.title || t('media.imageAlt')} loading="lazy" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modal via React Portal to escape stacking context */}
      {selectedImg && typeof document !== 'undefined' && createPortal(
        <div className="media-lightbox" onClick={() => setSelectedImg(null)}>
           <button className="close-lightbox" aria-label={t('media.close')}><X size={32}/></button>
           <div className="lightbox-content-wrapper" onClick={e => e.stopPropagation()}>
               <img src={selectedImg.url} alt={selectedImg.title} className="lightbox-img" />
           </div>
        </div>,
        document.body
      )}

      <style>{`
        .media-gallery-section {
          padding: 8rem 0 10rem 0 !important; /* Force padding bottom */
          background: #f8fafc;
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(16, 185, 129, 0.12), transparent 30%),
            radial-gradient(circle at 85% 30%, rgba(5, 150, 105, 0.1), transparent 30%),
            radial-gradient(circle at 50% 0%, rgba(209, 250, 229, 0.7) 0%, #f8fafc 70%);
          min-height: 100vh;
          direction: ${language === 'ar' ? 'rtl' : 'ltr'};
          position: relative;
        }

        /* Scroll Reveal Animation Classes */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(60px) scale(0.92);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .media-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        .media-gallery-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .media-title {
          font-size: 3.8rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 5px 20px rgba(16, 185, 129, 0.2);
          letter-spacing: -1px;
        }

        .media-subtitle {
          font-size: 1.25rem;
          color: #475569;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 500;
        }

        .masonry-grid-flex {
          display: flex;
          gap: 2rem;
          width: 100%;
          align-items: flex-start;
        }

        .masonry-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          min-width: 0; /* Prevent flex blowouts */
        }

        .masonry-item {
          width: 100%;
          margin-bottom: 0; /* Handled by gap */
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          background: #ffffff;
          transform: translateZ(0); /* Hardware acceleration */
        }

        /* Physics-based hover transition */
        .masonry-item.visible {
           transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .masonry-item img, .masonry-item video {
          width: 100%;
          height: auto;
          display: block;
          border-radius: inherit; /* Ensure corners are clipped */
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), filter 0.8s ease;
        }

        .masonry-item:hover {
          transform: translateY(-12px) scale(1.02) !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.12), 0 10px 30px rgba(16, 185, 129, 0.15);
          z-index: 2;
        }

        .masonry-item:hover img, .masonry-item:hover video {
          transform: scale(1.1) rotate(1deg);
          filter: brightness(1.05);
        }

        /* Lightbox Physics */
        .media-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(248, 250, 252, 0.95);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          animation: fadeInLightbox 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          padding: 2rem;
        }

        @keyframes fadeInLightbox {
          from { opacity: 0; background: rgba(248, 250, 252, 0); }
          to { opacity: 1; background: rgba(248, 250, 252, 0.95); }
        }

        .lightbox-content-wrapper {
          position: relative;
          max-width: 90%;
          max-height: 80vh;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.15), 0 0 50px rgba(16, 185, 129, 0.1);
          animation: physicsPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          object-fit: contain;
          transform-origin: center;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .lightbox-caption {
          color: #0f172a;
          margin-top: 2rem;
          font-size: 1.8rem;
          font-weight: 900;
          text-align: center;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.15s;
          opacity: 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .close-lightbox {
          position: absolute;
          top: 40px;
          right: 40px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: #0f172a;
          cursor: pointer;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .close-lightbox:hover { 
          transform: scale(1.15) rotate(90deg); 
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        }

        @keyframes physicsPop {
          0% { transform: scale(0.4) translateY(80px) rotate(-2deg); opacity: 0; }
          100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
        }

        @keyframes slideUpFade {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          /* Handled by JS */
        }
        
        @media (max-width: 900px) {
          .media-title { font-size: 3rem; }
        }

        @media (max-width: 600px) {
          .masonry-grid-flex { gap: 1rem; }
          .masonry-column { gap: 1rem; }
          .media-gallery-section { padding: 8rem 0 8rem 0 !important; }
          .media-container { padding: 0 1rem; }
          .media-title { font-size: 2.2rem; }
          .masonry-item { border-radius: 12px; }
          .close-lightbox { top: 20px; right: 20px; width: 45px; height: 45px; }
        }
      `}</style>
    </div>
  );
};

export default MediaGallery;
