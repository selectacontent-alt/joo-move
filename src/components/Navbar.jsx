import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Search, ShoppingBag, CheckCircle, User } from 'lucide-react';
import { fetchJsonCached } from '../lib/prefetchCache';


let storeHoverTimeout;

const Navbar = ({ currentPage, setCurrentPage, cartItems = [], removeFromCart, updateCartQuantity, clearCart, searchQuery, setSearchQuery, customerAuth }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);


  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchJsonCached(`/api/products?lang=${encodeURIComponent(language)}`)
      .then(data => setProducts(data))
      .catch(console.error);

    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, [language]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cart-state-change', { detail: isCartOpen }));
  }, [isCartOpen]);

  const handleCategoryClick = (categoryId) => {
    if (setSearchQuery) setSearchQuery('');
    if (setCurrentPage) {
      setCurrentPage('store');
      setTimeout(() => {
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          const yOffset = -150;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 300);
    } else {
      window.location.href = '/';
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const validCartItems = cartItems.filter(item => item && item.product);
  const totalItems = validCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = validCartItems.reduce((sum, item) => sum + ((item.currentPrice || 0) * (item.quantity || 1)), 0);

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleNavigate = (page, elementId) => {
    setIsMobileMenuOpen(false);
    if (setSearchQuery) setSearchQuery('');
    if (setCurrentPage) {
      setCurrentPage(page);
      if (elementId) {
        setTimeout(() => document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.location.href = `/${elementId ? '#' + elementId : ''}`;
    }
  };

  const searchResults = (searchQuery || '').trim() 
    ? products.filter(p => p.title?.toLowerCase().includes((searchQuery || '').toLowerCase()) || (p.description && p.description.toLowerCase().includes((searchQuery || '').toLowerCase()))).slice(0, 8) 
    : [];

  return (
    <>
      <div className={`nav-wrapper ${currentPage === 'home' ? 'nav-transparent' : ''}`} style={{ 
        zIndex: 1000, 
        position: currentPage === 'home' ? 'absolute' : 'fixed',
        background: currentPage === 'home' ? 'transparent' : (currentPage === 'media' ? '#e0f6ec' : 'var(--bg-light)')
      }}>
        <nav className="navbar">
          <div className="flex justify-between items-center relative">
            {/* Logo */}
            {!isSearchOpen && (
              <div className="logo" style={{ cursor: 'pointer', zIndex: 10 }} onClick={() => { if(setCurrentPage) { setCurrentPage('home'); } else { window.location.href = '/'; } }}>
                <img src="/logo.png" alt={t('nav.logoAlt')} className="navbar-logo-img" style={{ height: 'clamp(45px, 5vw, 60px)', objectFit: 'contain', transition: 'all 0.3s' }} />
              </div>
            )}


              <ul className="flex nav-links items-center">
                <li onClick={() => handleNavigate('home', 'home')}>{t('nav.home')}</li>
                <li 
                  onClick={() => handleNavigate('booking')} 
                  className="flex items-center gap-1"
                >
                  {t('nav.booking')}
                </li>
                <li onClick={() => handleNavigate('media')}>{t('nav.media')}</li>
                <li onClick={() => handleNavigate('about')}>{t('nav.aboutUs')}</li>
                <li onClick={() => handleNavigate('track')}>{t('nav.track')}</li>
                <li onClick={() => handleNavigate('contact')}>{t('nav.contact')}</li>
                <li onClick={() => handleNavigate('policy')}>{t('nav.policy')}</li>
              </ul>

            {/* Mobile Menu Dropdown */}
            <ul className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <li onClick={() => handleNavigate('home', 'home')}>{t('nav.home')}</li>
              <li onClick={() => handleNavigate('booking')}>{t('nav.booking')}</li>
              <li onClick={() => handleNavigate('media')}>{t('nav.media')}</li>
              <li onClick={() => handleNavigate('about')}>{t('nav.aboutUs')}</li>
              <li onClick={() => handleNavigate('track')}>{t('nav.track')}</li>
              <li onClick={() => handleNavigate('contact')}>{t('nav.contact')}</li>
              <li onClick={() => handleNavigate('policy')}>{t('nav.policy')}</li>
              <li onClick={() => handleNavigate(customerAuth ? 'account' : 'login')} style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                <User size={18} />
                {customerAuth ? t('nav.myAccount') : t('nav.login')}
              </li>
            </ul>

            {/* Icons */}
            <div className="nav-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="clean-nav-btn show-on-mobile-only lang-btn-mobile" onClick={toggleLanguage}>
                  {language === 'ar' ? 'EN' : 'AR'}
                </button>

                <button className="clean-nav-btn mobile-menu-btn show-on-mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
                </button>
                
                <div className="nav-icons flex items-center" style={{ gap: '0.8rem' }}>

                  
                  <button className="clean-nav-btn hide-on-mobile" onClick={() => handleNavigate(customerAuth ? 'account' : 'login')} title={customerAuth ? t('nav.myAccount') : t('nav.login')}>
                    <User size={22} strokeWidth={2.5} />
                  </button>

                  <button className="clean-nav-btn hide-on-mobile" onClick={toggleLanguage} style={{ fontWeight: '900', fontSize: '0.9rem' }}>
                    {language === 'ar' ? 'EN' : 'AR'}
                  </button>
                </div>
              </div>
          </div>
        </nav>
        

      </div>


    </>
  );
};

export default Navbar;
