"use client";
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Products from './components/Products';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';

import RefundPolicy from './components/RefundPolicy';
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MediaGallery from './components/MediaGallery';
import HomeMediaSection from './components/HomeMediaSection';
import B2BFeatures from './components/B2BFeatures';
import CallToAction from './components/CallToAction';
import BookingPage from './components/BookingPage';
import FulfillmentPage from './pages/FulfillmentPage';
import { useLanguage } from './contexts/LanguageContext';
import NavigationPredictor from './components/NavigationPredictor';

function App() { const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerAuth, setCustomerAuth] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const marketingPages = ['/media', '/software', '/branding'];
  const isMarketingShowcaseRoute = marketingPages.includes(currentPath.replace(/\/+$/, '') || '/');

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path);
    if (path.startsWith('/scpanel')) setCurrentPage('admin');
    else if (path.startsWith('/store') || path.startsWith('/product')) setCurrentPage('store');
    else if (path === '/booking') setCurrentPage('booking');
    else if (path.startsWith('/fulfillment')) setCurrentPage('fulfillment');
    else if (path === '/about') setCurrentPage('about');
    else if (path === '/checkout') setCurrentPage('checkout');
    else if (path === '/track') setCurrentPage('track');
    else if (path === '/policy') setCurrentPage('policy');
    else if (path === '/contact') setCurrentPage('contact');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/account') setCurrentPage('account');
    else if (path === '/media') setCurrentPage('media');
    else if (path === '/media') setCurrentPage('media');

    try {
      const savedAuth = localStorage.getItem('customer_data');
      if (savedAuth) setCustomerAuth(JSON.parse(savedAuth));
    } catch (e) {}

    try {
      const savedAdminAuth = localStorage.getItem('admin_auth');
      if (savedAdminAuth) setIsAuthenticated(JSON.parse(savedAdminAuth));
    } catch (e) {}

    try {
      const savedCart = localStorage.getItem('Al Rehab_cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      if (Array.isArray(parsedCart)) setCartItems(parsedCart);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path.startsWith('/scpanel')) setCurrentPage('admin');
      else if (path.startsWith('/store') || path.startsWith('/product')) setCurrentPage('store');
      else if (path === '/booking') setCurrentPage('booking');
      else if (path.startsWith('/fulfillment')) setCurrentPage('fulfillment');
      else if (path === '/about') setCurrentPage('about');
      else if (path === '/checkout') setCurrentPage('checkout');
      else if (path === '/track') setCurrentPage('track');
      else if (path === '/policy') setCurrentPage('policy');
      else if (path === '/contact') setCurrentPage('contact');
      else if (path === '/login') setCurrentPage('login');
      else if (path === '/account') setCurrentPage('account');
    else if (path === '/media') setCurrentPage('media');
      else if (path === '/media') setCurrentPage('media');
      else setCurrentPage('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page) => {
    let newPath = '/';
    if (page === 'home') newPath = '/';
    else if (page === 'admin') newPath = window.location.pathname.startsWith('/scpanel') ? window.location.pathname : '/scpanel/dashboard';
    else if (page === 'fulfillment') newPath = '/fulfillment';
    else if (page === 'contact') newPath = '/contact';
    else if (page === 'login') newPath = '/login';
    else if (page === 'account') newPath = '/account';
    else newPath = '/' + page;
    
    window.history.pushState({}, '', newPath);
    setCurrentPath(newPath);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('Al Rehab_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('Al Rehab_cart');
    }
  }, [cartItems]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let pageKey = 'pageNameHome';
    if (currentPage === 'store') pageKey = 'pageNameStore';
    if (currentPage === 'about') pageKey = 'pageNameAbout';
    if (currentPage === 'checkout') pageKey = 'pageNameCheckout';
    if (currentPage === 'track') pageKey = 'pageNameTrack';
    if (currentPage === 'policy') pageKey = 'pageNamePolicy';
    if (currentPage === 'admin') pageKey = 'pageNameAdmin';
    if (currentPage === 'contact') pageKey = 'pageNameContact';
    if (currentPage === 'login') pageKey = 'pageNameLogin';
    if (currentPage === 'account') pageKey = 'pageNameAccount';
    if (currentPage === 'booking') pageKey = 'pageNameBooking';
    if (currentPage === 'media') pageKey = 'pageNameMedia';
    
    document.title = `${t('app.pageTitle')} - ${t('app.' + pageKey)}`;
  }, [currentPage, t]);

  const isAdminOrLogin = currentPage === 'admin' || currentPage === 'fulfillment';

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i?.product?.id === item?.product?.id && i?.optionIndex === item?.optionIndex);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], quantity: (next[existing].quantity || 1) + (item.quantity || 1) };
        return next;
      }
      return [...prev, item];
    });
    setNotification(t('app.addedToCart'));
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const undoAddToCart = (productId, optionIndex) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i?.product?.id === productId && i?.optionIndex === optionIndex);
      if (existing >= 0) {
        const next = [...prev];
        if (next[existing].quantity > 1) {
          next[existing] = { ...next[existing], quantity: next[existing].quantity - 1 };
        } else {
          next.splice(existing, 1);
        }
        return next;
      }
      return prev;
    });
  };

  const updateCartQuantity = (index, delta) => {
    setCartItems(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: Math.max(1, (next[index].quantity || 1) + delta) };
      }
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('Al Rehab_cart');
  };

  // If user tries to access admin but is not authenticated, show login page instead
  const renderPage = () => {
    if (currentPage === 'admin' && !isAuthenticated) {
      return <LoginPage setAuth={setIsAuthenticated} setCurrentPage={navigate} />;
    }

    if (currentPage === 'admin' && isAuthenticated) {
      return <AdminPage setCurrentPage={navigate} user={isAuthenticated} setAuth={setIsAuthenticated} />;
    }

    if (currentPage === 'fulfillment' && !isAuthenticated) {
      return <LoginPage setAuth={setIsAuthenticated} setCurrentPage={navigate} targetPage="fulfillment" />;
    }

    if (currentPage === 'fulfillment' && isAuthenticated) {
      return <FulfillmentPage setCurrentPage={navigate} />;
    }

    if (currentPage === 'booking') {
      return <div style={{ paddingTop: '95px' }}><BookingPage setCurrentPage={navigate} /></div>;
    }

    if (currentPage === 'store') {
      return (
        <div className="store-page-wrapper" style={{ minHeight: '80vh', paddingTop: '95px' }}>
          <Products cartItems={cartItems} addToCart={addToCart} undoAddToCart={undoAddToCart} searchQuery={searchQuery} currentPage={currentPage} />
        </div>
      );
    }

    if (currentPage === 'checkout') {
      return (
        <CheckoutPage
          cartItems={cartItems}
          clearCart={clearCart}
          setCurrentPage={navigate}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          customerAuth={customerAuth}
          setCustomerAuth={setCustomerAuth}
        />
      );
    }

    if (currentPage === 'track') {
      return <TrackingPage setCurrentPage={navigate} />;
    }

    if (currentPage === 'about') {
      return (
        <div style={{ paddingTop: '95px', minHeight: '20vh' }}>
          <AboutUs />
        </div>
      );
    }

    if (currentPage === 'policy') {
      return <RefundPolicy />;
    }

    if (currentPage === 'contact') {
      return (
        <div style={{ minHeight: '60vh', paddingTop: '95px' }}>
          <ContactUs />
        </div>
      );
    }

    if (currentPage === 'login') {
      return <CustomerAuthPage setCurrentPage={navigate} setCustomerAuth={setCustomerAuth} />;
    }

    if (currentPage === 'account') {
      return <CustomerDashboard setCurrentPage={navigate} customerAuth={customerAuth} setCustomerAuth={setCustomerAuth} />;
    }



    if (currentPage === 'media') {
      return <div style={{ paddingTop: '95px' }}><MediaGallery /></div>;
    }

    // Default home page
    return (
      <>
        <Hero setCurrentPage={navigate} />
        <B2BFeatures setCurrentPage={navigate} />
        <AboutUs isHomepage={true} />
        <CallToAction setCurrentPage={navigate} />
        <HomeMediaSection setCurrentPage={navigate} />
        <Testimonials />
      </>
    );
  };

  return (
    <>
      <NavigationPredictor currentPath={currentPath} language={language} />
      {!isAdminOrLogin && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={navigate}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          clearCart={clearCart}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          customerAuth={customerAuth}
        />
      )}
      <div className={isMarketingShowcaseRoute ? 'home-background-shell marketing-home-shell' : ''}>
        {isMarketingShowcaseRoute && (
          <div className="marketing-home-decor" aria-hidden="true">
            <span className="marketing-orb orb-one"></span>
            <span className="marketing-orb orb-two"></span>
            <span className="marketing-orb orb-three"></span>
            <span className="marketing-square square-one"></span>
            <span className="marketing-square square-two"></span>
            <span className="marketing-square square-three"></span>
            <span className="marketing-square square-four"></span>
          </div>
        )}
        {renderPage()}
      </div>
      {!isAdminOrLogin && <Footer setCurrentPage={navigate} />}
      <div style={{
        bottom: notification ? '30px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        position: 'fixed',
        background: 'rgba(16, 185, 129, 0.95)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '30px',
        fontWeight: '900',
        fontSize: '1.1rem',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none',
        opacity: notification ? 1 : 0
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        {notification}
      </div>

      {/* Smart WhatsApp Widget & Scroll to Top Button (Interactive) */}
      {!isAdminOrLogin && (
        <>
          <WhatsAppWidget cartItems={cartItems} currentPage={currentPage} />
          <ScrollToTopButton />
        </>
      )}
    </>
  );
}

const useFooterVisibility = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    let observer;
    let intervalId;

    const initObserver = () => {
      const footer = document.querySelector('footer');
      if (!footer) return false;

      observer = new IntersectionObserver(
        ([entry]) => setIsFooterVisible(entry.isIntersecting),
        { root: null, rootMargin: '0px', threshold: 0.01 }
      );
      observer.observe(footer);
      return true;
    };

    if (!initObserver()) {
      intervalId = window.setInterval(() => {
        if (initObserver()) window.clearInterval(intervalId);
      }, 500);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (observer) observer.disconnect();
    };
  }, []);

  return isFooterVisible;
};

const WhatsAppWidget = ({ cartItems = [], currentPage }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const isFooterVisible = useFooterVisibility();
  const [waNumber, setWaNumber] = useState('201127847539');
  const [settings, setSettings] = useState({
    facebook_link: '',
    instagram_link: '',
    tiktok_link: ''
  });

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setSettings(data);
          if (data.support_whatsapp) {
            setWaNumber(data.support_whatsapp.replace(/\D/g, ''));
          } else if (data.admin_whatsapp) {
            setWaNumber(data.admin_whatsapp.replace(/\D/g, ''));
          }
        })
        .catch(console.error);
    };

    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(loadSettings, { timeout: 2500 })
      : window.setTimeout(loadSettings, 1000);

    return () => {
      if (window.cancelIdleCallback && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  useEffect(() => {
    const handleCartState = (e) => setIsCartOpen(e.detail);
    window.addEventListener('cart-state-change', handleCartState);
    
    const handleProductModalState = (e) => setIsProductModalOpen(e.detail);
    window.addEventListener('product-modal-state-change', handleProductModalState);
    
    return () => {
      window.removeEventListener('cart-state-change', handleCartState);
      window.removeEventListener('product-modal-state-change', handleProductModalState);
    };
  }, []);

  const handleSend = () => {
    const text = message.trim() ? encodeURIComponent(message) : encodeURIComponent(t('whatsapp.helpMessage'));
    window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${text}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  const handleCartClick = () => {
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const canShowDock = currentPage !== 'checkout' && !isFooterVisible && !isCartOpen;

  return (
    <div className="floating-actions-dock" style={{ 
      opacity: canShowDock ? 1 : 0,
      pointerEvents: canShowDock ? 'auto' : 'none',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      transform: canShowDock ? 'translateY(0)' : 'translateY(20px)'
    }}>
      {/* Social Media Buttons */}
      {settings.facebook_link && (
        <button 
          onClick={() => window.open(settings.facebook_link, '_blank')}
          className="floating-action-btn"
          style={{ background: '#1877F2', boxShadow: '0 8px 25px rgba(24, 119, 242, 0.35)' }}
          title="Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </button>
      )}

      {settings.instagram_link && (
        <button 
          onClick={() => window.open(settings.instagram_link, '_blank')}
          className="floating-action-btn"
          style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', boxShadow: '0 8px 25px rgba(220, 39, 67, 0.35)' }}
          title="Instagram"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </button>
      )}

      {settings.tiktok_link && (
        <button 
          onClick={() => window.open(settings.tiktok_link, '_blank')}
          className="floating-action-btn"
          style={{ background: '#000000', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35)' }}
          title="TikTok"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8h-3v15a4 4 0 0 1-2-3.7z"></path></svg>
        </button>
      )}

      {/* Interactive WhatsApp Widget */}
      <div style={{ position: 'relative', display: (!isProductModalOpen) ? 'block' : 'none' }}>
        {isOpen && (
          <div className="animate-up" style={{ 
            position: 'fixed', 
            bottom: '7rem', 
            right: '2rem', 
            width: '320px', 
            background: '#ffffff', 
            borderRadius: '20px', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.15)', 
            overflow: 'hidden',
            border: '1px solid #f1f5f9',
            transformOrigin: 'bottom right'
          }}>
            {/* Header */}
            <div style={{ background: '#059669', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
              <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900' }}>{t('whatsapp.widgetTitle')}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>{t('whatsapp.replyTime')}</p>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Chat Body */}
            <div style={{ padding: '1.5rem', background: '#e5e5f7', backgroundImage: 'radial-gradient(#444cf7 0.5px, transparent 0.5px), radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px)', backgroundSize: '20px 20px', backgroundPosition: '0 0,10px 10px', opacity: 0.9, minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '0 15px 15px 15px', color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.5', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '85%' }}>
                <span suppressHydrationWarning dangerouslySetInnerHTML={{ __html: t('whatsapp.welcome') }} />
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px', textAlign: 'left' }}>{t('whatsapp.now')}</span>
              </div>
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', background: 'white', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder={t('whatsapp.placeholder')} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontFamily: 'inherit', fontWeight: 'bold' }}
              />
              <button 
                onClick={handleSend}
                style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#059669', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', transform: message ? 'scale(1.05)' : 'scale(1)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)', marginLeft: '4px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Floating Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="floating-action-btn"
          style={{
            background: '#25D366',
            boxShadow: '0 8px 25px rgba(37, 211, 102, 0.35)',
            position: 'relative'
          }}
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '22px', height: '22px' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          )}
          {!isOpen && <span style={{ position: 'absolute', top: '1px', right: '1px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>}
        </button>
      </div>
    </div>
  );
};

const ScrollToTopButton = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const isFooterVisible = useFooterVisibility();

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    
    const handleProductModalState = (e) => setIsProductModalOpen(e.detail);
    window.addEventListener('product-modal-state-change', handleProductModalState);

    return () => {
      window.removeEventListener('scroll', checkScrollTop);
      window.removeEventListener('product-modal-state-change', handleProductModalState);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      onClick={scrollToTop}
      className={`scroll-to-top-btn ${(showScrollTop && !isProductModalOpen && !isFooterVisible) ? 'visible' : ''}`}
      title="الرجوع للأعلى"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export default App;
