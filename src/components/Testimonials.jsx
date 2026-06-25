import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchJsonCached } from '../lib/prefetchCache';

const Testimonials = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchJsonCached('/api/testimonials')
      .then(data => {
        if(Array.isArray(data)) setImages(data);
      })
      .catch(console.error);
  }, []);

  if (images.length === 0) return null;

  // Make sure track has enough items to fill a 4k screen (approx 3840px).
  // Assuming each item is ~340px + gap, we need ~12 items minimum.
  let trackImages = [...images];
  while (trackImages.length < 15) {
    trackImages = [...trackImages, ...images];
  }

  const trackContent = trackImages.map((test, index) => (
    <div 
      key={`${test.id}-${index}`} 
      className="luxury-testimonial-card marquee-card"
      style={{ 
        flexShrink: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#fff',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => setSelectedImage(test.image_url)}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
    >
      <img 
        src={test.image_url} 
        alt="Review" 
        className="luxury-testimonial-image"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'cover',
          aspectRatio: '4/5',
          pointerEvents: 'none'
        }}
        draggable="false"
      />
    </div>
  ));

  return (
    <section className="luxury-testimonials-container" id="testimonials" style={{ padding: '6rem 0', background: '#f8fafc', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="luxury-subtitle" style={{ color: 'var(--primary-color)', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
            {t('testimonials.subtitle')}
          </span>
          <h2 className="luxury-section-title" suppressHydrationWarning style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '1rem', color: '#0f172a', fontWeight: '900' }} dangerouslySetInnerHTML={{ __html: t('testimonials.title') }}></h2>
          <div className="stat-divider" style={{ margin: '1.5rem auto', height: '4px', width: '80px', background: 'var(--primary-color)', borderRadius: '4px' }}></div>
          <p className="luxury-desc" style={{ margin: '0 auto', color: '#475569', maxWidth: '650px', fontSize: '1.15rem', lineHeight: '1.7' }}>
            {t('testimonials.description')}
          </p>
        </div>
      </div>
      
      <div 
        className="testimonials-marquee-wrapper"
        style={{
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          direction: 'ltr',
          padding: '1rem 0 3rem'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="testimonials-marquee-track"
          style={{
            display: 'flex',
            gap: '2rem',
            paddingRight: '2rem',
            animation: 'marqueeRight 200s linear infinite',
            animationPlayState: (isHovered || selectedImage) ? 'paused' : 'running',
            width: 'max-content',
            flexShrink: 0
          }}
        >
          {trackContent}
        </div>
        <div 
          className="testimonials-marquee-track"
          style={{
            display: 'flex',
            gap: '2rem',
            paddingRight: '2rem',
            animation: 'marqueeRight 200s linear infinite',
            animationPlayState: (isHovered || selectedImage) ? 'paused' : 'running',
            width: 'max-content',
            flexShrink: 0
          }}
        >
          {trackContent}
        </div>
      </div>

      <style>{`
        @keyframes marqueeRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        .marquee-card {
          width: 320px !important;
          flex: 0 0 320px !important;
          max-width: none !important;
        }

        @media (max-width: 768px) {
          .marquee-card {
            width: 280px !important;
            flex: 0 0 280px !important;
            max-width: none !important;
          }
        }
      `}</style>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out',
            padding: '2rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '2rem',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              &times;
            </button>
            <img 
              src={selectedImage} 
              alt="Full Review" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '85vh', 
                objectFit: 'contain', 
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
