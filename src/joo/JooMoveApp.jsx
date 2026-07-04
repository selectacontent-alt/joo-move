"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpLeft, Boxes, Building2, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Facebook,
  Headphones, Home, Instagram, MapPin, Menu, MessageCircle, PackageCheck,
  Phone, Play, Route, Search, Send, ShieldCheck, Sparkles, Star, Truck, UploadCloud,
  UserRound, Wrench, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BRAND, DEFAULT_AREAS, DEFAULT_FAQS, DEFAULT_PAGE_CONTENT, DEFAULT_SERVICES,
  DEFAULT_TESTIMONIALS, MOVE_STATUSES, PROCESS_STEPS
} from './defaultContent';
import JooAdmin from './JooAdmin';

const ICONS = { Truck, PackageCheck, Wrench, Boxes, Building2 };
const pick = (language, ar, en) => language === 'ar' ? ar : en;
const cleanPhone = (value) => String(value || '').replace(/\D/g, '');
const whatsappInquiry = (language) => pick(
  language,
  'مرحبًا Joo Move، أريد الاستفسار عن نقل وتغليف الأثاث وتحديد موعد مناسب.',
  'Hello Joo Move, I would like to ask about furniture moving, packing and scheduling.'
);
const whatsappUrl = (phone, language) => `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(whatsappInquiry(language))}`;

const copy = {
  ar: {
    nav: { home: 'الرئيسية', services: 'خدماتنا', work: 'شغلنا', about: 'عن Joo Move', track: 'تابع طلبك', contact: 'تواصل معنا', request: 'اطلب نقلة' },
    quick: { from: 'هتنقل منين؟', to: 'إلى فين؟', type: 'نوع المكان', phone: 'رقم الهاتف', home: 'منزل', office: 'مكتب', start: 'ابدأ طلبك' },
    common: { explore: 'اعرف التفاصيل', request: 'اطلب الخدمة', allServices: 'شوف كل الخدمات', whatsapp: 'واتساب مباشر', loading: 'جارٍ التحميل...' },
  },
  en: {
    nav: { home: 'Home', services: 'Services', work: 'Our Work', about: 'About Joo Move', track: 'Track Request', contact: 'Contact', request: 'Request a Move' },
    quick: { from: 'Moving from?', to: 'Destination?', type: 'Property type', phone: 'Phone number', home: 'Home', office: 'Office', start: 'Start request' },
    common: { explore: 'Explore service', request: 'Request service', allServices: 'View all services', whatsapp: 'WhatsApp us', loading: 'Loading...' },
  }
};

function usePath() {
  const [path, setPath] = useState('/');
  useEffect(() => {
    const sync = () => setPath(window.location.pathname.replace(/\/$/, '') || '/');
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const navigate = (next) => {
    window.history.pushState({}, '', next);
    setPath(next.split('?')[0].replace(/\/$/, '') || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return [path, navigate];
}

function usePublicData() {
  const [data, setData] = useState({
    services: DEFAULT_SERVICES, areas: DEFAULT_AREAS, faqs: DEFAULT_FAQS,
    testimonials: DEFAULT_TESTIMONIALS, media: [], settings: {}, page: DEFAULT_PAGE_CONTENT.home
  });
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch('/api/services').then((r) => r.ok ? r.json() : []),
      fetch('/api/service-areas').then((r) => r.ok ? r.json() : []),
      fetch('/api/faqs?page=home').then((r) => r.ok ? r.json() : []),
      fetch('/api/testimonials').then((r) => r.ok ? r.json() : []),
      fetch('/api/media').then((r) => r.ok ? r.json() : []),
      fetch('/api/settings').then((r) => r.ok ? r.json() : {}),
      fetch('/api/site-content/home').then((r) => r.ok ? r.json() : DEFAULT_PAGE_CONTENT.home),
    ]).then((results) => {
      if (!active) return;
      const value = (index, fallback) => results[index].status === 'fulfilled' && results[index].value ? results[index].value : fallback;
      const testimonials = value(3, []);
      setData({
        services: value(0, []).length ? value(0, []) : DEFAULT_SERVICES,
        areas: value(1, []).length ? value(1, []) : DEFAULT_AREAS,
        faqs: value(2, []).length ? value(2, []) : DEFAULT_FAQS,
        testimonials: testimonials.some((item) => item.text_ar || item.text_en) ? testimonials : DEFAULT_TESTIMONIALS,
        media: value(4, []), settings: value(5, {}), page: value(6, DEFAULT_PAGE_CONTENT.home),
      });
    });
    return () => { active = false; };
  }, []);
  return data;
}

function WhatsAppIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FloatingWhatsApp({ settings, footerInView }) {
  const { language } = useLanguage();
  const phone = settings.support_whatsapp || settings.admin_whatsapp || BRAND.phone;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`jm-wa-wrapper ${footerInView && !isOpen ? 'jm-hidden-float' : ''}`}>
      <div className={`jm-wa-window ${isOpen ? 'open' : ''}`}>
        <div className="jm-wa-header">
          <div>
            <span className="jm-wa-avatar">
              <img src="/joo-icon.png" alt="Support" />
              <i />
            </span>
            <div>
              <b>{pick(language, 'خدمة العملاء', 'Customer Support')}</b>
              <small>{pick(language, 'عادة نرد خلال دقائق', 'Typically replies in minutes')}</small>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)}><X size={18} /></button>
        </div>
        <div className="jm-wa-body">
          <div className="jm-wa-message">
            <b>Joo Move</b>
            <p>{pick(language, 'أهلاً بك 👋، إزاي نقدر نساعدك في نقل عفشك؟', 'Hi there 👋, How can we help with your move?')}</p>
            <span suppressHydrationWarning>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
        <div className="jm-wa-footer">
          <a href={whatsappUrl(phone, language)} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)}>
            {pick(language, 'بدء المحادثة', 'Start Chat')} <Send size={16} />
          </a>
        </div>
      </div>

      <button className="jm-floating-whatsapp" aria-label="WhatsApp" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && <div className="jm-wa-tooltip">{pick(language, 'محتاج مساعدة؟ كلمنا!', 'Need help? Chat with us!')}</div>}
        {!isOpen && <div className="jm-wa-pulse" />}
        {isOpen ? <X size={26} className="lucide-x" /> : <WhatsAppIcon />}
      </button>
    </div>
  );
}

const Logo = ({ inverse = false }) => (
  <img className={`jm-logo ${inverse ? 'jm-logo-inverse' : ''}`} src="/joo-logo.png" alt="Joo Move" />
);

function Header({ path, navigate, settings }) {
  const { language, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const c = copy[language];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const phone = settings.support_whatsapp || settings.admin_whatsapp || BRAND.phone;
  const links = [
    ['/', c.nav.home], ['/services', c.nav.services], ['/our-work', c.nav.work],
    ['/about', c.nav.about], ['/track-request', c.nav.track], ['/contact', c.nav.contact]
  ];
  const go = (next) => { navigate(next); setOpen(false); };
  return <>
    <div className="jm-topbar">
      <div className="jm-container jm-topbar-inner">
        <span><Phone size={14} /> <bdi>{phone}</bdi></span>
        <span><Clock3 size={14} /> {pick(language, settings.joo_hours_ar || BRAND.hoursAr, settings.joo_hours_en || BRAND.hoursEn)}</span>
        <span className="jm-top-area"><MapPin size={14} /> {pick(language, settings.joo_area_ar || BRAND.areaAr, settings.joo_area_en || BRAND.areaEn)}</span>
      </div>
    </div>
    <header className={`jm-header ${scrolled || path !== '/' ? 'jm-header-solid' : ''} ${scrolled ? 'jm-header-scrolled' : ''}`}>
      <div className="jm-container jm-nav">
        <button className="jm-logo-button" onClick={() => go('/')} aria-label="Joo Move home"><Logo inverse={!scrolled && path === '/'} /></button>
        <nav className="jm-nav-links" aria-label="Main navigation">
          {links.map(([href, label]) => <button className={path === href ? 'active' : ''} key={href} onClick={() => go(href)}>{label}</button>)}
        </nav>
        <div className="jm-nav-actions">
          <button className="jm-language" onClick={toggleLanguage} aria-label={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}>
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
          <button className="jm-btn jm-btn-red jm-nav-cta" onClick={() => go('/request-move')}>{c.nav.request} <ArrowUpLeft size={18} /></button>
          <button className="jm-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      <div className={`jm-mobile-menu ${open ? 'open' : ''}`}>
        {links.map(([href, label]) => <button key={href} onClick={() => go(href)}>{label}<ChevronLeft size={18} /></button>)}
        <button className="jm-mobile-request" onClick={() => go('/request-move')}>{c.nav.request}<ArrowLeft size={18} /></button>
      </div>
    </header>
  </>;
}

function QuickRequest({ navigate }) {
  const { language } = useLanguage();
  const c = copy[language].quick;
  const [quick, setQuick] = useState({ origin_area: '', destination_area: '', move_type: 'home', phone: '' });
  const submit = (event) => {
    event.preventDefault();
    sessionStorage.setItem('joo_quick_request', JSON.stringify(quick));
    navigate('/request-move');
  };
  return <form className="jm-quick-form" onSubmit={submit}>
    <label className="jm-qf-field">
      <div className="jm-qf-icon"><MapPin size={18} /></div>
      <div className="jm-qf-input">
        <span>{c.from}</span>
        <input required value={quick.origin_area} onChange={(e) => setQuick({ ...quick, origin_area: e.target.value })} placeholder={pick(language, 'مثال: التجمع', 'e.g. New Cairo')} />
      </div>
    </label>
    <div className="jm-qf-divider"></div>
    <label className="jm-qf-field">
      <div className="jm-qf-icon"><Route size={18} /></div>
      <div className="jm-qf-input">
        <span>{c.to}</span>
        <input required value={quick.destination_area} onChange={(e) => setQuick({ ...quick, destination_area: e.target.value })} placeholder={pick(language, 'مثال: زايد', 'e.g. Sheikh Zayed')} />
      </div>
    </label>
    <div className="jm-qf-divider"></div>
    <label className="jm-qf-field">
      <div className="jm-qf-icon"><Building2 size={18} /></div>
      <div className="jm-qf-input">
        <span>{c.type}</span>
        <select value={quick.move_type} onChange={(e) => setQuick({ ...quick, move_type: e.target.value })}>
          <option value="home">{c.home}</option><option value="office">{c.office}</option>
        </select>
      </div>
    </label>
    <div className="jm-qf-divider"></div>
    <label className="jm-qf-field">
      <div className="jm-qf-icon"><Phone size={18} /></div>
      <div className="jm-qf-input">
        <span>{c.phone}</span>
        <input required inputMode="tel" value={quick.phone} onChange={(e) => setQuick({ ...quick, phone: e.target.value })} placeholder="01xxxxxxxxx" />
      </div>
    </label>
    <button className="jm-btn jm-btn-red jm-qf-btn" type="submit">{c.start}<ArrowLeft size={19} /></button>
  </form>;
}

function MovingVanIllustration() {
  return <div className="jm-van-motion" aria-hidden="true">
    <span className="jm-van-speed-lines"><i /><i /><i /></span>
    <svg className="jm-brand-van" viewBox="0 0 300 165" role="presentation">
      <defs>
        <linearGradient id="jmVanBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#21c8ee" />
          <stop offset="0.55" stopColor="#00a6d6" />
          <stop offset="1" stopColor="#007da8" />
        </linearGradient>
        <linearGradient id="jmVanGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8fbff" />
          <stop offset="1" stopColor="#80dff4" />
        </linearGradient>
        <filter id="jmVanShadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#00131f" floodOpacity="0.42" />
        </filter>
      </defs>
      <ellipse className="jm-van-ground-shadow" cx="153" cy="140" rx="112" ry="12" fill="#00131f" opacity=".38" />
      <g className="jm-van-body" filter="url(#jmVanShadow)">
        <path d="M40 45c0-12 9-21 21-21h132c12 0 21 9 21 21v18h23c10 0 19 5 25 13l19 27c3 4 4 9 4 14v10H27v-18c0-7 5-13 13-14V45z" fill="url(#jmVanBody)" />
        <path d="M214 64h22c7 0 13 3 17 9l17 24h-56V64z" fill="#058eb8" />
        <path d="M221 70h15c5 0 9 2 12 6l10 15h-37V70z" fill="url(#jmVanGlass)" />
        <path d="M40 95h174v32H40z" fill="#008bb6" opacity=".35" />
        <path d="M54 40h85" stroke="#75e5fa" strokeWidth="5" strokeLinecap="round" opacity=".78" />
        <path d="M54 51h61" stroke="#75e5fa" strokeWidth="4" strokeLinecap="round" opacity=".55" />
        <path d="M54 62h38" stroke="#75e5fa" strokeWidth="4" strokeLinecap="round" opacity=".36" />
        <g className="jm-van-brand-mark">
          <circle cx="164" cy="69" r="23" fill="#fff" opacity=".97" />
          <path d="M164 53c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14zm0 19a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#d92335" />
        </g>
        <rect x="112" y="103" width="55" height="5" rx="2.5" fill="#fff" opacity=".88" />
        <circle cx="276" cy="111" r="5" fill="#ff3348" />
        <rect x="26" y="115" width="259" height="12" rx="6" fill="#e9fbff" />
        <path d="M26 119h259" stroke="#00a6d6" strokeWidth="3" opacity=".55" />
        <g className="jm-van-wheel"><circle cx="79" cy="128" r="26" fill="#041f31" /><circle cx="79" cy="128" r="15" fill="#dff8ff" /><circle cx="79" cy="128" r="7" fill="#00a6d6" /><path d="M79 113v30M64 128h30M68 117l22 22M90 117l-22 22" stroke="#78dff4" strokeWidth="2" /></g>
        <g className="jm-van-wheel"><circle cx="234" cy="128" r="26" fill="#041f31" /><circle cx="234" cy="128" r="15" fill="#dff8ff" /><circle cx="234" cy="128" r="7" fill="#00a6d6" /><path d="M234 113v30M219 128h30M223 117l22 22M245 117l-22 22" stroke="#78dff4" strokeWidth="2" /></g>
      </g>
    </svg>
  </div>;
}

function HeroSection({ section, navigate }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  return <section className="jm-hero">
    <div className="jm-hero-photo" aria-hidden="true"><div className="jm-hero-glow" /></div>
    <div className="jm-hero-grid" aria-hidden="true" />
    <div className="jm-container jm-hero-content">
      <div className="jm-hero-copy">
        <span className="jm-eyebrow jm-eyebrow-light">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="jm-hero-actions">
          <button className="jm-btn jm-btn-red" onClick={() => navigate('/request-move')}>{copy[language].nav.request}<ArrowLeft size={19} /></button>
          <button className="jm-btn jm-btn-glass" onClick={() => navigate('/our-work')}><Play size={18} fill="currentColor" />{pick(language, 'شوف شغلنا', 'See our work')}</button>
        </div>
        <div className="jm-hero-rating"><span className="jm-avatar-stack"><i>م</i><i>أ</i><i>س</i></span><span><b>4.9</b><span className="jm-stars">★★★★★</span><small>{pick(language, 'عملاء رجعوا يرشحونا', 'Recommended by our customers')}</small></span></div>
      </div>
      <div className="jm-hero-visual">
        <div className="jm-visual-card jm-visual-card-top"><ShieldCheck /><span><b>{pick(language, 'تغليف آمن', 'Safe packing')}</b><small>{pick(language, 'لكل قطعة خامتها', 'Right material for every item')}</small></span></div>
        <div className="jm-truck-stage"><div className="jm-road-dash"><i /><i /><i /><i /><i /></div><MovingVanIllustration /></div>
        <div className="jm-visual-card jm-visual-card-bottom"><Clock3 /><span><b>{pick(language, 'في ميعادنا', 'Right on time')}</b><small>{pick(language, 'تنسيق ومتابعة واضحة', 'Clear coordination')}</small></span></div>
      </div>
    </div>
    <div className="jm-container jm-quick-wrap"><QuickRequest navigate={navigate} /></div>
  </section>;
}

function SectionHead({ eyebrow, title, description, light = false }) {
  return <div className={`jm-section-head ${light ? 'light' : ''}`}>
    {eyebrow && <span className="jm-eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>{description && <p>{description}</p>}
  </div>;
}

function TrustStrip() {
  const { language } = useLanguage();
  const items = [
    [ShieldCheck, 'الالتزام والأمان', 'Safety first'], [PackageCheck, 'تغليف احترافي', 'Professional packing'],
    [UserRound, 'عمالة مدربة', 'Trained crews'], [Headphones, 'متابعة مستمرة', 'Continuous updates']
  ];
  return <div className="jm-trust-strip"><div className="jm-container jm-trust-grid">{items.map(([Icon, ar, en]) => <div key={ar}><span><Icon /></span><b>{pick(language, ar, en)}</b></div>)}</div></div>;
}

function ServiceCard({ service, navigate, index = 0 }) {
  const { language } = useLanguage();
  const Icon = ICONS[service.icon] || Truck;
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <article className="jm-service-card" style={{ '--delay': `${index * 100}ms` }} onMouseMove={handleMouseMove}>
      <div className="jm-service-card-glow" />
      <div className="jm-service-number">0{index + 1}</div>
      <span className="jm-service-icon"><Icon /></span>
      <div className="jm-service-content">
        <h3>{service[`title_${language}`] || service.title_ar}</h3>
        <p>{service[`short_${language}`] || service.short_ar}</p>
      </div>
      <button onClick={() => navigate(`/services/${service.slug}`)}>
        {copy[language].common.explore}
        <span className="jm-btn-arrow-wrap"><ArrowLeft size={16} /></span>
      </button>
    </article>
  );
}

function ServicesSection({ section, services, navigate }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  return <section className="jm-section jm-services-section"><div className="jm-container">
    <div className="jm-section-row"><SectionHead {...content} /><button className="jm-text-link" onClick={() => navigate('/services')}>{copy[language].common.allServices}<ArrowLeft /></button></div>
    <div className="jm-services-grid">{services.slice(0, 5).map((service, index) => <ServiceCard key={service.slug} service={service} navigate={navigate} index={index} />)}</div>
  </div></section>;
}

function ProcessSection({ section }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  return <section className="jm-section jm-process-section"><div className="jm-container">
    <div className="jm-process-header">
      <SectionHead {...content} light />
    </div>
    <div className="jm-process-road">
      <div className="jm-process-line-track"><div className="jm-process-line-fill" /></div>
      {PROCESS_STEPS.map((step, index) => (
        <article key={step.n} className="jm-process-step" style={{ '--delay': `${index * 0.15}s` }}>
          <div className="jm-step-dot-wrapper">
            <div className="jm-step-dot-pulse" />
            <span className="jm-step-dot">
              <b className="jm-step-num">{step.n}</b>
              {index === 3 ? <Truck className="jm-step-icon" /> : <span />}
            </span>
          </div>
          <div className="jm-step-content">
            <h3>{pick(language, step.ar, step.en)}</h3>
            <p>{pick(language, step.descAr, step.descEn)}</p>
          </div>
        </article>
      ))}
    </div>
  </div></section>;
}

function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  
  const match = value.match(/^(\D*)(\d+)(\D*)$/);
  const prefix = match ? match[1] : '';
  const target = match ? parseInt(match[2], 10) : 0;
  const suffix = match ? match[3] : '';

  useEffect(() => {
    if (!target) return;
    const node = nodeRef.current;
    let observer;
    let animationFrame;
    
    const startAnimation = () => {
      const duration = 2000;
      const startTime = performance.now();
      
      const updateCount = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOut * target));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(updateCount);
        } else {
          setCount(target);
        }
      };
      
      animationFrame = requestAnimationFrame(updateCount);
    };

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startAnimation();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    
    if (node) observer.observe(node);
    
    return () => {
      if (observer) observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target]);

  return <b ref={nodeRef} dir="ltr">{prefix}{target ? count : value}{suffix}</b>;
}

function ProofSection({ section, navigate }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  const stats = [['1200+', 'نقلة مكتملة', 'Completed moves'], ['8+', 'سنوات خبرة', 'Years experience'], ['98%', 'رضا العملاء', 'Customer satisfaction']];
  return <section className="jm-section jm-proof"><div className="jm-container jm-proof-grid">
    <div className="jm-proof-media"><div className="jm-proof-main"><img src="/joo/packing-team.jpg" alt={pick(language, 'فريق Joo Move أثناء تغليف الأثاث', 'Joo Move team packing furniture')} /></div><div className="jm-proof-float"><PackageCheck /><b>{pick(language, '4 طبقات حماية', '4 protection layers')}</b><small>{pick(language, 'حسب نوع القطعة', 'Matched to every item')}</small></div></div>
    <div className="jm-proof-copy"><SectionHead {...content} /><ul><li><Check />{pick(language, 'استرتش وبابلز وكرتون وزوايا حماية', 'Stretch wrap, bubble wrap, cartons and corner guards')}</li><li><Check />{pick(language, 'ترقيم الكراتين والقطع قبل التحميل', 'Every carton and item labeled before loading')}</li><li><Check />{pick(language, 'ترتيب التحميل حسب الأولوية والوزن', 'Loading planned by weight and priority')}</li></ul><button className="jm-btn jm-btn-navy" onClick={() => navigate('/request-move')}>{copy[language].common.request}<ArrowLeft /></button></div>
  </div><div className="jm-container jm-stats-row">{stats.map(([value, ar, en]) => <div key={ar}><AnimatedNumber value={value} /><span>{pick(language, ar, en)}</span></div>)}</div></section>;
}

function WorkPreview({ section, media, navigate }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  const fallback = ['/joo/move-home.jpg', '/joo/packing-team.jpg', '/joo/office-move.jpg'];
  const items = media.filter((item) => item.show_on_homepage).slice(0, 3);
  const display = items.length ? items : fallback.map((url, i) => ({ id: i, image_url: url, title: pick(language, ['نقلة منزل كاملة', 'تغليف احترافي', 'نقل مكتب منظم'][i], ['Complete home move', 'Professional packing', 'Organized office move'][i]) }));
  return <section className="jm-section jm-work-preview"><div className="jm-container"><div className="jm-section-row"><SectionHead {...content} light /><button className="jm-btn jm-btn-glass" onClick={() => navigate('/our-work')}>{pick(language, 'المعرض الكامل', 'Full gallery')}<ArrowLeft /></button></div>
    <div className="jm-work-grid">{display.map((item, index) => <article key={item.id || item.image_url} className={index === 0 ? 'wide' : ''}><img src={item.image_url} alt={item.title || 'Joo Move project'} /><div><span>{pick(language, 'من أرض الواقع', 'Real project')}</span><h3>{item.title || pick(language, 'نقلة من تنفيذ Joo Move', 'A Joo Move project')}</h3></div></article>)}</div>
  </div></section>;
}

function TestimonialsSection({ section, testimonials }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  return <section className="jm-section"><div className="jm-container"><SectionHead {...content} /><div className="jm-testimonial-grid">{testimonials.slice(0, 3).map((item, index) => <article key={item.id || index}><div className="jm-stars">{'★'.repeat(Number(item.rating || 5))}</div><blockquote>“{item[`text_${language}`] || item.text_ar}”</blockquote><div className="jm-reviewer"><span>{(item[`name_${language}`] || item.name_ar || 'J').charAt(0)}</span><b>{item[`name_${language}`] || item.name_ar}</b></div></article>)}</div></div></section>;
}

function FaqSection({ section, faqs }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  const [open, setOpen] = useState(0);
  return <section className="jm-section jm-faq"><div className="jm-container jm-faq-grid"><SectionHead {...content} /><div>{faqs.map((faq, index) => <article className={open === index ? 'open' : ''} key={faq.id || index}><button onClick={() => setOpen(open === index ? -1 : index)}><b>{faq[`question_${language}`] || faq.question_ar}</b><ChevronDown /></button><p>{faq[`answer_${language}`] || faq.answer_ar}</p></article>)}</div></div></section>;
}

function CtaSection({ section, navigate }) {
  const { language } = useLanguage();
  const content = language === 'ar' ? section.content_ar : section.content_en;
  return <section className="jm-cta"><div className="jm-container jm-cta-inner"><div><span className="jm-eyebrow jm-eyebrow-light">JOO MOVE</span><h2>{content.title}</h2><p>{content.description}</p></div><div><button className="jm-btn jm-btn-red" onClick={() => navigate('/request-move')}>{copy[language].nav.request}<ArrowLeft /></button><a className="jm-btn jm-btn-glass" href={whatsappUrl(BRAND.whatsapp, language)} target="_blank" rel="noreferrer"><MessageCircle />{copy[language].common.whatsapp}</a></div></div></section>;
}

function HomePage({ data, navigate }) {
  const sections = (data.page?.sections || DEFAULT_PAGE_CONTENT.home.sections).filter((section) => section.is_visible !== false).sort((a, b) => a.sort_order - b.sort_order);
  return <main className="jm-home">{sections.map((section) => {
    if (section.type === 'hero') return <HeroSection key={section.key} section={section} navigate={navigate} />;
    if (section.type === 'trust') return <TrustStrip key={section.key} />;
    if (section.type === 'services') return <ServicesSection key={section.key} section={section} services={data.services} navigate={navigate} />;
    if (section.type === 'process') return <ProcessSection key={section.key} section={section} />;
    if (section.type === 'proof') return <ProofSection key={section.key} section={section} navigate={navigate} />;
    if (section.type === 'work') return <WorkPreview key={section.key} section={section} media={data.media} navigate={navigate} />;
    if (section.type === 'testimonials') return <TestimonialsSection key={section.key} section={section} testimonials={data.testimonials} />;
    if (section.type === 'faq') return <FaqSection key={section.key} section={section} faqs={data.faqs} />;
    if (section.type === 'cta') return <CtaSection key={section.key} section={section} navigate={navigate} />;
    return null;
  })}</main>;
}

function PageHero({ eyebrow, title, description }) {
  return <section className="jm-page-hero"><div className="jm-page-orb" /><div className="jm-container"><span className="jm-eyebrow jm-eyebrow-light">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>;
}

function ServicesPage({ services, navigate }) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState('all');
  const filters = [['all', 'الكل', 'All'], ['home', 'نقل', 'Moving'], ['packing', 'تغليف', 'Packing'], ['assembly', 'فك وتركيب', 'Assembly'], ['office', 'مكاتب', 'Offices']];
  const visible = filter === 'all' ? services : services.filter((service) => service.category === filter || (filter === 'home' && service.category === 'loading'));
  return <main><PageHero eyebrow={pick(language, 'خدمة من الباب للباب', 'Door-to-door service')} title={pick(language, 'كل ما تحتاجه لنقلة منظمة', 'Everything for an organized move')} description={pick(language, 'خدمات متكاملة ينفذها فريق واحد ويتابعها مسؤول واحد من البداية للنهاية.', 'Complete services delivered by one accountable team from start to finish.')} />
    <section className="jm-section"><div className="jm-container"><div className="jm-filters">{filters.map(([id, ar, en]) => <button className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} key={id}>{pick(language, ar, en)}</button>)}</div><div className="jm-services-grid jm-services-page-grid">{visible.map((service, index) => <ServiceCard key={service.slug} service={service} navigate={navigate} index={index} />)}</div></div></section>
    <CtaSection section={DEFAULT_PAGE_CONTENT.home.sections.find((s) => s.type === 'cta')} navigate={navigate} />
  </main>;
}

function ServiceDetail({ service, navigate }) {
  const { language } = useLanguage();
  if (!service) return <NotFound navigate={navigate} />;
  const Icon = ICONS[service.icon] || Truck;
  const bullets = service[`bullets_${language}`] || service.bullets_ar || [];
  return <main><section className="jm-service-detail-hero"><div className="jm-container jm-service-detail-grid"><div><span className="jm-service-big-icon"><Icon /></span><span className="jm-eyebrow jm-eyebrow-light">JOO MOVE SERVICE</span><h1>{service[`title_${language}`] || service.title_ar}</h1><p>{service[`body_${language}`] || service.body_ar}</p><button className="jm-btn jm-btn-red" onClick={() => navigate(`/request-move?service=${service.slug}`)}>{copy[language].common.request}<ArrowLeft /></button></div><div className="jm-service-photo"><img src={service.cover_media || '/joo/move-home.jpg'} alt={service[`title_${language}`] || service.title_ar} /></div></div></section>
    <section className="jm-section"><div className="jm-container jm-detail-body"><div><SectionHead eyebrow={pick(language, 'داخل الخدمة', 'Included')} title={pick(language, 'تفاصيل محسوبة قبل يوم النقل', 'Every detail planned before moving day')} /><div className="jm-included-grid">{bullets.map((bullet) => <div key={bullet}><CheckCircle2 /><b>{bullet}</b></div>)}</div></div><aside><h3>{pick(language, 'جاهز تحدد تفاصيل نقلتك؟', 'Ready to plan your move?')}</h3><p>{pick(language, 'الطلب لا يحتاج حساب ويستغرق دقائق.', 'No account needed. It only takes a few minutes.')}</p><button className="jm-btn jm-btn-red" onClick={() => navigate(`/request-move?service=${service.slug}`)}>{copy[language].nav.request}</button></aside></div></section>
  </main>;
}

const WIZARD_STEPS = [
  ['بياناتك', 'Your details'], ['خط النقل', 'Move route'], ['الوصول', 'Access'],
  ['محتوى النقلة', 'Move contents'], ['الموعد', 'Schedule'], ['المراجعة', 'Review']
];

const EGYPT_GOVERNORATES = [
  ['القاهرة', 'Cairo'], ['الجيزة', 'Giza'], ['الإسكندرية', 'Alexandria'], ['القليوبية', 'Qalyubia'],
  ['بورسعيد', 'Port Said'], ['السويس', 'Suez'], ['الإسماعيلية', 'Ismailia'], ['الشرقية', 'Sharqia'],
  ['الدقهلية', 'Dakahlia'], ['الغربية', 'Gharbia'], ['المنوفية', 'Monufia'], ['البحيرة', 'Beheira'],
  ['كفر الشيخ', 'Kafr El Sheikh'], ['دمياط', 'Damietta'], ['مطروح', 'Matrouh'], ['الفيوم', 'Faiyum'],
  ['بني سويف', 'Beni Suef'], ['المنيا', 'Minya'], ['أسيوط', 'Asyut'], ['سوهاج', 'Sohag'],
  ['قنا', 'Qena'], ['الأقصر', 'Luxor'], ['أسوان', 'Aswan'], ['البحر الأحمر', 'Red Sea'],
  ['الوادي الجديد', 'New Valley'], ['شمال سيناء', 'North Sinai'], ['جنوب سيناء', 'South Sinai'],
];

const initialRequest = {
  customer_name: '', phone: '', whatsapp: '', alternate_phone: '', move_type: 'home',
  origin_governorate: 'القاهرة', origin_area: '', origin_address: '', destination_governorate: 'القاهرة', destination_area: '', destination_address: '',
  origin_floor: '', destination_floor: '', origin_elevator: false, destination_elevator: false,
  stair_width: 'normal', parking_distance: 'near', rooms: 2, appliances: [], large_items: '',
  services: ['furniture-moving'], preferred_date: '', preferred_period: 'morning', flexible_date: false, notes: '', media: []
};

function Field({ label, children, wide = false }) { return <label className={`jm-field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label>; }

function RequestMovePage({ services, navigate }) {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialRequest);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('joo_move_draft') || 'null');
      const quick = JSON.parse(sessionStorage.getItem('joo_quick_request') || 'null');
      const params = new URLSearchParams(window.location.search);
      setForm((current) => ({ ...current, ...(saved || {}), ...(quick || {}), services: params.get('service') ? [params.get('service')] : (saved?.services || current.services) }));
      sessionStorage.removeItem('joo_quick_request');
    } catch {}
  }, []);
  useEffect(() => { if (!success) localStorage.setItem('joo_move_draft', JSON.stringify(form)); }, [form, success]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleArray = (key, value) => update(key, form[key].includes(value) ? form[key].filter((item) => item !== value) : [...form[key], value]);
  const validate = () => {
    if (step === 0 && (!form.customer_name.trim() || cleanPhone(form.phone).length < 10)) return pick(language, 'اكتب الاسم ورقم هاتف صحيح.', 'Enter your name and a valid phone number.');
    if (step === 1 && (!form.origin_area.trim() || !form.destination_area.trim())) return pick(language, 'حدد منطقة النقل والوجهة.', 'Enter the origin and destination areas.');
    if (step === 3 && !form.services.length) return pick(language, 'اختر خدمة واحدة على الأقل.', 'Choose at least one service.');
    if (step === 4 && !form.preferred_date) return pick(language, 'اختر الموعد المفضل.', 'Choose a preferred date.');
    return '';
  };
  const next = () => { const message = validate(); if (message) { setError(message); return; } setError(''); setStep((value) => Math.min(5, value + 1)); window.scrollTo({ top: 220, behavior: 'smooth' }); };
  const uploadFiles = async () => {
    const uploaded = [];
    for (const file of files.slice(0, 10)) {
      const body = new FormData(); body.append('image', file);
      const response = await fetch('/api/upload', { method: 'POST', body });
      if (!response.ok) throw new Error((await response.json()).error || 'Upload failed');
      uploaded.push(await response.json());
    }
    return uploaded;
  };
  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      const media = files.length ? await uploadFiles() : [];
      const response = await fetch('/api/move-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, media }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed');
      setSuccess(result); localStorage.removeItem('joo_move_draft');
      const saved = JSON.parse(localStorage.getItem('joo_saved_requests') || '[]');
      localStorage.setItem('joo_saved_requests', JSON.stringify([{ requestNumber: result.requestNumber, phone: form.phone, createdAt: result.createdAt }, ...saved].slice(0, 10)));
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };
  if (success) return <main className="jm-wizard-page"><div className="jm-container"><div className="jm-success-card"><span><CheckCircle2 /></span><p className="jm-eyebrow">JOO MOVE</p><h1>{pick(language, 'طلبك وصل بنجاح', 'Your request is in')}</h1><p>{pick(language, 'فريقنا هيراجع التفاصيل ويتواصل معاك لتأكيد الخطوة التالية.', 'Our team will review the details and contact you to confirm the next step.')}</p><div className="jm-request-number"><small>{pick(language, 'رقم الطلب', 'Request number')}</small><b>{success.requestNumber}</b><button onClick={() => navigator.clipboard?.writeText(success.requestNumber)}><Copy /></button></div><div className="jm-success-actions"><button className="jm-btn jm-btn-navy" onClick={() => navigate('/track-request')}>{copy[language].nav.track}</button><button className="jm-btn jm-btn-soft" onClick={() => navigate('/')}>{copy[language].nav.home}</button></div></div></div></main>;
  return <main className="jm-wizard-page"><PageHero title={pick(language, 'احكيلنا تفاصيل نقلتك', 'Tell us about your move')} description={pick(language, 'كل معلومة بتساعدنا نجهز الفريق والخامات والعربية المناسبة من أول مرة.', 'Each detail helps us assign the right crew, materials and truck from the start.')} />
    <section className="jm-container jm-wizard-shell"><div className="jm-wizard-progress">{WIZARD_STEPS.map(([ar, en], index) => <button key={ar} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => index < step && setStep(index)}><span>{index < step ? <Check size={16} /> : index + 1}</span><b>{pick(language, ar, en)}</b></button>)}</div>
      <div className="jm-wizard-card"><div className="jm-wizard-title"><span>{pick(language, `الخطوة ${step + 1} من 6`, `Step ${step + 1} of 6`)}</span><h2>{pick(language, WIZARD_STEPS[step][0], WIZARD_STEPS[step][1])}</h2></div>
        <div className="jm-form-grid">
          {step === 0 && <><Field label={pick(language, 'الاسم بالكامل *', 'Full name *')} wide><input value={form.customer_name} onChange={(e) => update('customer_name', e.target.value)} /></Field><Field label={pick(language, 'رقم الهاتف *', 'Phone *')}><input inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></Field><Field label={pick(language, 'رقم واتساب', 'WhatsApp')}><input inputMode="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder={pick(language, 'اتركه فارغًا لو نفس الرقم', 'Leave blank if same number')} /></Field><Field label={pick(language, 'هاتف بديل', 'Alternate phone')}><input inputMode="tel" value={form.alternate_phone} onChange={(e) => update('alternate_phone', e.target.value)} /></Field><Field label={pick(language, 'نوع النقلة', 'Move type')}><div className="jm-choice-row"><button className={form.move_type === 'home' ? 'active' : ''} onClick={() => update('move_type', 'home')} type="button"><Home />{pick(language, 'منزل', 'Home')}</button><button className={form.move_type === 'office' ? 'active' : ''} onClick={() => update('move_type', 'office')} type="button"><Building2 />{pick(language, 'مكتب', 'Office')}</button></div></Field></>}
          {step === 1 && <><Field label={pick(language, 'محافظة النقل', 'Origin governorate')}><select value={form.origin_governorate} onChange={(e) => update('origin_governorate', e.target.value)}>{EGYPT_GOVERNORATES.map(([ar, en]) => <option key={ar} value={ar}>{pick(language, ar, en)}</option>)}</select></Field><Field label={pick(language, 'منطقة النقل *', 'Origin area *')}><input value={form.origin_area} onChange={(e) => update('origin_area', e.target.value)} /></Field><Field label={pick(language, 'العنوان الحالي بالتفصيل', 'Current address')} wide><textarea value={form.origin_address} onChange={(e) => update('origin_address', e.target.value)} /></Field><Field label={pick(language, 'محافظة الوجهة', 'Destination governorate')}><select value={form.destination_governorate} onChange={(e) => update('destination_governorate', e.target.value)}>{EGYPT_GOVERNORATES.map(([ar, en]) => <option key={ar} value={ar}>{pick(language, ar, en)}</option>)}</select></Field><Field label={pick(language, 'منطقة الوجهة *', 'Destination area *')}><input value={form.destination_area} onChange={(e) => update('destination_area', e.target.value)} /></Field><Field label={pick(language, 'عنوان الوجهة بالتفصيل', 'Destination address')} wide><textarea value={form.destination_address} onChange={(e) => update('destination_address', e.target.value)} /></Field></>}
          {step === 2 && <><Field label={pick(language, 'دور النقل', 'Origin floor')}><input value={form.origin_floor} onChange={(e) => update('origin_floor', e.target.value)} placeholder="مثال: 3" /></Field><Field label={pick(language, 'دور الوجهة', 'Destination floor')}><input value={form.destination_floor} onChange={(e) => update('destination_floor', e.target.value)} /></Field><Field label={pick(language, 'الأسانسير في مكان النقل', 'Origin elevator')}><div className="jm-switch-row"><button type="button" className={form.origin_elevator ? 'active' : ''} onClick={() => update('origin_elevator', true)}>{pick(language, 'موجود', 'Available')}</button><button type="button" className={!form.origin_elevator ? 'active' : ''} onClick={() => update('origin_elevator', false)}>{pick(language, 'غير موجود', 'None')}</button></div></Field><Field label={pick(language, 'الأسانسير في الوجهة', 'Destination elevator')}><div className="jm-switch-row"><button type="button" className={form.destination_elevator ? 'active' : ''} onClick={() => update('destination_elevator', true)}>{pick(language, 'موجود', 'Available')}</button><button type="button" className={!form.destination_elevator ? 'active' : ''} onClick={() => update('destination_elevator', false)}>{pick(language, 'غير موجود', 'None')}</button></div></Field><Field label={pick(language, 'عرض السلم', 'Stair width')}><select value={form.stair_width} onChange={(e) => update('stair_width', e.target.value)}><option value="wide">{pick(language, 'واسع', 'Wide')}</option><option value="normal">{pick(language, 'متوسط', 'Normal')}</option><option value="narrow">{pick(language, 'ضيق', 'Narrow')}</option></select></Field><Field label={pick(language, 'وقوف العربية', 'Truck parking')}><select value={form.parking_distance} onChange={(e) => update('parking_distance', e.target.value)}><option value="near">{pick(language, 'أمام المدخل', 'At entrance')}</option><option value="medium">{pick(language, 'مسافة قصيرة', 'Short distance')}</option><option value="far">{pick(language, 'بعيد عن المدخل', 'Far from entrance')}</option></select></Field></>}
          {step === 3 && <><Field label={pick(language, 'عدد الغرف التقريبي', 'Approximate rooms')}><div className="jm-counter"><button type="button" onClick={() => update('rooms', Math.max(1, form.rooms - 1))}>−</button><b>{form.rooms}</b><button type="button" onClick={() => update('rooms', form.rooms + 1)}>+</button></div></Field><Field label={pick(language, 'الأجهزة الكبيرة', 'Large appliances')} wide><div className="jm-checkbox-grid">{[['fridge', 'ثلاجة', 'Fridge'], ['washer', 'غسالة', 'Washer'], ['oven', 'بوتاجاز', 'Oven'], ['ac', 'تكييف', 'AC'], ['tv', 'شاشة', 'TV']].map(([id, ar, en]) => <button type="button" className={form.appliances.includes(id) ? 'active' : ''} onClick={() => toggleArray('appliances', id)} key={id}><Check />{pick(language, ar, en)}</button>)}</div></Field><Field label={pick(language, 'الخدمات المطلوبة *', 'Services needed *')} wide><div className="jm-checkbox-grid jm-services-check">{services.map((service) => <button type="button" className={form.services.includes(service.slug) ? 'active' : ''} onClick={() => toggleArray('services', service.slug)} key={service.slug}><Check />{service[`title_${language}`] || service.title_ar}</button>)}</div></Field><Field label={pick(language, 'قطع كبيرة أو حساسة', 'Large or delicate items')} wide><textarea value={form.large_items} onChange={(e) => update('large_items', e.target.value)} placeholder={pick(language, 'مثال: بيانو، نيش زجاج، سفرة كبيرة...', 'e.g. piano, glass cabinet, large dining table...')} /></Field></>}
          {step === 4 && <><Field label={pick(language, 'التاريخ المفضل *', 'Preferred date *')}><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferred_date} onChange={(e) => update('preferred_date', e.target.value)} /></Field><Field label={pick(language, 'الفترة المفضلة', 'Preferred period')}><select value={form.preferred_period} onChange={(e) => update('preferred_period', e.target.value)}><option value="morning">{pick(language, 'صباحًا', 'Morning')}</option><option value="afternoon">{pick(language, 'ظهرًا', 'Afternoon')}</option><option value="evening">{pick(language, 'مساءً', 'Evening')}</option></select></Field><Field label={pick(language, 'مرونة الموعد', 'Date flexibility')} wide><label className="jm-toggle"><input type="checkbox" checked={form.flexible_date} onChange={(e) => update('flexible_date', e.target.checked)} /><span />{pick(language, 'الموعد مرن ويمكن تنسيقه مع الفريق', 'The date is flexible and can be coordinated')}</label></Field><Field label={pick(language, 'صور أو فيديو للعفش', 'Furniture photos or videos')} wide><div className="jm-upload"><UploadCloud /><b>{pick(language, 'ارفع حتى 10 ملفات', 'Upload up to 10 files')}</b><small>{pick(language, 'الصور تساعدنا نراجع الطلب بدقة', 'Photos help us review accurately')}</small><input type="file" multiple accept="image/*,video/mp4,video/webm" onChange={(e) => setFiles([...e.target.files].slice(0, 10))} /></div>{files.length > 0 && <p className="jm-file-count"><CheckCircle2 />{pick(language, `تم اختيار ${files.length} ملف`, `${files.length} files selected`)}</p>}</Field><Field label={pick(language, 'ملاحظات إضافية', 'Additional notes')} wide><textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} /></Field></>}
          {step === 5 && <div className="jm-review-grid"><article><span>{pick(language, 'العميل', 'Customer')}</span><b>{form.customer_name}</b><p><bdi>{form.phone}</bdi></p></article><article><span>{pick(language, 'خط النقل', 'Route')}</span><b>{form.origin_area} ← {form.destination_area}</b><p>{pick(language, form.move_type === 'home' ? 'منزل' : 'مكتب', form.move_type === 'home' ? 'Home' : 'Office')}</p></article><article><span>{pick(language, 'الموعد', 'Schedule')}</span><b>{form.preferred_date}</b><p>{form.preferred_period}</p></article><article><span>{pick(language, 'الخدمات', 'Services')}</span><b>{form.services.length}</b><p>{services.filter((s) => form.services.includes(s.slug)).map((s) => s[`title_${language}`] || s.title_ar).join('، ')}</p></article><article><span>{pick(language, 'المرفقات', 'Attachments')}</span><b>{files.length}</b><p>{pick(language, 'صور أو فيديو', 'Photos or videos')}</p></article><article className="jm-review-note"><ShieldCheck /><p>{pick(language, 'إرسال الطلب لا يعتبر تأكيدًا للسعر أو الموعد. سيتواصل الفريق معك للمراجعة والتأكيد.', 'Submitting does not confirm the price or date. Our team will contact you to review and confirm.')}</p></article></div>}
        </div>
        {error && <div className="jm-form-error">{error}</div>}
        <div className="jm-wizard-actions">{step > 0 && <button className="jm-btn jm-btn-soft" onClick={() => { setStep(step - 1); setError(''); }}><ArrowRight />{pick(language, 'السابق', 'Back')}</button>}<span />{step < 5 ? <button className="jm-btn jm-btn-red" onClick={next}>{pick(language, 'التالي', 'Continue')}<ArrowLeft /></button> : <button className="jm-btn jm-btn-red" disabled={submitting} onClick={submit}>{submitting ? copy[language].common.loading : pick(language, 'أرسل طلب النقلة', 'Submit move request')}<Send /></button>}</div>
      </div>
    </section>
  </main>;
}

function TrackPage() {
  const { language } = useLanguage();
  const [input, setInput] = useState({ requestNumber: '', phone: '' });
  const [result, setResult] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const track = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setResult(null);
    try { const response = await fetch(`/api/move-requests/track?requestNumber=${encodeURIComponent(input.requestNumber)}&phone=${encodeURIComponent(input.phone)}`); const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const currentIndex = result ? MOVE_STATUSES.findIndex((item) => item.value === result.status) : -1;
  return <main><PageHero eyebrow={pick(language, 'متابعة آمنة', 'Secure tracking')} title={pick(language, 'اعرف نقلتك وصلت لفين', 'See where your move stands')} description={pick(language, 'اكتب رقم الطلب أو رقم الهاتف المستخدم وقت الحجز.', 'Enter either the request number or the phone used when booking.')} />
    <section className="jm-section"><div className="jm-container jm-track-layout"><form className="jm-track-form" onSubmit={track}><h2>{pick(language, 'بيانات الطلب', 'Request details')}</h2><Field label={pick(language, 'رقم الطلب (اختياري)', 'Request number (optional)')}><input value={input.requestNumber} onChange={(e) => setInput({ ...input, requestNumber: e.target.value.toUpperCase() })} placeholder="JM-2026-000123" /></Field><Field label={pick(language, 'رقم الهاتف (اختياري)', 'Phone number (optional)')}><input inputMode="tel" value={input.phone} onChange={(e) => setInput({ ...input, phone: e.target.value })} /></Field>{error && <div className="jm-form-error">{error}</div>}<button className="jm-btn jm-btn-red" disabled={loading}>{loading ? copy[language].common.loading : copy[language].nav.track}<Search /></button><p><ShieldCheck />{pick(language, 'يكفي رقم الطلب أو الهاتف، وإذا أدخلتهما معًا سنتحقق من تطابقهما.', 'Use either field; if both are entered, we verify that they match.')}</p></form>
      <div className="jm-track-result">{!result ? <div className="jm-track-empty"><Route /><h3>{pick(language, 'حالة الطلب هتظهر هنا', 'Your status will appear here')}</h3><p>{pick(language, 'هنعرض الموعد والخدمات وخطوات التنفيذ فقط، بدون إظهار العناوين الكاملة.', 'We only show schedule, services and progress—never full addresses.')}</p></div> : <><div className="jm-track-summary"><span>{pick(language, 'طلب رقم', 'Request')}</span><h2>{result.requestNumber}</h2><p>{result.originArea} ← {result.destinationArea}</p></div><div className="jm-status-timeline">{MOVE_STATUSES.filter((item) => !['cancelled'].includes(item.value)).map((status, index) => <div className={index <= currentIndex ? 'done' : ''} key={status.value}><span>{index < currentIndex ? <Check /> : index + 1}</span><b>{status[language]}</b></div>)}</div></>}</div>
    </div></section>
  </main>;
}

function WorkPage({ media }) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState('all'); const [lightbox, setLightbox] = useState(null);
  const fallback = [
    { id: 'a', image_url: '/joo/move-home.jpg', title: 'نقل منزل', description: 'home' },
    { id: 'b', image_url: '/joo/packing-team.jpg', title: 'تغليف كامل', description: 'packing' },
    { id: 'c', image_url: '/joo/office-move.jpg', title: 'نقل مكتب', description: 'office' },
    { id: 'd', image_url: '/joo/move-detail.jpg', title: 'فك وتركيب', description: 'assembly' },
  ];
  const items = media.length ? media : fallback;
  const visible = filter === 'all' ? items : items.filter((item) => String(item.description || '').toLowerCase().includes(filter));
  return <main><PageHero eyebrow={pick(language, 'من أرض الواقع', 'Real projects')} title={pick(language, 'شغلنا على الطبيعة', 'Our work in action')} description={pick(language, 'صور وفيديوهات من نقلات نفذها فريق Joo Move.', 'Photos and videos from moves delivered by Joo Move.')} /><section className="jm-section"><div className="jm-container"><div className="jm-filters">{[['all', 'الكل', 'All'], ['packing', 'تغليف', 'Packing'], ['assembly', 'فك وتركيب', 'Assembly'], ['home', 'منازل', 'Homes'], ['office', 'مكاتب', 'Offices']].map(([id, ar, en]) => <button className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} key={id}>{pick(language, ar, en)}</button>)}</div><div className="jm-masonry">{visible.map((item, index) => <button key={item.id} className={index % 3 === 0 ? 'tall' : ''} onClick={() => setLightbox(item)}><img loading="lazy" src={item.image_url} alt={item.title || 'Joo Move'} />{String(item.image_url).match(/\.(mp4|webm)$/i) && <Play />}<span>{item.title || pick(language, 'نقلة Joo Move', 'Joo Move project')}</span></button>)}</div>{!visible.length && <div className="jm-empty-state"><Boxes /><h3>{pick(language, 'المعرض جاهز لاستقبال أعمالك', 'The gallery is ready for your projects')}</h3><p>{pick(language, 'ارفع الصور والفيديوهات من لوحة الأدمن وحدد التصنيف.', 'Upload photos and videos from the admin panel and choose a category.')}</p></div>}</div></section>{lightbox && <div className="jm-lightbox" onClick={() => setLightbox(null)}><button><X /></button>{String(lightbox.image_url).match(/\.(mp4|webm)$/i) ? <video src={lightbox.image_url} controls autoPlay /> : <img src={lightbox.image_url} alt={lightbox.title || 'Joo Move'} />}<h3>{lightbox.title}</h3></div>}</main>;
}

function AboutPage({ navigate }) {
  const { language } = useLanguage();
  return <main><PageHero eyebrow={pick(language, 'عن Joo Move', 'About Joo Move')} title={pick(language, 'بننقل أكتر من عفش… بننقل حياة كاملة', 'We move more than furniture')} description={pick(language, 'شركة نقل مصرية بتبني كل نقلة على التخطيط، العناية والتواصل الواضح.', 'An Egyptian moving company built on planning, care and clear communication.')} /><section className="jm-section"><div className="jm-container jm-about-story"><div><img src="/joo/packing-team.jpg" alt="Joo Move team" /></div><div><SectionHead eyebrow={pick(language, 'قصتنا', 'Our story')} title={pick(language, 'هدفنا إن يوم النقل مايبقاش يوم قلق', 'Moving day should not be stressful')} description={pick(language, 'نبدأ بفهم المكان والقطع والمواعيد، وبعدها نبني خطة تناسب النقلة فعلًا. كل مسؤول في الفريق عارف دوره، وكل عميل عارف الخطوة الجاية.', 'We understand your locations, items and timing first, then build a move plan that actually fits. Every crew member knows the role, and every customer knows what comes next.')} /><div className="jm-values"><div><ShieldCheck /><b>{pick(language, 'الأمان قبل السرعة', 'Safety before speed')}</b></div><div><Clock3 /><b>{pick(language, 'المواعيد التزام', 'Time is a commitment')}</b></div><div><Headphones /><b>{pick(language, 'تواصل واضح', 'Clear communication')}</b></div></div><button className="jm-btn jm-btn-red" onClick={() => navigate('/request-move')}>{copy[language].nav.request}</button></div></div></section></main>;
}

function ContactPage({ settings }) {
  const { language } = useLanguage();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' }); const [state, setState] = useState('');
  const submit = async (event) => { event.preventDefault(); setState('loading'); try { const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error(); setState('success'); setForm({ firstName: '', lastName: '', phone: '', email: '', message: '' }); } catch { setState('error'); } };
  const phone = settings.support_whatsapp || settings.admin_whatsapp || BRAND.phone;
  return <main><PageHero eyebrow={pick(language, 'إحنا قريبين', 'We are nearby')} title={pick(language, 'كلمنا بالطريقة الأسهل ليك', 'Contact us your way')} description={pick(language, 'مكالمة، واتساب أو رسالة — فريقنا يراجع التفاصيل ويرد عليك.', 'Call, WhatsApp or send a message—our team will review and respond.')} /><section className="jm-section"><div className="jm-container jm-contact-grid"><div className="jm-contact-cards"><a href={`tel:${cleanPhone(phone)}`}><Phone /><span><b>{pick(language, 'اتصل بنا', 'Call us')}</b><bdi>{phone}</bdi></span></a><a href={whatsappUrl(phone, language)} target="_blank" rel="noreferrer" className="jm-whatsapp-card"><WhatsAppIcon /><span><b>{pick(language, 'واتساب نقل الأثاث', 'Furniture moving WhatsApp')}</b><small>{pick(language, 'استفسر عن النقل والتغليف والمعاينة', 'Ask about moving, packing and inspection')}</small></span></a><div><MapPin /><span><b>{pick(language, 'نطاق الخدمة', 'Service area')}</b><small>{pick(language, settings.joo_area_ar || BRAND.areaAr, settings.joo_area_en || BRAND.areaEn)}</small></span></div></div><form className="jm-contact-form" onSubmit={submit}><h2>{pick(language, 'ابعت لنا رسالة', 'Send us a message')}</h2><div className="jm-form-grid"><Field label={pick(language, 'الاسم الأول', 'First name')}><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field><Field label={pick(language, 'اسم العائلة', 'Last name')}><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field><Field label={pick(language, 'الهاتف', 'Phone')}><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label={pick(language, 'البريد الإلكتروني', 'Email')}><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label={pick(language, 'رسالتك', 'Message')} wide><textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field></div>{state === 'success' && <div className="jm-form-success"><CheckCircle2 />{pick(language, 'رسالتك وصلت بنجاح.', 'Your message was sent.')}</div>}{state === 'error' && <div className="jm-form-error">{pick(language, 'حصل خطأ. حاول مرة تانية.', 'Something went wrong. Please try again.')}</div>}<button className="jm-btn jm-btn-red" disabled={state === 'loading'}>{pick(language, 'إرسال الرسالة', 'Send message')}<Send /></button></form></div></section></main>;
}

function PolicyPage() {
  const { language } = useLanguage();
  const sections = [
    ['المعاينة والتسعير', 'Inspection & pricing', 'السعر النهائي يعتمد على حجم ومحتوى النقلة، الأدوار، المداخل، المسافة والخدمات المطلوبة. يتم اعتماد السعر والموعد بعد مراجعة الفريق.', 'Final pricing depends on move size, access, distance and services. Price and date are confirmed after team review.'],
    ['مسؤولية العميل', 'Customer responsibility', 'يجب الإفصاح عن القطع الثمينة أو القابلة للكسر، وتجهيز المستندات والأموال والمقتنيات الشخصية للنقل بشكل منفصل.', 'Please declare valuables and fragile items. Documents, money and personal valuables should be transported separately.'],
    ['تغيير الموعد', 'Rescheduling', 'يتم طلب تغيير الموعد في أقرب وقت، ويخضع الموعد البديل لتوافر الفريق والعربية المناسبة.', 'Request rescheduling as early as possible. Alternative dates depend on crew and truck availability.'],
    ['الشكاوى والمتابعة', 'Complaints & support', 'أي ملاحظة يتم تسجيلها فورًا مع مسؤول المتابعة ومراجعتها وفق صور الحالة وتفاصيل التنفيذ.', 'Any concern is logged immediately with your coordinator and reviewed against the move record and photos.'],
  ];
  return <main><PageHero eyebrow={pick(language, 'وضوح من البداية', 'Clear from the start')} title={pick(language, 'سياسة الخدمة والضمان', 'Service & assurance policy')} description={pick(language, 'قواعد بسيطة تحفظ حق العميل والفريق وتخلي كل خطوة واضحة.', 'Simple terms that protect both customer and crew and keep every step clear.')} /><section className="jm-section"><div className="jm-container jm-policy-list">{sections.map(([ar, en, bodyAr, bodyEn], index) => <article key={ar}><span>0{index + 1}</span><div><h2>{pick(language, ar, en)}</h2><p>{pick(language, bodyAr, bodyEn)}</p></div></article>)}</div></section></main>;
}

function MyRequestsPage({ navigate }) {
  const { language } = useLanguage(); const [saved, setSaved] = useState([]);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem('joo_saved_requests') || '[]')); } catch {} }, []);
  return <main><PageHero eyebrow={pick(language, 'حساب اختياري', 'Optional account')} title={pick(language, 'طلباتك المحفوظة', 'Your saved requests')} description={pick(language, 'الطلبات المرسلة من هذا الجهاز تظهر هنا. يمكنك التتبع برقم الطلب أو الهاتف.', 'Requests sent from this device appear here. Track using either the request number or phone.')} /><section className="jm-section"><div className="jm-container jm-saved-list">{saved.length ? saved.map((item) => <article key={item.requestNumber}><div><span>{pick(language, 'طلب نقل', 'Move request')}</span><h3>{item.requestNumber}</h3><small>{new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB')}</small></div><button className="jm-btn jm-btn-soft" onClick={() => navigate('/track-request')}>{copy[language].nav.track}<ArrowLeft /></button></article>) : <div className="jm-empty-state"><Boxes /><h3>{pick(language, 'مفيش طلبات محفوظة على الجهاز ده', 'No requests saved on this device')}</h3><p>{pick(language, 'ابدأ طلب جديد أو تابع طلب سابق برقم الطلب أو الهاتف.', 'Start a new request or track an existing one using its request number or phone.')}</p><button className="jm-btn jm-btn-red" onClick={() => navigate('/request-move')}>{copy[language].nav.request}</button></div>}</div></section></main>;
}

function NotFound({ navigate }) {
  const { language } = useLanguage();
  return <main className="jm-not-found"><div className="jm-notfound-road"><Truck /></div><span>404</span><h1>{pick(language, 'العربية ضلّت الطريق', 'Our truck took a wrong turn')}</h1><p>{pick(language, 'الصفحة دي مش موجودة، لكن نقدر نرجعك للطريق الصح.', 'This page does not exist, but we can get you back on route.')}</p><button className="jm-btn jm-btn-red" onClick={() => navigate('/')}>{copy[language].nav.home}</button></main>;
}

function Footer({ navigate, settings, setFooterInView }) {
  const { language } = useLanguage(); const c = copy[language];
  const phone = settings.support_whatsapp || settings.admin_whatsapp || BRAND.phone;
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current || !setFooterInView) return;
    const observer = new IntersectionObserver(([entry]) => {
      setFooterInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setFooterInView]);

  return <footer className="jm-footer" ref={ref}><div className="jm-container jm-footer-grid"><div className="jm-footer-brand"><Logo inverse /><p>{pick(language, 'نقل وتغليف وفك وتركيب الأثاث للمنازل والمكاتب باهتمام حقيقي بكل قطعة.', 'Furniture moving, packing and assembly for homes and offices, with genuine care for every item.')}</p><div className="jm-socials">{settings.facebook_link && <a href={settings.facebook_link} target="_blank" rel="noreferrer" className="jm-social-fb"><Facebook /></a>}{settings.instagram_link && <a href={settings.instagram_link} target="_blank" rel="noreferrer" className="jm-social-ig"><Instagram /></a>}<a href={whatsappUrl(phone, language)} target="_blank" rel="noreferrer" className="jm-social-wa"><WhatsAppIcon /></a></div></div><div><h3>{pick(language, 'روابط سريعة', 'Quick links')}</h3><button onClick={() => navigate('/')}>{c.nav.home}</button><button onClick={() => navigate('/services')}>{c.nav.services}</button><button onClick={() => navigate('/our-work')}>{c.nav.work}</button><button onClick={() => navigate('/about')}>{c.nav.about}</button></div><div><h3>{pick(language, 'خدمة العملاء', 'Customer care')}</h3><button onClick={() => navigate('/track-request')}>{c.nav.track}</button><button onClick={() => navigate('/service-policy')}>{pick(language, 'سياسة الخدمة', 'Service policy')}</button><button onClick={() => navigate('/my-requests')}>{pick(language, 'طلباتي', 'My requests')}</button><button onClick={() => navigate('/contact')}>{c.nav.contact}</button></div><div className="jm-footer-contact"><h3>{pick(language, 'جاهز للنقلة؟', 'Ready to move?')}</h3><a href={`tel:${cleanPhone(phone)}`}><Phone /><bdi>{phone}</bdi></a><span><MapPin />{pick(language, settings.joo_area_ar || BRAND.areaAr, settings.joo_area_en || BRAND.areaEn)}</span><button className="jm-btn jm-btn-red" onClick={() => navigate('/request-move')}>{c.nav.request}</button></div></div><div className="jm-container jm-footer-bottom"><span>© {new Date().getFullYear()} Joo Move. {pick(language, 'جميع الحقوق محفوظة.', 'All rights reserved.')}</span><a href="https://selectcustomersmarketing.com/" target="_blank" rel="noreferrer" className="made-in sc-marketing-link" onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} title="زيارة موقع S C Markting"><span className="sc-marketing-text">تم إنشاء هذا الموقع بواسطة <span className="sc-marketing-brand" style={{ paddingRight: '0.3rem' }}>C Markting</span></span><img src="/s-logo.png" alt="SC Marketing Logo" className="sc-marketing-img" /></a></div></footer>;
}

function MobileDock({ navigate, settings }) {
  const { language } = useLanguage(); const phone = settings.support_whatsapp || settings.admin_whatsapp || BRAND.phone;
  return <div className="jm-mobile-dock"><a href={`tel:${cleanPhone(phone)}`}><Phone /><span>{pick(language, 'اتصال', 'Call')}</span></a><a href={whatsappUrl(phone, language)} target="_blank" rel="noreferrer" className="jm-whatsapp-color"><WhatsAppIcon /><span>{pick(language, 'واتساب', 'WhatsApp')}</span></a><button onClick={() => navigate('/request-move')}><Truck /><span>{copy[language].nav.request}</span></button></div>;
}

function ScrollToTopButton({ footerInView }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const toggleVisible = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', toggleVisible, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <button className={`jm-scroll-top ${scrolled && !footerInView ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Scroll to top">
      <ArrowUp size={22} />
    </button>
  );
}

export default function JooMoveApp() {
  const [path, navigate] = usePath();
  const data = usePublicData();
  const { language } = useLanguage();
  const [footerInView, setFooterInView] = useState(false);
  const isAdmin = path.startsWith('/scpanel');
  useEffect(() => {
    const titleMap = { '/': 'Joo Move', '/services': pick(language, 'خدماتنا', 'Services'), '/request-move': pick(language, 'اطلب نقلة', 'Request a Move'), '/our-work': pick(language, 'شغلنا', 'Our Work'), '/about': pick(language, 'عن Joo Move', 'About Joo Move'), '/track-request': pick(language, 'تابع طلبك', 'Track Request'), '/contact': pick(language, 'تواصل معنا', 'Contact') };
    document.title = `${titleMap[path] || 'Joo Move'} | Joo Move`;
  }, [path, language]);
  if (isAdmin) return <JooAdmin navigate={navigate} />;
  let page;
  if (path === '/') page = <HomePage data={data} navigate={navigate} />;
  else if (path === '/services') page = <ServicesPage services={data.services} navigate={navigate} />;
  else if (path.startsWith('/services/')) page = <ServiceDetail service={data.services.find((item) => item.slug === path.split('/')[2])} navigate={navigate} />;
  else if (path === '/request-move') page = <RequestMovePage services={data.services} navigate={navigate} />;
  else if (path === '/our-work') page = <WorkPage media={data.media} />;
  else if (path === '/about') page = <AboutPage navigate={navigate} />;
  else if (path === '/track-request') page = <TrackPage />;
  else if (path === '/contact') page = <ContactPage settings={data.settings} />;
  else if (path === '/service-policy') page = <PolicyPage />;
  else if (path === '/my-requests' || path === '/customer/login') page = <MyRequestsPage navigate={navigate} />;
  else page = <NotFound navigate={navigate} />;
  return <div className={`jm-app ${path === '/' ? 'jm-home-active' : 'jm-inner-active'}`}><Header path={path} navigate={navigate} settings={data.settings} />{page}<Footer navigate={navigate} settings={data.settings} setFooterInView={setFooterInView} /><MobileDock navigate={navigate} settings={data.settings} /><FloatingWhatsApp settings={data.settings} footerInView={footerInView} /><ScrollToTopButton footerInView={footerInView} /></div>;
}
