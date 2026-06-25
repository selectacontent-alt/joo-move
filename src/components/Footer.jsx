import React, { useState, useEffect } from 'react';
import { Phone, MapPin, ChevronLeft, Mail, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = ({ setCurrentPage }) => {
  const [settings, setSettings] = useState({
    store_name: 'الرحاب - Al Rehab',
    facebook_link: '',
    instagram_link: '',
    tiktok_link: ''
  });

  const { t, language } = useLanguage();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({...prev, ...data}));
      })
      .catch(err => console.error("Error fetching settings", err));
  }, []);

  const getDisplayPhone = () => {
    let raw = settings.support_whatsapp || settings.admin_whatsapp || '0112 784 7539';
    if (raw.startsWith('20') && raw.length >= 12) {
      return '0' + raw.substring(2);
    }
    return raw;
  };

  return (
    <footer id="contact" className="elite-footer">
      <div className="elite-footer-dots"></div>
      <div className="elite-footer-glow ef-glow-1"></div>
      <div className="elite-footer-glow ef-glow-2"></div>

      <div className="container elite-footer-container">
        
        {/* Brand & Social Column */}
        <div className="ef-col ef-brand-col">
           <div className="ef-logo-container" onClick={() => { if(setCurrentPage) setCurrentPage('home'); window.scrollTo(0,0); }}>
             <img src="/logo.png" alt={settings.store_name} className="ef-logo" />
           </div>
           <p className="ef-desc">
             {t('footer.brandDesc')}
           </p>
           
           <div className="ef-socials">
              {settings.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noreferrer" className="ef-social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {settings.instagram_link && (
                <a href={settings.instagram_link} target="_blank" rel="noreferrer" className="ef-social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.tiktok_link && (
                <a href={settings.tiktok_link} target="_blank" rel="noreferrer" className="ef-social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8h-3v15a4 4 0 0 1-2-3.7z"></path></svg>
                </a>
              )}
           </div>
        </div>

        {/* Quick Links Column */}
        <div className="ef-col">
           <h4 className="ef-title">{t('footer.quickLinksTitle')}</h4>
           <ul className="ef-links">
             <li onClick={() => { if(setCurrentPage) setCurrentPage('home'); window.scrollTo(0,0); }}>
               <ChevronLeft size={16} className="ef-link-icon" /> {t('footer.quickLinksHome')}
             </li>
             <li onClick={() => { if(setCurrentPage) setCurrentPage('store'); window.scrollTo(0,0); }}>
               <ChevronLeft size={16} className="ef-link-icon" /> {t('footer.quickLinksShop')}
             </li>
             <li onClick={() => { if(setCurrentPage) setCurrentPage('about'); window.scrollTo(0,0); }}>
               <ChevronLeft size={16} className="ef-link-icon" /> {t('footer.quickLinksAbout')}
             </li>
           </ul>
        </div>

        {/* Legal Column */}
        <div className="ef-col">
           <h4 className="ef-title">{t('footer.customerServiceTitle')}</h4>
           <ul className="ef-links">
             <li onClick={() => { window.open(`https://wa.me/${(settings.support_whatsapp || settings.admin_whatsapp || '201127847539').replace(/\D/g, '')}`, '_blank'); }}>
               <ChevronLeft size={16} className="ef-link-icon" /> {t('footer.customerServiceSupport')}
             </li>
             <li onClick={() => { if(setCurrentPage) setCurrentPage('policy'); window.scrollTo(0,0); }}>
               <ChevronLeft size={16} className="ef-link-icon" /> {t('footer.customerServicePolicy')}
             </li>
           </ul>
        </div>

        {/* Contact Info Column */}
        <div className="ef-col ef-contact-col">
           <h4 className="ef-title">{t('footer.contactInfoTitle')}</h4>
           
           <a 
             href={`tel:${(settings.support_whatsapp || settings.admin_whatsapp || '01127847539').replace(/\D/g, '')}`}
             className="chic-contact-item chic-phone-link"
           >
             <div className="chic-contact-icon-wrapper">
               <Phone size={20} />
             </div>
             <div className="chic-contact-text">
               <span className="chic-contact-value" dir="ltr">{getDisplayPhone()}</span>
               <span className="chic-contact-label">{t('footer.contactPhoneLabel')}</span>
             </div>
           </a>
           
           <div className="chic-contact-item">
             <div className="chic-contact-icon-wrapper">
               <MapPin size={20} />
             </div>
             <div className="chic-contact-text">
               <span className="chic-contact-value">{t('footer.contactLocation')}</span>
               <span className="chic-contact-label">{t('footer.contactLocationLabel')}</span>
             </div>
           </div>

           <div className="chic-contact-item">
             <div className="chic-contact-icon-wrapper">
               <Mail size={20} />
             </div>
             <div className="chic-contact-text">
               <span className="chic-contact-value">info@alrehab-agri.com</span>
               <span className="chic-contact-label">{t('footer.contactEmailLabel')}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Bar (Unchanged structure, updated parent style wrapper) */}
      <div className="chic-footer-bottom" style={{ position: 'relative', zIndex: 3, background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container chic-bottom-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
           <p className="chic-copyright" style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
              © {new Date().getFullYear()} <span className="chic-brand-highlight" style={{ color: '#10b981', fontWeight: 'bold' }}>{settings.store_name}</span>. جميع الحقوق محفوظة.
           </p>
           <a 
              href="https://selectcustomersmarketing.com/" 
              target="_blank" 
              rel="noreferrer"
              className="made-in sc-marketing-link" 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              title="زيارة موقع S C Markting"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', transition: 'transform 0.3s' }}
            >
              <span className="sc-marketing-text" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                تم إنشاء هذا الموقع بواسطة <span className="sc-marketing-brand" style={{ color: '#fff', fontWeight: 'bold', paddingRight: '0.3rem' }}>C Markting</span>
              </span>
              <img src="/s-logo.png" alt="SC Marketing Logo" className="sc-marketing-img" style={{ height: '24px' }} />
            </a>
        </div>
      </div>

      <style>{`
        .elite-footer {
          position: relative;
          background: linear-gradient(165deg, #020a0f 0%, #041c14 35%, #030f0a 70%, #020a0f 100%);
          color: white;
          overflow: hidden;
          padding-top: 2rem;
          border-top: 1px solid rgba(16, 185, 129, 0.1);
        }

        .elite-footer-dots {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: radial-gradient(rgba(16,185,129,0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 1;
        }

        .elite-footer-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .ef-glow-1 {
          width: 400px; height: 400px;
          background: rgba(16, 185, 129, 0.05);
          top: -100px; right: -100px;
        }

        .ef-glow-2 {
          width: 300px; height: 300px;
          background: rgba(52, 211, 153, 0.03);
          bottom: -50px; left: 10%;
        }

        .elite-footer-container {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 1.5rem;
          padding-bottom: 1.5rem;
        }

        .ef-logo-container {
          cursor: pointer;
          margin-bottom: 1rem;
          display: inline-block;
        }

        .ef-logo {
          max-width: 180px;
          height: auto;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }

        .ef-desc {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .ef-socials {
          display: flex;
          gap: 1rem;
        }

        .ef-social-link {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex; align-items: center; justify-content: center;
          color: #10b981;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .ef-social-link:hover {
          background: #10b981;
          color: white;
          transform: translateY(-3px);
          border-color: #10b981;
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        }

        .ef-title {
          font-size: 1rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1.2rem;
          position: relative;
          display: inline-block;
        }

        .ef-title::after {
          content: '';
          position: absolute;
          bottom: -8px; right: 0;
          width: 40px; height: 3px;
          background: #10b981;
          border-radius: 2px;
        }

        .ef-links {
          list-style: none;
          padding: 0; margin: 0;
        }

        .ef-links li {
          color: #cbd5e1;
          margin-bottom: 0.6rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .ef-links li:hover {
          color: #10b981;
          transform: translateX(-5px);
        }

        .ef-link-icon {
          color: #10b981;
          transition: transform 0.3s ease;
        }

        .ef-links li:hover .ef-link-icon {
          transform: translateX(-3px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .elite-footer-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .elite-footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2.5rem;
          }
          .ef-title::after {
            left: 50%; right: auto;
            transform: translateX(-50%);
          }
          .ef-socials { justify-content: center; }
          .ef-links li { justify-content: center; }
          .ef-links li:hover { transform: translateY(-2px) translateX(0); }
          .chic-bottom-inner { flex-direction: column !important; gap: 1rem; text-align: center; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
