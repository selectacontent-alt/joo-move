import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, ShoppingBag, Flame, Star, CheckCircle, Trash2, Eye, ChevronRight, ChevronLeft, ChevronDown, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTracker } from './TrackingEngine';
import { fetchJsonCached } from '../lib/prefetchCache';

const isVideoUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(url));

const ProductMedia = ({ src, alt, className, style, zoomable = false, ...props }) => {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        className={className}
        style={style}
        muted
        playsInline
        loop
        autoPlay={!zoomable}
        controls={zoomable}
        {...props}
      />
    );
  }

  return <img src={src} alt={alt} className={className} style={style} {...props} />;
};

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0] || {};

  return (
    <div className="custom-select-wrapper" ref={selectRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="custom-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem 1.2rem',
          borderRadius: '12px',
          border: isOpen ? '1.5px solid var(--gold)' : '1.5px solid #e2e8f0',
          background: isOpen ? '#fff' : '#f8fafc',
          color: 'var(--text-dark)',
          fontWeight: '600',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? '0 0 0 3px rgba(184, 134, 11, 0.1)' : 'none'
        }}
      >
        <span>{selectedOption.label || placeholder}</span>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#475569' }} />
      </div>
      
      {isOpen && (
        <div 
          className="custom-select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            maxHeight: '250px',
            overflowY: 'auto',
            animation: 'slideDown 0.2s ease forwards'
          }}
        >
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '0.8rem 1.2rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontWeight: value === opt.value ? '700' : '600',
                fontSize: '0.95rem',
                color: value === opt.value ? 'var(--primary-color)' : 'var(--text-dark)',
                background: value === opt.value ? 'rgba(184, 134, 11, 0.08)' : 'transparent',
                borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-dark)';
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getProductCategories = (product) => {
  const source = product?.categories ?? product?.category ?? '';
  let values = [];

  if (Array.isArray(source)) {
    values = source;
  } else if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        values = Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        values = [trimmed];
      }
    } else {
      values = trimmed.split(',').map(item => item.trim());
    }
  }

  const seen = new Set();
  return values
    .map(value => String(value || '').trim())
    .filter(value => value && !seen.has(value) && seen.add(value));
};

const productBelongsToCategory = (product, categoryName) => {
  const categories = getProductCategories(product);
  return categories.includes(categoryName);
};

const getVariantStock = (parsedOpts, productStock, color, size) => {
  let variantName = '';
  if (color && size) variantName = `${color.trim()} - ${size.trim()}`;
  else if (color) variantName = color.trim();
  else if (size) variantName = size.trim();

  if (variantName && parsedOpts?.variantStock) {
    const keys = Object.keys(parsedOpts.variantStock);
    const normalizedTarget = variantName.replace(/\s+/g, ' ').trim();
    const exactKey = keys.find(k => k.replace(/\s+/g, ' ').trim() === normalizedTarget);
    
    if (exactKey && parsedOpts.variantStock[exactKey] !== undefined && parsedOpts.variantStock[exactKey] !== '') {
      return Number(parsedOpts.variantStock[exactKey]);
    } else if (keys.length > 0) {
      // If variantStock map exists and has keys, but this specific variant is missing, assume 0 stock
      return 0;
    }
  }
  return productStock !== undefined ? productStock : 100;
};

const isColorInStock = (parsedOpts, productStock, color) => {
  if (!parsedOpts.sizes || parsedOpts.sizes.length === 0) {
    return getVariantStock(parsedOpts, productStock, color, null) > 0;
  }
  return parsedOpts.sizes.some(sz => getVariantStock(parsedOpts, productStock, color, sz) > 0);
};

const isSizeInStock = (parsedOpts, productStock, color, size) => {
  if (!color) return getVariantStock(parsedOpts, productStock, null, size) > 0;
  return getVariantStock(parsedOpts, productStock, color, size) > 0;
};

const getOptionLabel = (product, type, index, fallback) => {
  const labels = product?.option_labels?.[type];
  const label = Array.isArray(labels) ? labels[index] : '';
  return typeof label === 'string' && label.trim() ? label : fallback;
};

const getVariantDetails = (product, parsedOpts, colorIndex, sizeIndex) => {
  const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
  const hasSizes = Array.isArray(parsedOpts.sizes) && parsedOpts.sizes.length > 0;
  const color = (hasColors && colorIndex !== null) ? parsedOpts.colors[colorIndex] : '';
  const size = (hasSizes && sizeIndex !== null) ? parsedOpts.sizes[sizeIndex] : '';
  const colorLabel = (hasColors && colorIndex !== null) ? getOptionLabel(product, 'colors', colorIndex, color) : '';
  const sizeLabel = (hasSizes && sizeIndex !== null) ? getOptionLabel(product, 'sizes', sizeIndex, size) : '';

  if (hasColors && hasSizes) {
    return {
      variantName: `${color} - ${size}`,
      variantLabel: `${colorLabel} - ${sizeLabel}`
    };
  }
  if (hasColors) return { variantName: color, variantLabel: colorLabel };
  if (hasSizes) return { variantName: size, variantLabel: sizeLabel };
  return { variantName: '', variantLabel: '' };
};

const ProductCard = ({ product, addToCart, undoAddToCart, handleProductClick, viewOnly = false }) => {
  let parsedOpts = {};
  if (product.options) {
    try {
      parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
      if (Array.isArray(parsedOpts)) {
        parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
      }
    } catch (e) {}
  }
  
  const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
  const hasSizes = Array.isArray(parsedOpts.sizes) && parsedOpts.sizes.length > 0;
  
  const getInitialColorIndex = () => {
    if (!hasColors) return 0;
    return null;
  };

  const getInitialSizeIndex = (colorIdx) => {
    if (!hasSizes) return 0;
    const col = (hasColors && colorIdx !== null) ? parsedOpts.colors[colorIdx] : null;
    const idx = parsedOpts.sizes.findIndex(s => isSizeInStock(parsedOpts, product.stock, col, s));
    return idx !== -1 ? idx : 0;
  };

  const initialColorIdx = getInitialColorIndex();
  const [selectedColorIndex, setSelectedColorIndex] = useState(initialColorIdx);
  const [hasInteractedWithColor, setHasInteractedWithColor] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(getInitialSizeIndex(initialColorIdx));
  const [justAdded, setJustAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const { t } = useLanguage();
  const tracker = useTracker();
  const showCardOptions = !viewOnly && !isMobile;
  const shouldOpenProductFirst = viewOnly || isMobile;

  let productImagesParsed = [];
  if (product.images) {
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      productImagesParsed = Array.isArray(parsed) ? parsed : [];
    } catch(e) {}
  }

  const getImageUrlByColor = (colorName) => {
    if (!colorName) return productImagesParsed[0]?.url || productImagesParsed[0] || product.image || 'https://via.placeholder.com/300';
    const matchedObj = productImagesParsed.find(img => typeof img === 'object' && img.color === colorName);
    if (matchedObj) return matchedObj.url;
    const firstStr = productImagesParsed.find(img => typeof img === 'string');
    if (firstStr) return firstStr;
    const firstObj = productImagesParsed.find(img => typeof img === 'object' && img.url);
    if (firstObj) return firstObj.url;
    return product.image || 'https://via.placeholder.com/300';
  };

  const currentPrice = product.price;
  let currentOldPrice = product.old_price;
  const hasDiscount = currentOldPrice && Number(currentOldPrice) > Number(currentPrice);
  const categoryLabel = Array.isArray(product.category_names) && product.category_names.length
    ? product.category_names[0]
    : getProductCategories(product)[0];

  const { variantName, variantLabel } = getVariantDetails(product, parsedOpts, selectedColorIndex, selectedSizeIndex);

  const currentVariantStock = (parsedOpts.variantStock && parsedOpts.variantStock[variantName] !== undefined && parsedOpts.variantStock[variantName] !== '') 
    ? Number(parsedOpts.variantStock[variantName]) 
    : (product.stock !== undefined ? product.stock : 100);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (hasColors && selectedColorIndex === null) {
      handleProductClick(product);
      return;
    }
    if(addToCart) {
      addToCart({
        product, 
        quantity: 1, 
        optionIndex: `${selectedColorIndex}-${selectedSizeIndex}`, 
        currentPrice, 
        variantName,
        variantLabel,
        selectedImage: getImageUrlByColor(hasColors && selectedColorIndex !== null ? parsedOpts.colors[selectedColorIndex] : null)
      });
      
      tracker.trackAddToCart({ ...product, price: currentPrice });
    }
    setJustAdded(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setTimeout(() => setJustAdded(false), 6000); // Revert back to Add button after 6 seconds
  };

  return (
    <div 
      className="premium-card-container animate-up" 
      onClick={() => handleProductClick(product)} 
    >
      <div className="premium-card-image-wrap">
        {(product.is_offer === 1 || product.is_offer === true) && (
          <span className="product-badge-hot">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
            Hot
          </span>
        )}
        {hasDiscount && <span className="product-badge-discount">{t('products.discountBadge')}</span>}
        {categoryLabel && <span className="product-badge-category">{categoryLabel}</span>}

        
        {showToast && (
          <div className="added-toast">
            <CheckCircle size={22} />
            {t('products.addedToast')}
          </div>
        )}

        {currentVariantStock <= 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <span style={{ background: '#ef4444', color: 'white', padding: '0.3rem 0.9rem', fontWeight: '800', fontSize: '0.8rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{t('products.outOfStock')}</span>
          </div>
        )}

        {currentVariantStock > 0 && currentVariantStock <= 10 && (
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 5 }}>
            <span style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#d97706', padding: '0.4rem 0.8rem', fontWeight: '900', fontSize: '0.85rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>{t('products.lowStock', { stock: currentVariantStock })}</span>
          </div>
        )}

        <ProductMedia 
          key={`card-img-${selectedColorIndex}`} 
          src={hasInteractedWithColor ? getImageUrlByColor(hasColors ? parsedOpts.colors[selectedColorIndex] : null) : (product.image || getImageUrlByColor(hasColors ? parsedOpts.colors[selectedColorIndex] : null))} 
          alt={product.title} 
          className="floating-product-img animate-slide-left" 
        />
      </div>
      
      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>
      
        {showCardOptions && hasColors && (
          <div className="product-card-option-group" onClick={(e) => e.stopPropagation()}>
            <span className="product-card-option-label">{t('products.modalColorLabel')}</span>
            <div className="product-card-options">
              {parsedOpts.colors.map((col, idx) => {
                const disabled = !isColorInStock(parsedOpts, product.stock, col);
                return (
                  <button
                    type="button"
                    key={idx}
                    disabled={disabled}
                    className={`product-card-option color-option ${selectedColorIndex === idx ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColorIndex(idx);
                      setHasInteractedWithColor(true);
                      if (hasSizes && !isSizeInStock(parsedOpts, product.stock, col, parsedOpts.sizes[selectedSizeIndex])) {
                        const firstAvailableSize = parsedOpts.sizes.findIndex(sz => isSizeInStock(parsedOpts, product.stock, col, sz));
                        if (firstAvailableSize !== -1) setSelectedSizeIndex(firstAvailableSize);
                      }
                    }}
                  >
                    {getOptionLabel(product, 'colors', idx, col)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {showCardOptions && hasSizes && (
          <div className="product-card-option-group" onClick={(e) => e.stopPropagation()}>
            <span className="product-card-option-label">{t('products.modalSizeLabel')}</span>
            <div className="product-card-options">
              {parsedOpts.sizes.map((sz, idx) => {
                const disabled = !isSizeInStock(parsedOpts, product.stock, hasColors ? parsedOpts.colors[selectedColorIndex] : null, sz);
                return (
                  <button
                    type="button"
                    key={idx}
                    disabled={disabled}
                    className={`product-card-option size-option ${selectedSizeIndex === idx ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => setSelectedSizeIndex(idx)}
                  >
                    {getOptionLabel(product, 'sizes', idx, sz)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="product-card-price-row">
          <span className="current-price">{currentPrice} <span className="currency">{t('products.currency')}</span></span>
          {hasDiscount && (
            <span className="old-price">{currentOldPrice}</span>
          )}
        </div>

        <div style={{ width: '100%' }}>
          {currentVariantStock <= 0 ? (
            <button 
              disabled
              className="product-card-add-btn"
              style={{ background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
            >
              {t('products.outOfStock')}
            </button>
          ) : !justAdded ? (
            shouldOpenProductFirst ? (
              <button 
                onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                className="product-card-add-btn"
                title={t('products.viewProduct')}
              >
                <Eye className="cart-icon" size={20} strokeWidth={2.5} /> <span className="btn-text">{t('products.viewProduct')}</span>
              </button>
            ) : (
              <button 
                
                className="product-card-add-btn"
                title={t('products.addToCartTitle')}
                style={{ background: '#25D366', color: 'white', border: 'none' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const text = encodeURIComponent(`مرحباً، أود طلب عرض سعر وتوريد للمنتج: ${product.title}`);
                  window.open(`https://api.whatsapp.com/send?phone=201127847539&text=${text}`, '_blank');
                }}
              >
                <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  تواصل عبر الواتساب
                </span>
              </button>
            )
          ) : (
            <div style={{ display: 'flex', width: '100%', gap: '0.8rem', animation: 'fade-in 0.3s ease-out' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-cart')); }}
                style={{ flex: 1, background: '#10b981', border: 'none', borderRadius: '16px', padding: '1rem', color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'; }}
              >
                <ShoppingCart size={18} /> {t('products.goToCart')}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); if(undoAddToCart) undoAddToCart(product.id, `${selectedColorIndex}-${selectedSizeIndex}`); setJustAdded(false); }}
                style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '16px', width: '60px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.transform = 'translateY(0)'; }}
                title={t('products.undo')}
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const ProductCarousel = ({ products, addToCart, undoAddToCart, handleProductClick, autoSlideInterval }) => {
  const scrollRef = React.useRef(null);
  const interactingRef = React.useRef(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollAction = (direction) => {
    if (!scrollRef.current) return;
    const item = scrollRef.current.querySelector('.product-carousel-item');
    if (!item) return;
    const gapStyle = window.getComputedStyle(scrollRef.current).gap;
    const gap = (gapStyle && gapStyle !== 'normal' && !isNaN(parseFloat(gapStyle))) ? parseFloat(gapStyle) : 16;
    const scrollAmount = item.offsetWidth + gap;
    scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (products.length <= 1) return;
    
    if (!autoSlideInterval) return;
      const interval = setInterval(() => {
        if (interactingRef.current || !scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (Math.abs(scrollLeft) + clientWidth >= scrollWidth - 50) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          scrollAction(-1);
        }
      }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isMobile, products.length]);

  const displayProducts = Array(12).fill(products).flat();

  return (
    <div 
      className="carousel-wrapper" 
      style={{ position: 'relative', width: '100%', minWidth: 0 }}
    >
      {!isMobile && (
        <button className="carousel-arrow right-arrow" onClick={() => scrollAction(1)} style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #e2e8f0', color: 'var(--primary-color)' }}>
          <ChevronRight size={24} />
        </button>
      )}
      
      <div 
        className="product-carousel-container" 
        ref={scrollRef} 
        onMouseEnter={() => { interactingRef.current = true; }}
        onMouseLeave={() => { interactingRef.current = false; }}
        onTouchStart={() => { interactingRef.current = true; }}
        onTouchEnd={() => { interactingRef.current = false; }}
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          overflowY: 'hidden', 
          gap: '0.8rem', 
          padding: '1rem', 
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none',
          width: '100%'
        }}
      >
        {displayProducts.map((product, idx) => (
          <div 
            className="product-carousel-item" 
            key={`carousel-${idx}-${product.id}`} 
            style={{ 
              flex: '0 0 auto', 
              width: isMobile ? '43vw' : '260px', 
              scrollSnapAlign: 'start' 
            }}
          >
             <ProductCard product={product} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} viewOnly />
          </div>
        ))}
      </div>

      {!isMobile && (
        <button className="carousel-arrow left-arrow" onClick={() => scrollAction(-1)} style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #e2e8f0', color: 'var(--primary-color)' }}>
          <ChevronLeft size={24} />
        </button>
      )}
    </div>
  );
};

const Products = ({ cartItems, addToCart, undoAddToCart, searchQuery = '', offersOnly = false, homepageSections = false, mostDemandedOnly = false, currentPage = 'store' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const tracker = useTracker();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  const modalScrollRef = React.useRef(null);
  const lightboxScrollRef = React.useRef(null);
  const isScrollingRef = React.useRef(false);
  const isThumbnailClickRef = React.useRef(false);
  const thumbnailClickTimeoutRef = React.useRef(null);

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterSortPrice, setFilterSortPrice] = useState('default');
  const [selectionError, setSelectionError] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('product-modal-state-change', { detail: !!selectedProduct }));
    if (selectedProduct) {
      setTimeout(() => {
        const modalInner = document.querySelector('.modal-inner-layout');
        if (modalInner) {
          modalInner.scrollTo({ top: 0, behavior: 'smooth' });
          modalInner.scrollTop = 0;
        }
        if (modalScrollRef.current) {
          modalScrollRef.current.scrollTo({ left: 0 });
        }
      }, 50);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const isRtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl' || document.body.style.direction === 'rtl';
    const multiplier = isRtl ? -1 : 1;
    
    if (modalScrollRef.current && !isScrollingRef.current) {
      const width = modalScrollRef.current.clientWidth;
      modalScrollRef.current.scrollTo({ left: activeImageIndex * width * multiplier, behavior: 'smooth' });
    }
    if (lightboxScrollRef.current && !isScrollingRef.current) {
      const width = lightboxScrollRef.current.clientWidth;
      lightboxScrollRef.current.scrollTo({ left: activeImageIndex * width * multiplier, behavior: 'smooth' });
    }
  }, [activeImageIndex]);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJsonCached(`/api/products?lang=${encodeURIComponent(language)}`),
      fetchJsonCached(`/api/categories?lang=${encodeURIComponent(language)}`)
    ])
    .then(([productsData, categoriesData]) => {
      const nextProducts = Array.isArray(productsData) ? productsData : [];
      setProducts(nextProducts);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSelectedProduct(current => (
        current ? nextProducts.find(product => Number(product.id) === Number(current.id)) || current : current
      ));
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching data", err);
      setLoading(false);
    });
  }, [language]);

  useEffect(() => {
    if (products.length === 0) return;

    const handleUrl = () => {
      let product = null;
      if (window.location.pathname.startsWith('/product/')) {
        const pathParts = window.location.pathname.split('/');
        const lastPart = decodeURIComponent(pathParts[pathParts.length - 1]);
        product = products.find(p => p.title.replace(/\s+/g, '-') === lastPart || p.title === lastPart);
        if (!product) {
          const lastDash = lastPart.lastIndexOf('-');
          const productIdStr = lastDash !== -1 ? lastPart.substring(lastDash + 1) : lastPart;
          product = products.find(p => p.id === parseInt(productIdStr));
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const productParam = params.get('product');
        if (productParam) {
          product = products.find(p => p.title === productParam);
        }
      }

      if (product) {
        if (!selectedProduct || selectedProduct.id !== product.id) {
          setSelectedProduct(product);
          
          let initialImgIdx = 0;
          let parsedOpts = {};
          if (product.options) {
            try {
              parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
              if (Array.isArray(parsedOpts)) {
                parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
              }
            } catch (e) {}
          }
          const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
          if (hasColors) {
            const firstColor = parsedOpts.colors[0];
            let productImagesParsed = [];
            if (product.images) {
              try {
                const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                productImagesParsed = Array.isArray(parsed) ? parsed : [];
              } catch(e) {}
            }
            const imgIdx = productImagesParsed.findIndex(img => typeof img === 'object' && img.color === firstColor);
            if (imgIdx !== -1) {
              initialImgIdx = imgIdx;
            }
          }

          setActiveImageIndex(initialImgIdx);
          setSelectedColorIndex(0);
          setSelectedSizeIndex(0);
          setOrderQuantity(1);
          setAddedToCart(false);
        }
      } else {
        setSelectedProduct(null);
      }
    };

    handleUrl();

    window.addEventListener('popstate', handleUrl);
    return () => window.removeEventListener('popstate', handleUrl);
  }, [products]);

  const levenshtein = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const isFuzzyMatch = (query, text) => {
    if (!text) return false;
    const qWords = query.toLowerCase().trim().split(/\s+/);
    const tWords = text.toLowerCase().split(/\s+/);

    return qWords.every(qWord => {
      // Ignore very short words from fuzzy matching
      return tWords.some(tWord => {
        if (tWord.includes(qWord)) return true;
        const maxTypos = qWord.length <= 3 ? 0 : (qWord.length <= 5 ? 1 : 2);
        if (maxTypos === 0) return false;
        if (Math.abs(tWord.length - qWord.length) > maxTypos + 1) return false; // Allow slight length differences
        return levenshtein(qWord, tWord) <= maxTypos;
      });
    });
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    
    return isFuzzyMatch(searchQuery, p.title) || 
           (p.description && isFuzzyMatch(searchQuery, p.description)) ||
           (p.category && isFuzzyMatch(searchQuery, p.category)) ||
           (p.category_name && isFuzzyMatch(searchQuery, p.category_name)) ||
           getProductCategories(p).some(category => isFuzzyMatch(searchQuery, category)) ||
           (Array.isArray(p.category_names) && p.category_names.some(category => isFuzzyMatch(searchQuery, category)));
  });

  // Featured products can just be the first 4 products for now
  const featuredProducts = filteredProducts.slice(0, 4);
  const offerProducts = filteredProducts.filter(p => p.is_offer === 1 || p.is_offer === true);
  const isProductAvailable = (product) => {
    let parsedOpts = {};
    if (product.options) {
      try {
        parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
      } catch (e) {}
    }

    if (parsedOpts?.variantStock && Object.keys(parsedOpts.variantStock).length > 0) {
      return Object.values(parsedOpts.variantStock).some(value => Number(value) > 0);
    }

    return product.stock === undefined || product.stock === null || Number(product.stock) > 0;
  };

  const getProductDateValue = (product) => {
    const dateValue = product.created_at ? new Date(product.created_at).getTime() : 0;
    return Number.isNaN(dateValue) ? 0 : dateValue;
  };

  const mostDemandedProducts = [...filteredProducts]
    .filter(isProductAvailable)
    .filter(p => p.is_offer === 1 || p.is_offer === true);


  const latestProducts = [...filteredProducts]
    .filter(isProductAvailable)
    .filter(p => p.is_offer !== 1 && p.is_offer !== true)
    .sort((a, b) => {
      const sortA = Number(a.sort_order) || 0;
      const sortB = Number(b.sort_order) || 0;
      const effA = sortA === 0 ? 999999 : sortA;
      const effB = sortB === 0 ? 999999 : sortB;
      if (effA !== effB) return effA - effB;
      return Number(b.id) - Number(a.id);
    })
    .slice(0, 8);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    
    let initColorIdx = 0;
    let initSizeIdx = 0;
    let initialImgIdx = 0;
    let parsedOpts = {};
    
    if (product.options) {
      try {
        parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
        if (Array.isArray(parsedOpts)) {
          parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
        }
      } catch (e) {}
    }
    
    const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
    const hasSizes = Array.isArray(parsedOpts.sizes) && parsedOpts.sizes.length > 0;

    if (hasColors) {
      initColorIdx = null;
      initialImgIdx = 0; // Default to main image
    }
    
    if (hasSizes) {
      const col = (hasColors && initColorIdx !== null) ? parsedOpts.colors[initColorIdx] : null;
      initSizeIdx = parsedOpts.sizes.findIndex(s => isSizeInStock(parsedOpts, product.stock, col, s));
      if (initSizeIdx === -1) initSizeIdx = 0;
    }

    setActiveImageIndex(initialImgIdx);
    setSelectedColorIndex(initColorIdx);
    setSelectionError(false);
    setSelectedSizeIndex(initSizeIdx);
    setOrderQuantity(1);
    setAddedToCart(false);
    
    // Update URL and Title
    const productSlug = product.title ? encodeURIComponent(product.title.replace(/\s+/g, '-')) : 'item';
    window.history.pushState({ productId: product.id }, '', `/product/${productSlug}`);
    document.title = `${t('app.pageTitle')} - ${product.title}`;

    // Track ViewContent event
    tracker.trackViewContent({ ...product, price: product.price });

    // Increment view count
    fetch(`/api/products/${product.id}/view`, { method: 'PUT' }).catch(console.error);
  };

  const handleScrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setAddedToCart(false);
    setShowLightbox(false);
    setLightboxZoomed(false);
    setSelectionError(false);
    const returnPath = currentPage === 'home' ? '/' : `/${currentPage}`;
    window.history.pushState({}, '', returnPath);
    document.title = t('app.pageTitle');
  };

  const handleAddToCartClick = () => {
    let parsedOpts = {};
    if (selectedProduct.options) {
      try {
        parsedOpts = typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options;
        if (Array.isArray(parsedOpts)) {
          parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
        }
      } catch(e){}
    }
    const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
    if (hasColors && selectedColorIndex === null) {
      setSelectionError(true);
      setTimeout(() => setSelectionError(false), 3000);
      return;
    }
    const currentPrice = selectedProduct.price;
    
    const { variantName, variantLabel } = getVariantDetails(selectedProduct, parsedOpts, selectedColorIndex, selectedSizeIndex);

    let productImagesParsed = [];
    if (selectedProduct.images) {
      try {
        const parsed = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
        productImagesParsed = Array.isArray(parsed) ? parsed : [];
      } catch(e) {}
    }
    let displayUrls = productImagesParsed.map(img => typeof img === 'object' ? img.url : img);
    if (!Array.isArray(displayUrls) || displayUrls.length === 0) {
      displayUrls = [selectedProduct.image || 'https://via.placeholder.com/600'];
    }
    const selectedImage = displayUrls[activeImageIndex] || displayUrls[0];

    addToCart({
      product: selectedProduct,
      quantity: orderQuantity,
      optionIndex: `${selectedColorIndex}-${selectedSizeIndex}`,
      currentPrice,
      variantName,
      variantLabel,
      selectedImage
    });

    tracker.trackAddToCart({ ...selectedProduct, price: currentPrice });

    setAddedToCart(true);
    setTimeout(() => {
      closeProductModal();
    }, 1500);
  };





  if (offersOnly && offerProducts.length === 0) {
    return null;
  }

  if (mostDemandedOnly && mostDemandedProducts.length === 0) {
    return null;
  }

  return (
    <section className="products" style={{ padding: '0.5rem 0' }}>
      <div className="container">
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div style={{ animation: 'float 2s infinite', display: 'flex', justifyContent: 'center' }}><Package size={48} color="var(--primary-color)" /></div>
            <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('products.loading')}</p>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>{t('products.storeBadge')} <ShoppingCart size={16} /></div>
                <h2 className="section-title" style={{ marginTop: '1rem', fontSize: '3rem' }}>{t('products.storeEmpty')}</h2>
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'var(--white)', borderRadius: '30px', boxShadow: 'var(--shadow-md)', marginTop: '2rem' }}>
                  <div style={{ opacity: '0.5', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><ShoppingBag size={64} /></div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>{t('products.noProducts')}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{t('products.addFromAdmin')}</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="section-title" style={{ marginTop: '1rem', fontSize: '3rem' }}>{t('products.noResults')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>{t('products.noResultsFor').replace('{query}', searchQuery)}</p>
              </div>
            ) : (
              <>
                {/* Stunning Store Header */}
                {!offersOnly && !homepageSections && !mostDemandedOnly && (
                  <div className="luxury-store-header">
                    <h1 className="luxury-store-title" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: t('products.storeWelcomeHtml') }}></h1>
                    <p className="luxury-store-desc">{t('products.storeWelcomeDesc')}</p>
                    <div className="luxury-divider"></div>
                  </div>
                )}

                {/* Offers Section */}
                {offersOnly && offerProducts.length > 0 && (
                  <div className="luxury-offers-wrapper" style={{ width: '100%' }}>
                    <div className="luxury-offers-header">
                      <span className="luxury-subtitle"><Flame size={16} /> {t('products.offersSubtitle')}</span>
                      <h2 className="luxury-section-title" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: t('products.offersTitleHtml') }}></h2>
                      <p className="luxury-desc" style={{marginBottom: 0}}>{t('products.offersDesc')}</p>
                      <div className="luxury-divider"></div>
                    </div>
                    <div className="product-grid">
                      {offerProducts.map((product) => (
                        <ProductCard key={`offer-${product.id}`} product={product} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Most Demanded Section */}
                {mostDemandedOnly && mostDemandedProducts.length > 0 && (
                  <div className="luxury-offers-wrapper" style={{ width: '100%' }}>
                    <div className="luxury-offers-header">
                      <h2 className="luxury-section-title" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: t('products.mostDemandedTitleHtml') }}></h2>
                      <p className="luxury-desc" style={{marginBottom: 0}}>{t('products.mostDemandedDesc')}</p>
                      <div className="luxury-divider"></div>
                    </div>
                    <div className="product-grid most-demanded-grid">
                      {mostDemandedProducts.map((product) => (
                        <ProductCard key={`demanded-${product.id}`} product={product} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} viewOnly />
                      ))}
                    </div>
                  </div>
                )}

                {/* Homepage Sections */}
                {homepageSections && (
                  <div className="homepage-sections-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem', width: '100%' }}>
                    {mostDemandedProducts.length > 0 && (
                      <div className="luxury-offers-wrapper" style={{ marginBottom: 0, width: '100%' }}>
                        <div className="luxury-offers-header">
                          <h2 className="luxury-section-title" dangerouslySetInnerHTML={{ __html: t('products.mostDemandedTitleHtml') || 'الأكثر مبيعاً' }}></h2>
                          <div className="luxury-divider"></div>
                        </div>
                        <ProductCarousel products={mostDemandedProducts} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} autoSlideInterval={2500} />
                      </div>
                    )}
                    
                    {/* Latest Products */}
                    {latestProducts.length > 0 && (
                      <div className="luxury-offers-wrapper" style={{ marginBottom: 0, width: '100%' }}>
                        <div className="luxury-offers-header">
                          <h2 className="luxury-section-title" dangerouslySetInnerHTML={{ __html: t('products.latestProductsTitleHtml') || 'أحدث المنتجات' }}></h2>
                          <div className="luxury-divider"></div>
                        </div>
                        <ProductCarousel products={latestProducts} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} autoSlideInterval={0} />
                      </div>
                    )}
                  </div>
                )}

                {!offersOnly && !homepageSections && !mostDemandedOnly && (
                  <>
                    <div className="premium-filters-wrapper">
                      <div className="premium-filter-group">
                        <label>{t('products.filterCategory') || 'القسم'}</label>
                        <div style={{ display: 'flex', width: '100%' }}>
                          <CustomSelect 
                            value={filterCategory} 
                            onChange={setFilterCategory} 
                            placeholder={t('products.allCategories') || 'كل الأقسام'}
                            options={[
                              { value: 'all', label: t('products.allCategories') || 'كل الأقسام' },
                              ...categories.map(c => ({ value: c.source_name || c.name, label: c.name }))
                            ]}
                          />
                        </div>
                      </div>
                      
                      <div className="premium-filter-group">
                        <label>{t('products.filterStock') || 'حالة المخزون'}</label>
                        <div style={{ display: 'flex', width: '100%' }}>
                          <CustomSelect 
                            value={filterStock} 
                            onChange={setFilterStock} 
                            placeholder={t('products.allStock') || 'الكل'}
                            options={[
                              { value: 'all', label: t('products.allStock') || 'الكل' },
                              { value: 'in_stock', label: t('products.inStock') || 'متوفر في المخزون' },
                              { value: 'out_stock', label: t('products.outOfStock') || 'نفذ من المخزون' }
                            ]}
                          />
                        </div>
                      </div>

                      <div className="premium-filter-group">
                        <label>{t('products.filterPrice') || 'تصفية بالسعر'}</label>
                        <div style={{ display: 'flex', width: '100%' }}>
                          <CustomSelect 
                            value={filterSortPrice} 
                            onChange={setFilterSortPrice} 
                            placeholder={t('products.priceDefault') || 'الافتراضي'}
                            options={[
                              { value: 'default', label: t('products.priceDefault') || 'الافتراضي' },
                              { value: 'low_to_high', label: t('products.priceLowHigh') || 'من الأقل للأعلى' },
                              { value: 'high_to_low', label: t('products.priceHighLow') || 'من الأعلى للأقل' }
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filtered Grid (Sorted from Newest to Oldest) */}
                    <div className="luxury-category-section first-category" style={{ scrollMarginTop: '150px' }}>
                      <div className="product-grid">
                        {(() => {
                          let result = [...filteredProducts];
                          
                          if (filterCategory !== 'all') {
                            result = result.filter(p => productBelongsToCategory(p, filterCategory));
                          }
                          
                          if (filterStock === 'in_stock') {
                            result = result.filter(isProductAvailable);
                          } else if (filterStock === 'out_stock') {
                            result = result.filter(p => !isProductAvailable(p));
                          }

                          if (filterSortPrice === 'low_to_high') {
                            result.sort((a, b) => Number(a.price) - Number(b.price));
                          } else if (filterSortPrice === 'high_to_low') {
                            result.sort((a, b) => Number(b.price) - Number(a.price));
                          } else {
                            // Default: Newest to Oldest

                          }
                          
                          if (result.length === 0) {
                            return <p style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>{t('products.noFilterResults') || 'لا توجد منتجات تطابق عوامل التصفية.'}</p>;
                          }

                          // Remove duplicate products by ID just in case
                          const uniqueProducts = [];
                          const seenIds = new Set();
                          for (const p of result) {
                            if (!seenIds.has(p.id)) {
                              seenIds.add(p.id);
                              uniqueProducts.push(p);
                            }
                          }

                          return uniqueProducts.map((product) => (
                            <ProductCard key={`product-${product.id}`} product={product} addToCart={addToCart} undoAddToCart={undoAddToCart} handleProductClick={handleProductClick} />
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="premium-modal-overlay" onClick={closeProductModal}>
          <div className="premium-modal-content product-detail-modal animate-up" onClick={e => e.stopPropagation()}>
            <button onClick={closeProductModal} className="premium-modal-close-btn">×</button>
            
            <div className="modal-inner-layout product-detail-layout">
              <div className="product-detail-main">
              {/* Image Side */}
              <div className="modal-image-side">
                {(() => {
                  let productImagesParsed = [];
                  if (selectedProduct.images) {
                    try {
                      const parsed = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
                      productImagesParsed = Array.isArray(parsed) ? parsed : [];
                    } catch(e) {}
                  }
                  
                  let displayUrls = productImagesParsed.map(img => typeof img === 'object' ? img.url : img);
                  
                  if (!Array.isArray(displayUrls) || displayUrls.length === 0) {
                    if (selectedProduct.image) displayUrls = [selectedProduct.image];
                    else displayUrls = ['https://via.placeholder.com/600'];
                  }
                  

                      
                  return (
                    <>
                      <div 
                        className="modal-image-zoom-wrapper hide-scrollbar"
                        ref={modalScrollRef}
                        onScroll={(e) => {
                          if (isThumbnailClickRef.current) return;
                          const scrollLeft = Math.abs(e.target.scrollLeft);
                          const width = e.target.clientWidth;
                          const index = Math.round(scrollLeft / width);
                          if (index !== activeImageIndex && index >= 0 && index < displayUrls.length) {
                            isScrollingRef.current = true;
                            setActiveImageIndex(index);
                            setTimeout(() => { isScrollingRef.current = false; }, 100);
                          }
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          overflowX: 'auto',
                          scrollSnapType: 'x mandatory',
                          width: '100%',
                          scrollBehavior: 'smooth',
                          WebkitOverflowScrolling: 'touch',
                          flexWrap: 'nowrap',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}
                      >
                        {displayUrls.map((url, i) => (
                          <div key={i} style={{ flex: 'none', width: '100%', minWidth: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <ProductMedia
                              className="modal-main-product-image"
                              src={url}
                              alt={selectedProduct.title}
                              onClick={() => setShowLightbox(true)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                              style={{ ...zoomStyle, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              zoomable
                            />
                          </div>
                        ))}
                      </div>
                      
                      {displayUrls.length > 1 && (
                        <div className={`modal-thumbnails-container ${displayUrls.length > 4 ? 'align-start' : ''}`}>
                          {displayUrls.map((url, idx) => (
                            <ProductMedia
                              key={idx}
                              src={url}
                              alt={`Thumbnail ${idx}`}
                              onClick={() => {
                                isThumbnailClickRef.current = true;
                                setActiveImageIndex(idx);
                                clearTimeout(thumbnailClickTimeoutRef.current);
                                thumbnailClickTimeoutRef.current = setTimeout(() => {
                                  isThumbnailClickRef.current = false;
                                }, 600);
                              }}
                              className={`modal-thumbnail ${activeImageIndex === idx ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* Content Side */}
              <div className="product-details-content modal-content-side">
                <div className="modal-header-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <div className="modal-badge-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {getProductCategories(selectedProduct).length > 0 && <span style={{ background: '#ffffff', color: 'var(--primary-color)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '900', width: 'fit-content' }}>{(Array.isArray(selectedProduct.category_names) && selectedProduct.category_names.length ? selectedProduct.category_names : getProductCategories(selectedProduct))[0]}</span>}
                    {selectedProduct.badge && <span style={{ background: 'linear-gradient(135deg, #FFD700, #F5A623)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '14px', fontSize: '0.65rem', fontWeight: '600', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 4px 10px rgba(245, 166, 35, 0.3)' }}><Star size={10} fill="#fff" /> {selectedProduct.badge}</span>}
                    {(() => {
                      let parsedOpts = {};
                      if (selectedProduct.options) {
                        try {
                          parsedOpts = typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options;
                          if (Array.isArray(parsedOpts)) parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
                        } catch(e){}
                      }
                      const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
                      const hasSizes = Array.isArray(parsedOpts.sizes) && parsedOpts.sizes.length > 0;
                      let variantName = '';
                      if (hasColors && hasSizes) variantName = `${parsedOpts.colors[selectedColorIndex]} - ${parsedOpts.sizes[selectedSizeIndex]}`;
                      else if (hasColors) variantName = parsedOpts.colors[selectedColorIndex];
                      else if (hasSizes) variantName = parsedOpts.sizes[selectedSizeIndex];
                      
                      const currentVariantStock = (parsedOpts.variantStock && parsedOpts.variantStock[variantName] !== undefined && parsedOpts.variantStock[variantName] !== '') 
                        ? Number(parsedOpts.variantStock[variantName]) 
                        : (selectedProduct.stock !== undefined ? selectedProduct.stock : 100);

                      if (currentVariantStock <= 0) return <span style={{ background: '#fef2f2', color: '#ef4444', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '900', width: 'fit-content' }}>{t('products.outOfStock')}</span>;
                      if (currentVariantStock <= 10) return <span style={{ background: '#fffbeb', color: '#d97706', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.95rem', fontWeight: '900', width: 'fit-content', border: '1px solid #fcd34d' }}>{t('products.modalLimitedStock', { stock: currentVariantStock })}</span>;
                      return null;
                    })()}
                  </div>
                  <h2 className="modal-product-title" style={{ fontSize: '1.7rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.3', margin: '0' }}>{selectedProduct.title}</h2>
                  
                </div>
                
                {(() => {
                  let parsedOpts = {};
                  if (selectedProduct.options) {
                    try {
                      parsedOpts = typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options;
                      if (Array.isArray(parsedOpts)) {
                        parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
                      }
                    } catch(e){}
                  }
                  const hasColors = Array.isArray(parsedOpts.colors) && parsedOpts.colors.length > 0;
                  const hasSizes = Array.isArray(parsedOpts.sizes) && parsedOpts.sizes.length > 0;
                  
                  let variantName = '';
                  if (hasColors && hasSizes) variantName = `${parsedOpts.colors[selectedColorIndex]} - ${parsedOpts.sizes[selectedSizeIndex]}`;
                  else if (hasColors) variantName = parsedOpts.colors[selectedColorIndex];
                  else if (hasSizes) variantName = parsedOpts.sizes[selectedSizeIndex];
                  
                  const currentVariantStock = (parsedOpts.variantStock && parsedOpts.variantStock[variantName] !== undefined && parsedOpts.variantStock[variantName] !== '') 
                    ? Number(parsedOpts.variantStock[variantName]) 
                    : (selectedProduct.stock !== undefined ? selectedProduct.stock : 100);
                  
                  const currentPrice = selectedProduct.price;
                  let currentOldPrice = selectedProduct.old_price;
                  const hasDiscount = currentOldPrice && Number(currentOldPrice) > Number(currentPrice);

                  return (
                    <>
                      <div className="modal-price-box" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '800', marginBottom: '0.2rem' }}>{t('products.modalPriceLabel')}</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span className="modal-price-value" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary-color)', lineHeight: '1' }}>{currentPrice}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>{t('products.currency')}</span>
                          </div>
                        </div>
                        {hasDiscount && (
                          <div style={{ display: 'flex', flexDirection: 'column', marginRight: 'auto', alignItems: 'flex-end' }}>
                             <span className="modal-old-price" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.3rem', fontWeight: '800' }}>{currentOldPrice} {t('products.currency')}</span>
                             <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '10px', fontWeight: '900', fontSize: '0.85rem', marginTop: '0.3rem' }}>{t('products.modalAmazingSaving')}</span>
                          </div>
                        )}
                      </div>
                      
                      {addedToCart ? (
                        <div style={{ background: '#ecfdf5', color: '#059669', padding: '2rem', borderRadius: '20px', textAlign: 'center', marginTop: '1.5rem' }}>
                          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><ShoppingCart size={48} /></div>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('products.modalAddedToCart')}</h3>
                        </div>
                      ) : (
                        <div className="modal-options-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
                          
                          {hasColors && (
                            <div className="modal-option-section">
                              <label className="modal-section-label" style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '900', color: '#334155', fontSize: '1.1rem' }}>{t('products.modalColorLabel')}</label>
                              <div className="modal-option-list">
                                {parsedOpts.colors.map((col, idx) => {
                                  const disabled = !isColorInStock(parsedOpts, selectedProduct.stock, col);
                                  return (
                                  <div key={idx} onClick={disabled ? undefined : () => { 
                                    setSelectedColorIndex(idx); 
                                    setSelectionError(false);
                                    if (hasSizes && !isSizeInStock(parsedOpts, selectedProduct.stock, col, parsedOpts.sizes[selectedSizeIndex])) {
                                      const firstAvailableSize = parsedOpts.sizes.findIndex(sz => isSizeInStock(parsedOpts, selectedProduct.stock, col, sz));
                                      if (firstAvailableSize !== -1) setSelectedSizeIndex(firstAvailableSize);
                                    }
                                    let productImagesParsed = [];
                                    try {
                                      const parsed = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
                                      productImagesParsed = Array.isArray(parsed) ? parsed : [];
                                    } catch(e) {}
                                    const imgIdx = productImagesParsed.findIndex(img => typeof img === 'object' && img.color === col);
                                    if (imgIdx !== -1) setActiveImageIndex(imgIdx);
                                  }} className={`modal-option-pill ${selectedColorIndex === idx ? 'active' : ''}`} style={{ padding: '0.6rem 1.4rem', borderRadius: '20px', border: `2px solid ${selectedColorIndex === idx ? 'var(--primary-color)' : '#e2e8f0'}`, cursor: disabled ? 'not-allowed' : 'pointer', background: selectedColorIndex === idx ? '#ffffff' : (disabled ? '#f8fafc' : '#ffffff'), color: disabled ? '#cbd5e1' : (selectedColorIndex === idx ? 'var(--primary-color)' : '#475569'), opacity: disabled ? 0.6 : 1, textDecoration: disabled ? 'line-through' : 'none', fontWeight: '800', transition: 'all 0.2s', boxShadow: selectedColorIndex === idx ? '0 4px 15px rgba(181, 133, 0, 0.1)' : 'none' }}>
                                    {getOptionLabel(selectedProduct, 'colors', idx, col)}
                                  </div>
                                )})}
                              </div>
                            </div>
                          )}

                          {hasSizes && (
                            <div className="modal-option-section">
                              <label className="modal-section-label" style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '900', color: '#334155', fontSize: '1.1rem' }}>{t('products.modalSizeLabel')}</label>
                              <div className="modal-option-list">
                                {parsedOpts.sizes.map((sz, idx) => {
                                  const disabled = !isSizeInStock(parsedOpts, selectedProduct.stock, hasColors ? parsedOpts.colors[selectedColorIndex] : null, sz);
                                  return (
                                  <div key={idx} onClick={disabled ? undefined : () => setSelectedSizeIndex(idx)} className={`modal-option-pill ${selectedSizeIndex === idx ? 'active' : ''}`} style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: `2px solid ${selectedSizeIndex === idx ? 'var(--primary-color)' : '#e2e8f0'}`, cursor: disabled ? 'not-allowed' : 'pointer', background: selectedSizeIndex === idx ? '#ffffff' : (disabled ? '#f8fafc' : '#ffffff'), color: disabled ? '#cbd5e1' : (selectedSizeIndex === idx ? 'var(--primary-color)' : '#475569'), opacity: disabled ? 0.6 : 1, textDecoration: disabled ? 'line-through' : 'none', fontWeight: '800', transition: 'all 0.2s', boxShadow: selectedSizeIndex === idx ? '0 4px 15px rgba(181, 133, 0, 0.1)' : 'none' }}>
                                    {getOptionLabel(selectedProduct, 'sizes', idx, sz)}
                                  </div>
                                )})}
                              </div>
                              {parsedOpts.sizeDetails && parsedOpts.sizeDetails[parsedOpts.sizes[selectedSizeIndex]] && (
                                <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', border: '1px solid #e2e8f0', lineHeight: '1.5' }}>
                                  <span style={{ color: 'var(--primary-color)', display: 'flex', marginTop: '3px' }}><CheckCircle size={16} /></span>
                                  <span style={{ flex: 1, wordBreak: 'break-word' }}>{parsedOpts.sizeDetails[parsedOpts.sizes[selectedSizeIndex]]}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="modal-quantity-section">
                            <label className="modal-section-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '900', color: '#334155', fontSize: '1rem' }}>{t('products.modalQuantityLabel')}</label>
                            <div className="modal-quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '16px', width: 'fit-content', border: '1px solid #f1e8d9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                              <button type="button" className="modal-quantity-btn" disabled={currentVariantStock <= 0} onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ width: '35px', height: '35px', borderRadius: '12px', border: 'none', background: currentVariantStock <= 0 ? '#f1f5f9' : '#ffffff', fontSize: '1.2rem', cursor: currentVariantStock <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', color: '#475569', transition: 'all 0.2s' }}>-</button>
                              <span className="modal-quantity-value" style={{ fontSize: '1.1rem', fontWeight: '900', width: '25px', textAlign: 'center', color: '#0f172a' }}>{orderQuantity}</span>
                              <button type="button" className="modal-quantity-btn" disabled={currentVariantStock <= 0} onClick={() => setOrderQuantity(Math.min(currentVariantStock > 0 ? currentVariantStock : 1, orderQuantity + 1))} style={{ width: '35px', height: '35px', borderRadius: '12px', border: 'none', background: currentVariantStock <= 0 ? '#f1f5f9' : '#ffffff', fontSize: '1.2rem', cursor: currentVariantStock <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', color: '#475569', transition: 'all 0.2s' }}>+</button>
                            </div>
                          </div>

                          <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }}></div>

                          <div className="modal-action-button-wrap">
                            {currentVariantStock <= 0 ? (
                              <button type="button" disabled className="modal-add-cart-button disabled">
                                {t('products.outOfStock')}
                              </button>
                            ) : (
                              <button type="button" onClick={handleAddToCartClick} className="modal-add-cart-button" style={{ transform: selectionError ? 'scale(0.98)' : 'scale(1)', transition: 'transform 0.1s' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ShoppingCart size={20} strokeWidth={2.5} /> {t('products.modalAddToCart')}</span>
                                <span className="modal-add-cart-total">{currentPrice * orderQuantity} {t('products.currency')}</span>
                              </button>
                            )}
                            
                            {selectionError && (
                              <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#ef4444', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeInUp 0.3s ease' }}>
                                <AlertCircle size={18} />
                                {language === 'ar' ? 'يرجى اختيار اللون أولاً قبل الإضافة للسلة.' : 'Please select a color first.'}
                              </div>
                            )}
                          </div>

                          {/* Sleek Share Buttons Row */}
                          <div className="modal-share-row">
                            <span className="modal-share-label">{t('products.modalShareLabel')}</span>
                            <div className="modal-share-buttons">
                              <button type="button" className="modal-share-button whatsapp" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(t('products.shareText') + selectedProduct.title + '\n\n' + decodeURI(window.location.href))}`, '_blank')} title={t('products.shareWhatsapp')}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                <span>{t('products.shareWhatsapp')}</span>
                              </button>
                              <button type="button" className="modal-share-button facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(decodeURI(window.location.href))}`, '_blank')} title={t('products.shareFacebook')}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              </button>
                              <button type="button" className="modal-share-button twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('products.shareText') + selectedProduct.title)}&url=${encodeURIComponent(decodeURI(window.location.href))}`, '_blank')} title={t('products.shareTwitter')}>
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </button>
                              <button type="button" className="modal-share-button copy" onClick={(e) => { navigator.clipboard.writeText(decodeURI(window.location.href)); const btn = e.currentTarget; const oldHTML = btn.innerHTML; btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>'; btn.style.background = '#059669'; btn.style.color = 'white'; setTimeout(() => { btn.innerHTML = oldHTML; btn.style.background = ''; btn.style.color = ''; }, 2000); }} title={t('products.shareCopyLink')}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
{(() => {
                    const descImagesArr = [];
                    if (selectedProduct.description_images) {
                      try {
                        const parsed = typeof selectedProduct.description_images === 'string' ? JSON.parse(selectedProduct.description_images) : selectedProduct.description_images;
                        if (Array.isArray(parsed)) descImagesArr.push(...parsed);
                      } catch(e){}
                    }
                    if (descImagesArr.length === 0 && selectedProduct.description_image) {
                      descImagesArr.push(selectedProduct.description_image);
                    }

                    if (!selectedProduct.description && descImagesArr.length === 0) return null;

                    return (
                      <div className="modal-product-description-container" style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ width: '100%', height: '1px', background: '#e2e8f0', marginBottom: '0.5rem' }}></div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0' }}>{t('products.description') || 'الوصف'}</h3>
                        {selectedProduct.description && (
                          <p className="modal-product-description" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                            {selectedProduct.description}
                          </p>
                        )}
                        {descImagesArr.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            {descImagesArr.map((imgUrl, idx) => (
                              <div key={idx} className="description-image-wrapper" style={{ width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.4rem' }}>
                                <img className="description-image" src={imgUrl} alt={`وصف المنتج ${idx + 1}`} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
              </div>

              {(() => {
                const selectedCategories = getProductCategories(selectedProduct);
                const relatedProducts = products.filter(p => String(p.id) !== String(selectedProduct.id) && getProductCategories(p).some(category => selectedCategories.includes(category))).slice(0, 4);
                if (relatedProducts.length === 0) return null;
                return (
                  <div className="related-products-section">
                    <h3 className="related-products-title">
                      {t('products.relatedProducts') || 'منتجات قد تعجبك'}
                    </h3>
                    <div className="related-products-grid">
                      {relatedProducts.map(product => {
                        let displayImage = product.image || 'https://via.placeholder.com/300';
                        if (product.images) {
                          try {
                            const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                            if (Array.isArray(parsed) && parsed.length > 0) {
                              displayImage = typeof parsed[0] === 'object' ? parsed[0].url : parsed[0];
                            }
                          } catch(e) {}
                        }
                        return (
                          <div 
                            key={`related-${product.id}`} 
                            className="related-product-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                              setTimeout(() => {
                                const modalInner = document.querySelector('.modal-inner-layout');
                                if (modalInner) {
                                  modalInner.scrollTo({ top: 0, behavior: 'smooth' });
                                  modalInner.scrollTop = 0;
                                }
                              }, 50);
                            }}
                          >
                            <ProductMedia className="related-product-image" src={displayImage} alt={product.title} />
                            <div className="related-product-copy">
                              <h4>{product.title}</h4>
                              <p>{product.price} {t('products.currency')}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && selectedProduct && (
        <div 
          className="premium-lightbox-overlay" 
          onClick={() => {
            setShowLightbox(false);
            setLightboxZoomed(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(false);
              setLightboxZoomed(false);
            }} 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ×
          </button>
          
          <div 
            className="hide-scrollbar"
            ref={lightboxScrollRef}
            onScroll={(e) => {
              if (isThumbnailClickRef.current) return;
              const scrollLeft = Math.abs(e.target.scrollLeft);
              const width = e.target.clientWidth;
              const index = Math.round(scrollLeft / width);
              
              let productImagesParsed = [];
              if (selectedProduct.images) {
                try {
                  const parsed = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
                  productImagesParsed = Array.isArray(parsed) ? parsed : [];
                } catch(e) {}
              }
              let displayUrls = productImagesParsed.map(img => typeof img === 'object' ? img.url : img);
              if (!Array.isArray(displayUrls) || displayUrls.length === 0) {
                displayUrls = [selectedProduct.image || 'https://via.placeholder.com/600'];
              }

              if (index !== activeImageIndex && index >= 0 && index < displayUrls.length) {
                isScrollingRef.current = true;
                setActiveImageIndex(index);
                setTimeout(() => { isScrollingRef.current = false; }, 100);
              }
            }}
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              flexWrap: 'nowrap',
              position: 'relative',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              let productImagesParsed = [];
              if (selectedProduct.images) {
                try {
                  const parsed = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
                  productImagesParsed = Array.isArray(parsed) ? parsed : [];
                } catch(e) {}
              }
              
              let displayUrls = productImagesParsed.map(img => typeof img === 'object' ? img.url : img);
              
              if (!Array.isArray(displayUrls) || displayUrls.length === 0) {
                if (selectedProduct.image) displayUrls = [selectedProduct.image];
                else displayUrls = ['https://via.placeholder.com/600'];
              }
              
              return displayUrls.map((url, i) => (
                <div key={i} style={{ flex: 'none', width: '100%', minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start', scrollSnapStop: 'always', position: 'relative' }}>
                  <ProductMedia
                    className="lightbox-main-img"
                    src={url} 
                    alt={selectedProduct.title} 
                    onClick={() => setLightboxZoomed(!lightboxZoomed)}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      cursor: lightboxZoomed ? 'zoom-out' : 'zoom-in',
                      transformOrigin: 'center center',
                      transform: lightboxZoomed ? 'scale(2)' : 'scale(1)',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
