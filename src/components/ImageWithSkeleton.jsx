import React, { useState } from 'react';
import { isVideoUrl, normalizeMediaUrl } from '../lib/mediaUtils';

const ImageWithSkeleton = ({ src, alt, className, style, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const mediaSrc = normalizeMediaUrl(src);
  const isVideo = isVideoUrl(mediaSrc);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', background: '#f1f5f9', overflow: 'hidden' }}>
      {!isLoaded && !hasError && (
        <div 
          className="skeleton-loader"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, rgba(200,200,200,0.2) 25%, rgba(200,200,200,0.3) 50%, rgba(200,200,200,0.2) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            zIndex: 0
          }}
        />
      )}
      {hasError ? (
        <div style={{
          width: '100%',
          minHeight: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontWeight: 800,
          padding: '1rem',
          textAlign: 'center'
        }}>
          تعذر تحميل الملف
        </div>
      ) : isVideo ? (
        <video
          src={mediaSrc}
          className={className}
          onLoadedData={() => setIsLoaded(true)}
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          muted
          playsInline
          preload="metadata"
          controls
          style={{
            ...style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1
          }}
          {...props}
        />
      ) : (
        <img
          src={mediaSrc}
          alt={alt}
          className={className}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            ...style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1
          }}
          {...props}
        />
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ImageWithSkeleton;
