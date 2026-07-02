import React, { useState, useEffect, useRef } from 'react';
import { Flame, Package, Edit3, Save, AlertCircle, X, Box, Globe, Languages, Truck, Search, SlidersHorizontal, PackageCheck, PackageX, ClipboardList, Clock, CheckCircle, DollarSign, Calendar, FileText, RotateCcw, User, Phone, MapPin, Bell, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import TranslationEditor from '../components/TranslationEditor';
import CatalogTranslationEditor from '../components/CatalogTranslationEditor';
import ShippingDashboard from '../components/ShippingDashboard';
import AdminCustomers from '../components/AdminCustomers';
import { clearJsonCache } from '../lib/prefetchCache';
import { normalizeMediaUrl } from '../lib/mediaUtils';

// SVG Icons for professional look
const Icons = {
  Dashboard: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>,
  Orders: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  Categories: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  Products: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  Trash: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  Image: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  Plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  BoxOpen: <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  Shipping: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
};

const GOVERNORATES = [
  'الإسكندرية', 'القاهرة', 'الجيزة', 'القليوبية', 'البحيرة', 'الدقهلية', 'الغربية', 'المنوفية', 'الشرقية', 'دمياط', 'كفر الشيخ', 'بورسعيد', 'الإسماعيلية', 'السويس', 'مرسى مطروح', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الوادي الجديد', 'البحر الأحمر', 'شمال سيناء', 'جنوب سيناء'
];

const CustomStatusSelect = ({ currentStatus, onChange }) => {
  const { t } = useLanguage();

  const statuses = [t('admin.statusPending'), t('admin.statusReviewing'), t('admin.statusShipped'), t('admin.statusDelivered'), t('admin.statusCancelled')];

  const getStatusColor = (status) => {
    if (status === t('admin.statusDelivered')) return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
    if (status === t('admin.statusShipped')) return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
    if (status === t('admin.statusReviewing')) return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
    if (status === t('admin.statusCancelled')) return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
    return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
  };

  const currentStyles = getStatusColor(currentStatus);

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '200px' }}>
      <select
        value={currentStatus}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          background: currentStyles.bg,
          color: currentStyles.color,
          border: `1px solid ${currentStyles.border}`,
          padding: '0.6rem 1rem 0.6rem 2.5rem',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '0.9rem',
          cursor: 'pointer',
          width: '100%',
          outline: 'none',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
          minWidth: '140px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          fontFamily: 'inherit',
          direction: 'rtl'
        }}
      >
        {statuses.map(status => (
          <option key={status} value={status} style={{ fontWeight: 'bold', color: '#0f172a', background: '#fff' }}>
            {status}
          </option>
        ))}
      </select>
      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: currentStyles.color, display: 'flex', alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
};

const getProductImage = (product) => {
  if (product.images) {
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string') return first;
        if (typeof first === 'object') return first.url || first.src || first.path || null;
      }
    } catch (e) { }
  }
  return product.image || null;
};

const isProductActive = (product) => (
  product.is_active === undefined ||
  product.is_active === null ||
  Number(product.is_active) !== 0
);

const getProductStock = (product) => Number(product.stock ?? 0);

const isVideoUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(url));

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

const ADMIN_TABS = ['dashboard', 'notifications', 'orders', 'customers', 'products', 'categories', 'coupons', 'settings', 'booking_settings', 'shipping', 'shipping_management', 'testimonials', 'media', 'whatsapp', 'users', 'catalog_translations', 'messages', 'about_select'];
const SALES_TABS = ['dashboard', 'notifications', 'orders', 'customers', 'coupons', 'shipping_management', 'about_select'];
const PERMISSION_TAB_OPTIONS = [
  { tab: 'notifications', label: 'الإشعارات (الطلبات الجديدة)' },
  { tab: 'orders', label: 'الطلبات' },
  { tab: 'coupons', label: 'الكوبونات' },
  { tab: 'shipping_management', label: 'إدارة الشحن' },
  { tab: 'products', label: 'المنتجات' },
  { tab: 'categories', label: 'الأقسام' },
  { tab: 'testimonials', label: 'آراء العملاء' },
  { tab: 'media', label: 'معرض الميديا' },
  { tab: 'whatsapp', label: 'واتساب' },
  { tab: 'settings', label: 'إعدادات المتجر' },
  { tab: 'shipping', label: 'إعدادات الشحن' },
  { tab: 'users', label: 'الحسابات والصلاحيات' },
  { tab: 'messages', label: 'رسائل العملاء' },
  { tab: 'customers', label: 'العملاء' },
  { tab: 'catalog_translations', label: 'ترجمة الكتالوج' },
  { tab: 'booking_settings', label: 'إعدادات الحجز' }
];

const parseUserPermissions = (user) => {
  try {
    const parsed = typeof user?.permissions === 'string' ? JSON.parse(user.permissions) : user?.permissions;
    return Array.isArray(parsed) ? parsed.filter(tab => tab !== 'select_market' && tab !== 'translations') : [];
  } catch {
    return [];
  }
};

const getAllowedTabsForUser = (user) => {
  if (user?.username === 'scmarkting') {
    return [...ADMIN_TABS, 'select_market', 'translations'];
  }

  const explicit = parseUserPermissions(user);
  if (explicit.length > 0) {
    return Array.from(new Set(['dashboard', ...explicit])).filter(tab => tab !== 'select_market' && tab !== 'translations');
  }

  if (user?.role === 'admin') {
    return ADMIN_TABS;
  }

  return SALES_TABS;
};

const AdminPage = ({ setCurrentPage, user, setAuth }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const isAdmin = user && user.role === 'admin';
  const allowedTabs = getAllowedTabsForUser(user);

  const [isMobileAccess, setIsMobileAccess] = useState(false);
  useEffect(() => {
    const checkMobileAccess = () => {
      setIsMobileAccess(window.innerWidth <= 1024);
    };
    checkMobileAccess();
    window.addEventListener('resize', checkMobileAccess);
    return () => window.removeEventListener('resize', checkMobileAccess);
  }, []);

  // Beautiful Custom Toast System
  const [toastMsg, setToastMsg] = useState(null);
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 4000);
    };
    return () => { window.alert = originalAlert; };
  }, []);

  const [isSelectMarketOpen, setIsSelectMarketOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    const path = window.location.pathname;
    if (path.startsWith('/scpanel/')) {
      const tab = path.split('/')[2];
      if (allowedTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/scpanel/')) {
        const tab = path.split('/')[2];
        if (allowedTabs.includes(tab)) {
          setActiveTab(tab);
        }
      } else if (path === '/scpanel') {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allowedTabs]);

  const handleTabChange = (tab) => {
    if (!allowedTabs.includes(tab)) return;
    setActiveTab(tab);
    window.history.pushState({}, '', `/scpanel/${tab}`);
  };
  // Data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const lastOrderIdRef = useRef(null);

  // Coupon Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage'); // 'percentage', 'free_shipping'
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponUsageLimit, setCouponUsageLimit] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');

  // Order Filter state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderGovFilter, setOrderGovFilter] = useState('');

  // Product Form state
  const [productView, setProductView] = useState('list'); // 'list' or 'form'
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [productColors, setProductColors] = useState('');
  const [productSizes, setProductSizes] = useState('');
  const [sizeDetailsMap, setSizeDetailsMap] = useState({});
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [productBadge, setProductBadge] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [productDescription, setProductDescription] = useState('');
  const [descriptionImages, setDescriptionImages] = useState([]);
  const descFileInputRef = useRef(null);
  const [productStock, setProductStock] = useState('100');
  const [variantStockMap, setVariantStockMap] = useState({});
  const [inventoryModalProduct, setInventoryModalProduct] = useState(null);
  const [inventoryModalStock, setInventoryModalStock] = useState('');
  const [inventoryModalVariants, setInventoryModalVariants] = useState({});
  const [isOffer, setIsOffer] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [productImages, setProductImages] = useState([]); // Array of { file, preview }
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const productFileInputRef = useRef(null);

  // Category Form state
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings state
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [settings, setSettings] = useState({
    store_name: '',
    default_language: 'ar',
    hero_title: '',
    hero_desc: '',
    hero_badge: '',
    ticker_text_1: '',
    ticker_text_2: '',
    ticker_text_3: '',
    ticker_text_4: '',
    about_subtitle: '',
    about_title: '',
    about_text: '',
    why_subtitle: '',
    why_title: '',
    why_desc: '',
    feature_title_1: '',
    feature_desc_1: '',
    feature_title_2: '',
    feature_desc_2: '',
    feature_title_3: '',
    feature_desc_3: '',
    feature_title_4: '',
    feature_desc_4: '',
    footer_locations: '',
    hero_image: '',
    about_image: '',
    facebook_link: '',
    instagram_link: '',
    tiktok_link: '',
    booking_seo_image_1: '',
    booking_seo_image_2: '',
    booking_seo_image_3: '',
    booking_seo_image_4: '',
    booking_seo_image_5: ''
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [heroImageFile2, setHeroImageFile2] = useState(null);
  const [heroImagePreview2, setHeroImagePreview2] = useState('');
  const [heroImageFile3, setHeroImageFile3] = useState(null);
  const [heroImagePreview3, setHeroImagePreview3] = useState('');
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState('');
  const heroFileInputRef = useRef(null);
  const heroFileInputRef2 = useRef(null);
  const heroFileInputRef3 = useRef(null);
  const aboutFileInputRef = useRef(null);
  const testimonialFileInputRef = useRef(null);

  // WhatsApp state
  const [waStatus, setWaStatus] = useState('INITIALIZING');
  const [waQr, setWaQr] = useState(null);
  const [waQueuedMessages, setWaQueuedMessages] = useState(0);
  const [waQrError, setWaQrError] = useState(null);
  const [waQrPending, setWaQrPending] = useState(false);

  const [waPairingPhone, setWaPairingPhone] = useState('');
  const [waPairingCode, setWaPairingCode] = useState('');
  const [waPairingLoading, setWaPairingLoading] = useState(false);
  const [waPairingError, setWaPairingError] = useState('');

  const handleRequestPairingCode = async (e) => {
    e.preventDefault();
    setWaPairingLoading(true);
    setWaPairingError('');
    setWaPairingCode('');
    try {
      const res = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: waPairingPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request code');
      setWaPairingCode(data.code);
    } catch (err) {
      setWaPairingError(err.message);
    } finally {
      setWaPairingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'whatsapp') {
      const fetchWaStatus = async () => {
        try {
          const res = await fetch('/api/whatsapp/status');
          if (!res.ok) {
            setWaStatus('ERROR_NO_BACKEND');
            setWaQrPending(false);
            return;
          }
          const data = await res.json();
          const nextStatus = data.status || 'DISCONNECTED';
          const nextQrPending = Boolean(data.qrPending);
          setWaStatus(nextStatus);
          setWaQrPending(nextQrPending);
          if (data.qr) {
            setWaQr(data.qr);
          } else if (!['WAITING_FOR_SCAN', 'INITIALIZING', 'AUTHENTICATED'].includes(nextStatus)) {
            setWaQr(null);
          }
          setWaQrError(nextQrPending ? null : (data.qrError || data.lastInitError || null));
          setWaQueuedMessages(Number(data.queuedMessages) || 0);
        } catch (e) {
          setWaStatus('ERROR_NO_BACKEND');
          setWaQrPending(false);
        }
      };
      fetchWaStatus();
      const interval = setInterval(fetchWaStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleWaRestart = async () => {
    setWaStatus('INITIALIZING');
    setWaQrError(null);
    setWaQrPending(true);
    try {
      const res = await fetch('/api/whatsapp/restart', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setWaStatus(data.status || 'INITIALIZING');
        if (data.qr) setWaQr(data.qr);
        setWaQrPending(Boolean(data.qrPending));
        setWaQueuedMessages(Number(data.queuedMessages) || 0);
      } else {
        setWaQrPending(false);
        setWaQrError(data.error || 'Failed to refresh QR');
      }
    } catch (error) {
      setWaQrPending(false);
      setWaQrError(error.message);
    }
  };

  const handleWaLogout = async () => {
    if (window.confirm(t('admin.confirmWaLogout'))) {
      await fetch('/api/whatsapp/logout', { method: 'POST' });
      setWaStatus('DISCONNECTED');
      setWaQr(null);
      setWaQrPending(false);
      setWaQueuedMessages(0);
    }
  };

  // Branches, Shipping & Testimonials state
  const [branches, setBranches] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [mediaGalleryItems, setMediaGalleryItems] = useState([]);
  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const mediaFileInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'sales', permissions: SALES_TABS });
  const [draggedMediaId, setDraggedMediaId] = useState(null);


  const [draggedProductId, setDraggedProductId] = useState(null);

  const safeFetch = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  };

  const safeFetchObj = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return {};
      return await res.json();
    } catch (err) {
      return {};
    }
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      safeFetch('/api/products?all=true'),
      safeFetch('/api/categories'),
      safeFetch('/api/orders'),
      safeFetchObj('/api/settings'),
      safeFetch('/api/testimonials'),
      safeFetch('/api/coupons'),
      isAdmin ? safeFetch('/api/users') : Promise.resolve([]),
      safeFetch('/api/contact'),
      safeFetch('/api/media')
    ])
      .then(([productsData, categoriesData, ordersData, settingsData, testimonialsData, couponsData, usersData, contactData, mediaData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setSettings(settingsData);
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
        setMediaGalleryItems(Array.isArray(mediaData) ? mediaData : []);
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setContactMessages(Array.isArray(contactData) ? contactData : []);
        setHeroImagePreview(settingsData.hero_image || '');
        setHeroImagePreview2(settingsData.hero_image_2 || '');
        setHeroImagePreview3(settingsData.hero_image_3 || '');
        setAboutImagePreview(settingsData.about_image || '');

        // Parse branches if available
        let parsedBranches = [];
        try {
          if (settingsData.footer_locations && settingsData.footer_locations.trim().startsWith('[')) {
            parsedBranches = JSON.parse(settingsData.footer_locations);
          }
        } catch (e) { }
        setBranches(parsedBranches);

        // Parse shipping rates
        let parsedShipping = [];
        try {
          if (settingsData.shipping_rates && settingsData.shipping_rates.trim().startsWith('[')) {
            parsedShipping = JSON.parse(settingsData.shipping_rates);
          }
        } catch (e) { }

        const completeShippingRates = GOVERNORATES.map(gov => {
          const existing = parsedShipping.find(r => r.gov === gov);
          return existing ? { ...existing, enabled: true } : { gov, price: '', enabled: false };
        });
        setShippingRates(completeShippingRates);

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Notifications Polling
  useEffect(() => {
    const playLoudNotificationSound = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (freq, startTime, duration) => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        playBeep(800, now, 0.2);
        playBeep(1200, now + 0.3, 0.2);
        playBeep(800, now + 0.6, 0.2);
        playBeep(1200, now + 0.9, 0.4);
      } catch (e) {
        console.error('Audio API error', e);
      }
    };

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const currentMaxId = Math.max(...data.map(o => o.id));
          if (lastOrderIdRef.current === null) {
            setNotifications(data.slice(0, 20));
            lastOrderIdRef.current = currentMaxId;
          } else if (currentMaxId > lastOrderIdRef.current) {
            const newOrders = data.filter(o => o.id > lastOrderIdRef.current);
            setNotifications(prev => {
              const uniqueNew = newOrders.filter(no => !prev.find(po => po.id === no.id));
              return [...uniqueNew, ...prev].slice(0, 100);
            });
            playLoudNotificationSound();
            lastOrderIdRef.current = currentMaxId;
          }
          setOrders(data);
        }
      } catch (e) { }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Generic File Upload Function
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const handleProductImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [];
      for (let file of Array.from(e.target.files)) {
        const isVideo = file.type && file.type.startsWith('video/');
        if (file.size > (isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024)) {
          alert(t('admin.alertImageTooLarge') || 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت!');
          continue;
        }
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          type: isVideo ? 'video' : 'image'
        });
      }
      setProductImages(prev => {
        const next = [...prev, ...newImages];
        if (prev.length === 0 && next.length > 0) setPrimaryImageIndex(0);
        return next;
      });
    }
  };

  const removeProductImage = (index) => {
    setProductImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setPrimaryImageIndex(current => {
        if (next.length === 0) return 0;
        if (current === index) return 0;
        if (current > index) return current - 1;
        return Math.min(current, next.length - 1);
      });
      return next;
    });
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert(t('admin.alertImageTooLarge') || 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت!');
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };
  const handleHeroImage2Change = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert(t('admin.alertImageTooLarge') || 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت!');
      setHeroImageFile2(file);
      setHeroImagePreview2(URL.createObjectURL(file));
    }
  };
  const handleHeroImage3Change = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert(t('admin.alertImageTooLarge') || 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت!');
      setHeroImageFile3(file);
      setHeroImagePreview3(URL.createObjectURL(file));
    }
  };

  const handleAboutImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert(t('admin.alertImageTooLarge') || 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت!');
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTestimonialUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert(t('admin.alertImageTooLarge'));
    try {
      const imageUrl = await uploadImage(file);
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });
      if (res.ok) {
        fetchData();
        alert(t('admin.alertTestimonialUploaded'));
      }
    } catch (err) {
      alert(t('admin.alertTestimonialError'));
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteTestimonial'))) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) { }
  };

  const processMediaFiles = async (files) => {
    setIsMediaUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً. (الحد الأقصى 15 ميجابايت)`);
        continue;
      }
      try {
        const imageUrl = await uploadImage(file);
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl, title: '', description: '', sort_order: 0 })
        });
        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error('Error uploading', file.name, err);
      }
    }

    setIsMediaUploading(false);
    if (successCount > 0) {
      fetchData();
      alert(`تم إضافة ${successCount} ملف/ملفات لمعرض الميديا بنجاح!`);
    }
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processMediaFiles(e.target.files);
    }
  };

  const handleMediaDragOver = (e) => {
    e.preventDefault();
    setIsMediaDragging(true);
  };

  const handleMediaDragLeave = (e) => {
    e.preventDefault();
    setIsMediaDragging(false);
  };

  const handleMediaDrop = (e) => {
    e.preventDefault();
    setIsMediaDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processMediaFiles(e.dataTransfer.files);
    }
  };

  const handleMediaSortDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedMediaId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMediaSortDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleMediaSortDrop = async (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedMediaId || draggedMediaId === targetId) {
      setDraggedMediaId(null);
      return;
    }

    const items = [...mediaGalleryItems];
    const draggedIndex = items.findIndex(item => item.id === draggedMediaId);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedMediaId(null);
      return;
    }

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const updatedItems = items.map((item, index) => ({ ...item, sort_order: index }));
    setMediaGalleryItems(updatedItems);
    setDraggedMediaId(null);

    try {
      await fetch('/api/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems.map(item => ({ id: item.id, sort_order: item.sort_order }))
        })
      });
    } catch (err) {
      console.error('Failed to sort', err);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaGalleryItems(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) { }
  };

  const handleToggleHomepage = async (id, currentVal) => {
    const newVal = currentVal ? 0 : 1;
    setMediaGalleryItems(prev =>
      prev.map(item => item.id === id ? { ...item, show_on_homepage: newVal } : item)
    );
    try {
      const res = await fetch('/api/media/homepage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, show_on_homepage: newVal })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update homepage media');
      }
      clearJsonCache('/api/media/homepage');
      clearJsonCache('/api/media');
    } catch (err) {
      setMediaGalleryItems(prev =>
        prev.map(item => item.id === id ? { ...item, show_on_homepage: currentVal } : item)
      );
      alert(`تعذر حفظ اختيار الصورة: ${err.message}`);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleProductCategory = (categoryName) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(categoryName);
      const next = exists ? prev.filter(item => item !== categoryName) : [...prev, categoryName];
      setCategory(next[0] || '');
      return next;
    });
  };

  const toggleNewUserPermission = (tab) => {
    if (tab === 'select_market') return;
    setNewUser(prev => {
      const permissions = Array.isArray(prev.permissions) ? prev.permissions : [];
      const next = permissions.includes(tab)
        ? permissions.filter(item => item !== tab)
        : [...permissions, tab];
      return { ...prev, permissions: Array.from(new Set(['dashboard', ...next])).filter(item => item !== 'select_market') };
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) return alert(t('admin.alertSelectCategory'));
    if (productImages.length === 0) return alert(t('admin.alertSelectImage'));

    try {
      const uploadedImagesWithColors = [];
      for (const img of productImages) {
        let url = img.preview;
        if (img.file) {
          url = await uploadImage(img.file);
        }
        uploadedImagesWithColors.push({ url, color: img.color || '', type: img.type || (isVideoUrl(url) ? 'video' : 'image') });
      }

      const safePrimaryImageIndex = Math.min(Math.max(Number(primaryImageIndex) || 0, 0), uploadedImagesWithColors.length - 1);
      const selectedPrimaryMedia = uploadedImagesWithColors.length > 0 ? uploadedImagesWithColors[safePrimaryImageIndex] : null;
      const firstImageMedia = uploadedImagesWithColors.find(item => item.type !== 'video' && !isVideoUrl(item.url));
      const mainImage = selectedPrimaryMedia
        ? ((selectedPrimaryMedia.type === 'video' || isVideoUrl(selectedPrimaryMedia.url)) ? (firstImageMedia?.url || selectedPrimaryMedia.url) : selectedPrimaryMedia.url)
        : null;

      const colorsArray = productColors.split(',').map(s => s.trim()).filter(Boolean);
      const sizesArray = productSizes.split(',').map(s => s.trim()).filter(Boolean);
      const newOptions = { colors: colorsArray, sizes: sizesArray, variantStock: variantStockMap, sizeDetails: sizeDetailsMap };

      let calculatedTotalStock = Number(productStock) || 0;
      if (colorsArray.length > 0 || sizesArray.length > 0) {
        calculatedTotalStock = 0;
        Object.values(variantStockMap).forEach(val => {
          if (val !== undefined && val !== '') calculatedTotalStock += Number(val);
        });
      }

      let finalDescriptionImagesArray = [];
      for (const dImg of descriptionImages) {
        if (dImg.file) {
          const uploadedUrl = await uploadImage(dImg.file);
          if (uploadedUrl) finalDescriptionImagesArray.push(uploadedUrl);
        } else if (dImg.preview) {
          finalDescriptionImagesArray.push(dImg.preview);
        }
      }

      const productData = { title, price: Number(price), old_price: oldPrice ? Number(oldPrice) : null, image: mainImage, images: uploadedImagesWithColors, category: selectedCategories[0], categories: selectedCategories, description: productDescription, options: newOptions, is_offer: isOffer ? 1 : 0, is_active: isActive ? 1 : 0, stock: calculatedTotalStock, badge: productBadge, description_image: null, description_images: finalDescriptionImagesArray, sort_order: sortOrder || 0 };

      let url = '/api/products';
      let method = 'POST';

      if (editingProductId) {
        url = `/api/products/${editingProductId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();

      if (res.ok) {
        if (data.warning) {
          alert(data.warning);
        }
        fetchData();
        setTitle('');
        setSortOrder('');
        setPrice('');
        setOldPrice('');
        setCategory('');
        setSelectedCategories([]);
        setProductDescription('');
        setProductStock('100');
        setIsOffer(false);
        setIsActive(true);
        setProductBadge('');
        setProductImages([]);
        setPrimaryImageIndex(0);
        setProductColors('');
        setProductSizes('');
        setVariantStockMap({});
        setSizeDetailsMap({});
        setEditingProductId(null);
        setProductView('list');
        if (productFileInputRef.current) productFileInputRef.current.value = '';
        alert(editingProductId ? t('admin.alertProductUpdated') : t('admin.alertProductSaved'));
      } else {
        alert(t('admin.alertProductError'));
      }
    } catch (err) {
      console.error(err);
      alert(t('admin.alertUploadError'));
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          discount_value: couponDiscount,
          usage_limit: couponUsageLimit,
          expiry_date: couponExpiry || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponCode('');
        setCouponDiscount('');
        setCouponUsageLimit('');
        setCouponExpiry('');
        fetchData();
        alert(t('admin.alertCouponAdded'));
      } else {
        alert(data.error || t('admin.alertCouponError'));
      }
    } catch (err) {
      alert(t('admin.alertConnectionError'));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteCoupon'))) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert(t('admin.alertCouponError'));
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        alert(t('admin.alertOrderStatusError'));
      }
    } catch (err) {
      alert(t('admin.alertOrderStatusConnection'));
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setTitle(product.title);
    setSortOrder(product.sort_order || '');
    setProductBadge(product.badge || '');
    setPrice(product.price);
    setOldPrice(product.old_price || '');
    const productCategoryList = getProductCategories(product);
    setCategory(productCategoryList[0] || product.category || '');
    setSelectedCategories(productCategoryList);
    setProductDescription(product.description || '');
    let parsedDescImgs = [];
    try {
      if (product.description_images) {
        const parsed = typeof product.description_images === 'string' ? JSON.parse(product.description_images) : product.description_images;
        if (Array.isArray(parsed)) parsedDescImgs = parsed.map(img => ({ file: null, preview: typeof img === 'string' ? img : (img.url || img.preview || img) }));
      } else if (product.description_image) {
        parsedDescImgs = [{ file: null, preview: product.description_image }];
      }
    } catch (e) {
      if (product.description_image) parsedDescImgs = [{ file: null, preview: product.description_image }];
    }
    setDescriptionImages(parsedDescImgs);
    setProductStock(product.stock !== undefined ? String(product.stock) : '100');
    setIsOffer(product.is_offer === 1 || product.is_offer === true);
    setIsActive(product.is_active !== undefined ? (product.is_active === 1 || product.is_active === true) : true);
    let existingImages = [];
    const extractUrl = (img) => {
      if (!img) return null;
      if (typeof img === 'string') return img;
      if (typeof img === 'object') return img.url || img.src || img.path || (typeof img[0] === 'string' ? img[0] : null);
      return null;
    };
    const parseImages = (data) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (Array.isArray(parsed)) {
          return parsed.map(img => {
            const url = extractUrl(img);
            return url ? { file: null, preview: url, color: (typeof img === 'object' && img.color) || '', type: (typeof img === 'object' && img.type) || (isVideoUrl(url) ? 'video' : 'image') } : null;
          }).filter(Boolean);
        }
        if (typeof parsed === 'object' && parsed !== null) {
          const url = extractUrl(parsed);
          if (url) return [{ file: null, preview: url, color: parsed.color || '' }];
        }
      } catch (e) { console.error('parseImages error', e); }
      return null;
    };
    if (product.images) {
      const result = parseImages(product.images);
      existingImages = result || [];
      console.log('handleEditClick: parsed from product.images:', existingImages);
    }
    if (existingImages.length === 0 && product.image) {
      existingImages = [{ file: null, preview: product.image, color: '' }];
      console.log('handleEditClick: falling back to product.image:', product.image);
    }
    setProductImages(existingImages);
    const primaryIndex = existingImages.findIndex(img => img.preview === product.image);
    setPrimaryImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
    let parsedOpts = {};
    if (product.options) {
      try {
        parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
        if (Array.isArray(parsedOpts)) {
          parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
        }
      } catch (e) { }
    }
    setProductColors(parsedOpts.colors && Array.isArray(parsedOpts.colors) ? parsedOpts.colors.join(', ') : '');
    setProductSizes(parsedOpts.sizes && Array.isArray(parsedOpts.sizes) ? parsedOpts.sizes.join(', ') : '');
    setVariantStockMap(parsedOpts.variantStock || {});
    setSizeDetailsMap(parsedOpts.sizeDetails || {});
    setProductView('form');
  };

  const handleAddNewClick = () => {
    setEditingProductId(null);
    setTitle('');
    setSortOrder('');
    setProductBadge('');
    setPrice('');
    setOldPrice('');
    setCategory('');
    setSelectedCategories([]);
    setProductDescription('');
    setDescriptionImages([]);
    setProductStock('100');
    setIsOffer(false);
    setIsActive(true);
    setProductImages([]);
    setPrimaryImageIndex(0);
    setProductColors('');
    setProductSizes('');
    setVariantStockMap({});
    setSizeDetailsMap({});
    setProductView('form');
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm(t('admin.confirmDeleteProduct'))) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(() => fetchData())
        .catch(err => alert(t('admin.alertDeleteError')));
    }
  };

  const handleProductDragStart = (e, productId) => {
    setDraggedProductId(productId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProductDragOver = (e) => {
    e.preventDefault();
  };

  const handleProductDrop = async (e, targetProductId) => {
    e.preventDefault();
    if (!draggedProductId || draggedProductId === targetProductId) return;

    if (productSearchQuery || productCategoryFilter || productStatusFilter) {
      alert(t('admin.alertClearFiltersToReorder') || 'الرجاء إزالة جميع فلاتر البحث والفرز قبل إعادة الترتيب.');
      return;
    }

    const draggedIdx = products.findIndex(p => p.id === draggedProductId);
    const targetIdx = products.findIndex(p => p.id === targetProductId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newProducts = [...products];
    const draggedItem = newProducts.splice(draggedIdx, 1)[0];
    newProducts.splice(targetIdx, 0, draggedItem);

    setProducts(newProducts);
    setDraggedProductId(null);

    const updatedItems = newProducts.map((p, i) => ({
      id: p.id,
      sort_order: i + 1
    }));

    try {
      await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (err) {
      alert(t('admin.alertReorderError') || 'حدث خطأ أثناء حفظ الترتيب');
    }
  };

  const handleProductDragEnd = () => {
    setDraggedProductId(null);
  };

  const openInventoryModal = (product) => {
    setInventoryModalProduct(product);
    setInventoryModalStock(product.stock !== undefined ? String(product.stock) : '100');
    let parsedOpts = {};
    if (product.options) {
      try { parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options; } catch (e) { }
    }
    setInventoryModalVariants(parsedOpts?.variantStock || {});
  };

  const handleSaveInventory = async () => {
    try {
      const p = inventoryModalProduct;
      let parsedOpts = {};
      if (p.options) {
        try { parsedOpts = typeof p.options === 'string' ? JSON.parse(p.options) : p.options; } catch (e) { }
        if (Array.isArray(parsedOpts)) parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };
      }

      const newOptions = { ...parsedOpts, variantStock: inventoryModalVariants };

      let calculatedTotalStock = Number(inventoryModalStock) || 0;
      const hasVariants = (parsedOpts.colors && parsedOpts.colors.length > 0) || (parsedOpts.sizes && parsedOpts.sizes.length > 0);
      if (hasVariants) {
        calculatedTotalStock = 0;
        Object.values(inventoryModalVariants).forEach(val => {
          if (val !== undefined && val !== '') calculatedTotalStock += Number(val);
        });
      }

      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, options: newOptions, stock: calculatedTotalStock })
      });

      if (res.ok) {
        setInventoryModalProduct(null);
        fetchData();
      } else {
        alert(t('admin.alertInventorySaveError'));
      }
    } catch (err) {
      alert(t('admin.alertInventoryError'));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    })
      .then(res => res.json())
      .then(() => {
        fetchData();
        setNewCategoryName('');
        alert(t('admin.alertCategoryAdded'));
      })
      .catch(err => alert(t('admin.alertCategoryError')));
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm(t('admin.confirmDeleteCategory'))) {
      fetch(`/api/categories/${id}`, { method: 'DELETE' })
        .then(() => fetchData())
        .catch(err => alert(t('admin.alertDeleteError')));
    }
  };

  const handleAddBranch = () => {
    setBranches([...branches, { name: '', link: '' }]);
  };

  const handleUpdateBranch = (index, field, value) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const handleRemoveBranch = (index) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.username.trim() === '' || newUser.password.trim() === '') {
      return alert(t('admin.alertMissingFields'));
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setNewUser({ username: '', password: '', role: 'sales', permissions: SALES_TABS });
        fetchData();
        alert(t('admin.alertUserAdded'));
      } else {
        alert(data.error || t('admin.alertUserAddError'));
      }
    } catch (err) {
      alert(t('admin.alertUserConnection'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          fetchData();
        } else {
          alert(data.error || t('admin.alertUserDeleteErrorAlt'));
        }
      } catch (err) {
        alert(t('admin.alertUserConnection'));
      }
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'PUT' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm(t('admin.confirmDeleteMessage'))) {
      try {
        const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddShipping = () => {
    setShippingRates([...shippingRates, { gov: '', price: '' }]);
  };

  const handleUpdateShipping = (index, field, value) => {
    const newRates = [...shippingRates];
    newRates[index][field] = value;
    setShippingRates(newRates);
  };

  const handleRemoveShipping = (index) => {
    setShippingRates(shippingRates.filter((_, i) => i !== index));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      let finalHeroUrl = heroImagePreview;
      if (heroImageFile) {
        finalHeroUrl = await uploadImage(heroImageFile);
      }

      let finalHeroUrl2 = heroImagePreview2;
      if (heroImageFile2) {
        finalHeroUrl2 = await uploadImage(heroImageFile2);
      }

      let finalHeroUrl3 = heroImagePreview3;
      if (heroImageFile3) {
        finalHeroUrl3 = await uploadImage(heroImageFile3);
      }

      let finalAboutUrl = aboutImagePreview;
      if (aboutImageFile) {
        finalAboutUrl = await uploadImage(aboutImageFile);
      }

      const updatedSettings = {
        ...settings,
        hero_image: finalHeroUrl,
        hero_image_2: finalHeroUrl2,
        hero_image_3: finalHeroUrl3,
        about_image: finalAboutUrl,
        footer_locations: JSON.stringify(branches),
        shipping_rates: JSON.stringify(shippingRates.filter(r => r.enabled))
      };

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      alert(t('admin.alertSettingsSaved'));
      setHeroImageFile(null);
      setHeroImageFile2(null);
      setHeroImageFile3(null);
      setAboutImageFile(null);
    } catch (err) {
      alert(t('admin.alertSettingsError'));
    }
  };

  const SidebarBtn = ({ tab, icon, label, badge }) => {
    if (!allowedTabs.includes(tab)) return null;

    return (
      <button
        onClick={() => handleTabChange(tab)}
        className={`admin-sidebar-btn ${activeTab === tab ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        {icon} {label}
        {badge > 0 && (
          <span style={{
            position: 'absolute',
            right: language === 'ar' ? 'auto' : '10px',
            left: language === 'ar' ? '10px' : 'auto',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            padding: '0.1rem 0.4rem',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
          }}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
    );
  };

  if (isMobileAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center', background: '#f8fafc', fontFamily: 'inherit' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.2))' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <h2 style={{ color: '#0f172a', fontWeight: '900', fontSize: '1.8rem', marginBottom: '1rem' }}>{language === 'ar' ? 'عذراً، لوحة التحكم غير متاحة على الهواتف' : 'Sorry, Admin Panel is not available on mobile'}</h2>
        <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '400px' }}>
          {language === 'ar'
            ? <>لضمان أفضل تجربة لإدارة متجرك، يرجى تسجيل الدخول إلى لوحة التحكم من خلال <strong>جهاز كمبيوتر (Desktop/Laptop)</strong>.</>
            : <>For the best store management experience, please login to the admin panel using a <strong>Computer (Desktop/Laptop)</strong>.</>
          }
        </p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '1rem 2rem', borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 99999,
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: '4px solid var(--primary-color)'
        }}>
          <AlertCircle size={20} color="var(--primary-color)" />
          <span style={{ fontWeight: '700', fontSize: '1rem' }}>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
      {/* Sidebar - Fixed to Right */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header" style={{
          background: '#9d027c',
          padding: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderRadius: '20px',
          margin: '1rem',
          boxShadow: '0 10px 25px rgba(157, 2, 124, 0.25)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#ffffff',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            flexShrink: 0
          }}>
            <img src="/s-logo.png" alt="SC Panel Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.2rem 0', lineHeight: '1' }}>SC Panel</h3>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          <SidebarBtn tab="dashboard" icon={Icons.Dashboard} label={t('admin.sidebarDashboard')} />
          <SidebarBtn tab="notifications" icon={<Bell size={20} />} label={language === 'ar' ? 'أحدث الطلبات' : 'Latest Orders'} badge={notifications.length} />
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0.5rem 0' }}></div>

          <button
            onClick={() => setIsSelectMarketOpen(!isSelectMarketOpen)}
            className="admin-sidebar-btn"
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem', background: isSelectMarketOpen ? 'rgba(255, 188, 1, 0.15)' : 'transparent', color: isSelectMarketOpen ? '#ffbc01' : 'rgba(255, 255, 255, 0.85)', borderRight: isSelectMarketOpen ? '3px solid #ffbc01' : '3px solid transparent', borderRadius: isSelectMarketOpen ? '8px 0 0 8px' : '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffbc01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSelectMarketOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: isSelectMarketOpen ? '800' : '600' }}>
              <img src="/s-logo.png" alt="S" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /> SC Market
            </span>
          </button>

          {isSelectMarketOpen && (
            <div style={{ paddingRight: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem', borderRight: '2px solid rgba(255, 188, 1, 0.5)', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 12px 12px', paddingBottom: '0.5rem' }}>
              <SidebarBtn tab="products" icon={Icons.Products} label={t('admin.sidebarProducts')} />
              <SidebarBtn tab="orders" icon={Icons.Orders} label={t('admin.sidebarOrders')} />
              <SidebarBtn tab="customers" icon={<User size={20} />} label={language === 'ar' ? 'العملاء' : 'Customers'} />
              <SidebarBtn tab="categories" icon={Icons.Categories} label={language === 'ar' ? 'التصنيفات' : 'Categories'} />
              <SidebarBtn tab="coupons" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>} label={t('admin.sidebarCoupons')} />

              <button
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                className="admin-sidebar-btn"
                style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem', background: isShippingOpen ? 'rgba(255, 188, 1, 0.15)' : 'transparent', color: isShippingOpen ? '#ffbc01' : 'rgba(255, 255, 255, 0.85)', borderRight: isShippingOpen ? '3px solid #ffbc01' : '3px solid transparent', borderRadius: isShippingOpen ? '8px 0 0 8px' : '8px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbc01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isShippingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Truck size={18} /> {t('admin.sidebarShippingManagement')}
                </span>
              </button>

              {isShippingOpen && (
                <div style={{ paddingRight: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', borderRight: '2px solid rgba(255, 188, 1, 0.5)', background: 'rgba(0,0,0,0.1)', borderRadius: '0 0 12px 12px', paddingBottom: '0.5rem', marginTop: '0.2rem' }}>
                  <SidebarBtn tab="shipping_management" icon={<Truck size={16} />} label={language === 'ar' ? 'إدارة الشحنات' : 'Shipping Management'} />
                  <SidebarBtn tab="shipping" icon={Icons.Shipping} label={language === 'ar' ? 'أسعار الشحن' : 'Shipping Prices'} />
                </div>
              )}

              {user && user.username === 'scmarkting' && (
                <SidebarBtn tab="select_market" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5" /></svg>} label="SC API" />
              )}
            </div>
          )}

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0.5rem 0' }}></div>
              <SidebarBtn tab="messages" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>} label={t('admin.sidebarMessages')} />
              <SidebarBtn tab="testimonials" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>} label={t('admin.sidebarTestimonials')} />
              <SidebarBtn tab="media" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>} label={'معرض الميديا'} />

              <SidebarBtn tab="whatsapp" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>} label={t('admin.sidebarWhatsapp')} />

              <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0.5rem 0' }}></div>

              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="admin-sidebar-btn"
                style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem', background: isSettingsOpen ? 'rgba(255, 188, 1, 0.15)' : 'transparent', color: isSettingsOpen ? '#ffbc01' : 'rgba(255, 255, 255, 0.85)', borderRight: isSettingsOpen ? '3px solid #ffbc01' : '3px solid transparent', borderRadius: isSettingsOpen ? '8px 0 0 8px' : '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffbc01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: isSettingsOpen ? '800' : '600' }}>
                  {Icons.Settings} {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </span>
              </button>

              {isSettingsOpen && (
                <div style={{ paddingRight: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem', borderRight: '2px solid rgba(255, 188, 1, 0.5)', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 12px 12px', paddingBottom: '0.5rem' }}>
                  <SidebarBtn tab="settings" icon={Icons.Settings} label={language === 'ar' ? 'إعدادات أساسية' : 'Basic Settings'} />
                  <SidebarBtn tab="booking_settings" icon={<Calendar size={20} />} label={language === 'ar' ? 'إعدادات الحجز' : 'Booking Settings'} />
                  <SidebarBtn tab="users" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} label={t('admin.sidebarUsers')} />
                  <SidebarBtn tab="catalog_translations" icon={<Languages size={20} />} label={language === 'ar' ? 'ترجمة المنتجات والتصنيفات' : 'Catalog Translations'} />
                  <SidebarBtn tab="translations" icon={<Globe size={20} />} label={t('admin.sidebarTranslations')} />
                </div>
              )}
            </>
          )}

          <SidebarBtn tab="about_select" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>} label={language === 'ar' ? 'حول' : 'About'} />
          <div style={{ flex: 1 }}></div>
          <button
            onClick={() => setCurrentPage('home')}
            className="admin-sidebar-btn"
            style={{ marginTop: 'auto', background: 'rgba(101, 163, 13, 0.1)', color: '#65a30d', fontWeight: '800' }}
          >
            {Icons.Home} {t('admin.sidebarBackToStore')}
          </button>
          <button
            onClick={() => {
              setAuth(false);
              setCurrentPage('home');
            }}
            className="admin-sidebar-btn"
            style={{ marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '800' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> {t('admin.sidebarLogout')}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {activeTab === 'dashboard' && t('admin.topbarDashboard')}
            {activeTab === 'notifications' && (language === 'ar' ? 'الإشعارات (الطلبات الجديدة)' : 'Notifications')}
            {activeTab === 'orders' && t('admin.topbarOrders')}
            {activeTab === 'customers' && (language === 'ar' ? 'العملاء' : 'Customers')}
            {activeTab === 'coupons' && t('admin.topbarCoupons')}
            {activeTab === 'categories' && t('admin.topbarCategories')}
            {activeTab === 'products' && t('admin.topbarProducts')}
            {activeTab === 'inventory' && t('admin.topbarInventory')}
            {activeTab === 'whatsapp' && t('admin.topbarWhatsapp')}
            {activeTab === 'settings' && t('admin.topbarSettings')}
            {activeTab === 'booking_settings' && 'إعدادات الحجز'}
            {activeTab === 'shipping' && t('admin.topbarShipping')}
            {activeTab === 'users' && t('admin.topbarUsers')}
            {activeTab === 'messages' && t('admin.sidebarMessages')}
            {activeTab === 'catalog_translations' && (language === 'ar' ? 'ترجمة المنتجات والتصنيفات' : 'Catalog Translations')}
            {activeTab === 'translations' && t('admin.topbarTranslations')}
            {activeTab === 'select_market' && t('admin.sidebarSelectMarket')}
            {activeTab === 'shipping_management' && t('admin.sidebarShippingManagement')}
            {activeTab === 'about_select' && (language === 'ar' ? 'حول' : 'About')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => toggleLanguage()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-dark)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-gradient)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = 'var(--text-dark)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <Languages size={18} />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>

          </div>
        </header>

        <div className="admin-content-area animate-up">
          {toastMsg && (
            <div style={{
              position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
              background: '#1e293b', color: '#fff', padding: '1rem 2rem', borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 99999,
              display: 'flex', alignItems: 'center', gap: '1rem',
              animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: '4px solid var(--primary-color)'
            }}>
              <AlertCircle size={20} color="var(--primary-color)" />
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>{toastMsg}</span>
              <button onClick={() => setToastMsg(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
          )}
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slideDown {
              from { transform: translate(-50%, -100%); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}} />

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="admin-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Bell size={24} style={{ color: 'var(--primary-color)' }} />
                  {language === 'ar' ? 'أحدث الطلبات (تحديث تلقائي)' : 'Latest Orders (Auto Update)'}
                </h3>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Bell size={24} style={{ color: 'var(--primary-color)' }} />
                  {language === 'ar' ? 'أحدث الطلبات (تحديث تلقائي)' : 'Latest Orders (Auto Update)'}
                </h3>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem' }}>{language === 'ar' ? 'لا توجد إشعارات لطلبات جديدة منذ فتح الصفحة.' : 'No notifications for new orders since page opened.'}</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{language === 'ar' ? 'ابقِ هذه الصفحة مفتوحة لتلقي إشعار بصوت عالٍ عند وصول طلب جديد.' : 'Keep this page open to receive a loud sound alert when a new order arrives.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.map((order, idx) => {
                    const infoParts = (order.customer_name || '').split('|').map(p => p.trim());
                    const cName = infoParts[0] || t('admin.unknownCustomer');
                    const cPhone = infoParts[1] || order.customer_phone || '';
                    const cAddress = infoParts.slice(2).join(' | ');

                    return (
                      <div key={idx} style={{ background: '#f8fafc', borderLeft: '4px solid var(--primary-color)', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{language === 'ar' ? 'طلب جديد رقم:' : 'New Order #:'} {order.order_number || order.id}</strong>
                            <div style={{ marginTop: '0.5rem', color: '#475569', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                              <span><User size={14} style={{ display: 'inline', marginRight: '4px', marginLeft: '4px' }} />{cName}</span>
                              <span><Phone size={14} style={{ display: 'inline', marginRight: '4px', marginLeft: '4px' }} />{cPhone}</span>
                              {cAddress && <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px', marginLeft: '4px' }} />{cAddress}</span>}
                            </div>
                          </div>
                          <div style={{ fontWeight: '800', color: '#10b981', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                            {order.total} {t('admin.currency')}
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => setSelectedOrder(order)} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} />
                            {language === 'ar' ? 'عرض تفاصيل الطلب' : 'View Order Details'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '2rem', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('admin.totalSales')}</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>{orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0).toLocaleString()} <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('admin.currency')}</span></h3>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '2rem', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('admin.pendingOrders')}</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>{orders.filter(o => o.status === t('admin.statusPending')).length} <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('admin.orderUnit')}</span></h3>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '2rem', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('admin.totalOrders')}</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>{orders.length} <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('admin.orderUnit')}</span></h3>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  </div>
                  <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '2rem', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('admin.avgOrderValue')}</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>{orders.length > 0 ? (orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) / orders.length).toFixed(0).toLocaleString() : 0} <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>{t('admin.currency')}</span></h3>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </div>
                  <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontWeight: '800', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{t('admin.totalProducts')}</p>
                    <h4 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a' }}>{products.length} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>{t('admin.productUnit')}</span></h4>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontWeight: '800', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{t('admin.totalCategoriesLabel')}</p>
                    <h4 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a' }}>{categories.length} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>{t('admin.categoryUnit')}</span></h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (() => {
            const normalizedSearch = orderSearchQuery.trim().toLowerCase();
            const pendingStatus = t('admin.statusPending');
            const reviewingStatus = t('admin.statusReviewing');
            const shippedStatus = t('admin.statusShipped');
            const deliveredStatus = t('admin.statusDelivered');
            const cancelledStatus = t('admin.statusCancelled');
            const filteredOrders = orders.filter(order => {
              const matchesSearch = !normalizedSearch || [
                order.order_number,
                order.id,
                order.customer_name,
                order.customer_phone,
                order.coupon_code
              ].some(value => String(value ?? '').toLowerCase().includes(normalizedSearch));
              const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
              const matchesGov = !orderGovFilter || String(order.customer_name ?? '').includes(orderGovFilter);
              return matchesSearch && matchesStatus && matchesGov;
            });
            const totalSales = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
            const hasActiveFilters = Boolean(orderSearchQuery || orderStatusFilter || orderGovFilter);

            return (
              <div className="admin-orders-page">
                <div className="admin-orders-header">
                  <div>
                    <h3>{t('admin.orderListTitle')}</h3>
                    <p>{t('admin.orderManagementSubtitle')}</p>
                  </div>
                  <div className="admin-orders-results">
                    <strong>{filteredOrders.length}</strong>
                    <span>{t('admin.orderResultsCount', { total: orders.length })}</span>
                  </div>
                </div>

                <div className="admin-orders-summary">
                  <div className="admin-orders-summary-card total">
                    <div className="admin-orders-summary-icon"><ClipboardList size={21} /></div>
                    <div>
                      <span>{t('admin.totalOrders')}</span>
                      <strong>{orders.length}</strong>
                    </div>
                  </div>
                  <div className="admin-orders-summary-card pending">
                    <div className="admin-orders-summary-icon"><Clock size={21} /></div>
                    <div>
                      <span>{pendingStatus}</span>
                      <strong>{orders.filter(order => order.status === pendingStatus).length}</strong>
                    </div>
                  </div>
                  <div className="admin-orders-summary-card reviewing">
                    <div className="admin-orders-summary-icon"><Search size={21} /></div>
                    <div>
                      <span>{reviewingStatus}</span>
                      <strong>{orders.filter(order => order.status === reviewingStatus).length}</strong>
                    </div>
                  </div>
                  <div className="admin-orders-summary-card shipped">
                    <div className="admin-orders-summary-icon"><Truck size={21} /></div>
                    <div>
                      <span>{shippedStatus}</span>
                      <strong>{orders.filter(order => order.status === shippedStatus).length}</strong>
                    </div>
                  </div>
                  <div className="admin-orders-summary-card delivered">
                    <div className="admin-orders-summary-icon"><CheckCircle size={21} /></div>
                    <div>
                      <span>{deliveredStatus}</span>
                      <strong>{orders.filter(order => order.status === deliveredStatus).length}</strong>
                    </div>
                  </div>
                  <div className="admin-orders-summary-card sales">
                    <div className="admin-orders-summary-icon"><DollarSign size={21} /></div>
                    <div>
                      <span>{t('admin.totalSales')}</span>
                      <strong>{totalSales.toLocaleString()} <small>{t('admin.currency')}</small></strong>
                    </div>
                  </div>
                </div>

                <div className="admin-orders-filters">
                  <label className="admin-orders-search">
                    <Search size={19} />
                    <input
                      type="search"
                      placeholder={t('admin.filterSearchPlaceholder')}
                      value={orderSearchQuery}
                      onChange={event => setOrderSearchQuery(event.target.value)}
                    />
                  </label>
                  <label className="admin-orders-select">
                    <SlidersHorizontal size={18} />
                    <select value={orderStatusFilter} onChange={event => setOrderStatusFilter(event.target.value)}>
                      <option value="">{t('admin.filterAllStatuses')}</option>
                      <option value={pendingStatus}>{pendingStatus}</option>
                      <option value={reviewingStatus}>{reviewingStatus}</option>
                      <option value={shippedStatus}>{shippedStatus}</option>
                      <option value={deliveredStatus}>{deliveredStatus}</option>
                      <option value={cancelledStatus}>{cancelledStatus}</option>
                    </select>
                  </label>
                  <label className="admin-orders-select">
                    <MapPin size={18} />
                    <select value={orderGovFilter} onChange={event => setOrderGovFilter(event.target.value)}>
                      <option value="">{t('admin.filterAllGovernorates')}</option>
                      {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </label>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="admin-orders-clear"
                      onClick={() => {
                        setOrderSearchQuery('');
                        setOrderStatusFilter('');
                        setOrderGovFilter('');
                      }}
                    >
                      <RotateCcw size={17} />
                      {t('admin.clearFilters')}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="admin-orders-empty">{t('admin.loading')}</div>
                ) : (
                  filteredOrders.length === 0 ? (
                    <div className="admin-orders-empty">
                      {Icons.BoxOpen}
                      <p>{t('admin.noOrdersFound')}</p>
                    </div>
                  ) : (
                    <div className="admin-orders-table-wrapper">
                      <table className="admin-table admin-orders-table">
                        <thead>
                          <tr>
                            <th>{t('admin.tableOrderId')}</th>
                            <th>{t('admin.tableCustomer')}</th>
                            <th>{t('admin.tableTotal')} / التفاصيل</th>
                            <th>{t('admin.tableStatus')}</th>
                            <th>{t('admin.tableDate')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => {
                            const infoParts = (order.customer_name || '').split('|').map(p => p.trim());
                            const cName = infoParts[0] || t('admin.unknownCustomer');
                            const cPhone = infoParts[1] || order.customer_phone || '';
                            const cAddress = infoParts.slice(2).join(' | ');
                            const createdAt = new Date(order.created_at);
                            const hasValidDate = !Number.isNaN(createdAt.getTime());

                            return (
                              <tr key={order.id}>
                                <td data-label={t('admin.tableOrderId')}>
                                  <div className="admin-order-reference">
                                    <span>#{order.order_number || order.id}</span>
                                    <small>ID {order.id}</small>
                                  </div>
                                </td>
                                <td data-label={t('admin.tableCustomer')}>
                                  <div className="admin-order-customer">
                                    <div className="admin-order-customer-avatar">
                                      <User size={18} />
                                    </div>
                                    <div className="admin-order-customer-copy">
                                      <strong>{cName}</strong>
                                      {cPhone && <span dir="ltr"><Phone size={13} /> {cPhone}</span>}
                                      {cAddress && <small><MapPin size={13} /> {cAddress}</small>}
                                    </div>
                                  </div>
                                </td>
                                <td data-label={t('admin.tableTotal')}>
                                  <div className="admin-order-total">
                                    <strong>{Number(order.total || 0).toLocaleString()} <span>{t('admin.currency')}</span></strong>
                                    {(() => {
                                      let prods = null;
                                      try { prods = typeof order.products === 'string' ? JSON.parse(order.products) : order.products; } catch (e) { }
                                      if (prods && prods.type === 'booking') {
                                        return (
                                          <div style={{ marginTop: '0.4rem', padding: '0.4rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#166534', fontWeight: 'bold' }}>
                                            <div style={{ marginBottom: '0.2rem' }}>{prods.totalTrays} صينية</div>
                                            <div>{prods.totalQirat} قيراط</div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                    {order.coupon_code && (
                                      <small style={{ display: 'block', marginTop: '0.4rem' }}>
                                        {t('admin.couponBadge')} {order.coupon_code}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td data-label={t('admin.tableStatus')}>
                                  <CustomStatusSelect currentStatus={order.status} onChange={(newStatus) => updateOrderStatus(order.id, newStatus)} />
                                </td>
                                <td data-label={t('admin.tableDate')}>
                                  <div className="admin-order-date">
                                    <span><Calendar size={15} /> {hasValidDate ? createdAt.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}</span>
                                    <small>{hasValidDate ? createdAt.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* Invoice modal moved outside tabs */}
              </div>
            )
          })()}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="admin-panel">
                <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.addCouponTitle')}</h3>
                <form onSubmit={handleAddCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{t('admin.couponCodeLabel')}</label>
                    <input type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="admin-input" placeholder={t('admin.couponCodePlaceholder')} style={{ textTransform: 'uppercase' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{t('admin.couponTypeLabel')}</label>
                    <select value={couponType} onChange={e => setCouponType(e.target.value)} className="admin-input" required>
                      <option value="percentage">{t('admin.couponTypePercentage')}</option>
                      <option value="free_shipping">{t('admin.couponTypeFreeShipping')}</option>
                    </select>
                  </div>

                  {couponType === 'percentage' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{t('admin.couponDiscountLabel')}</label>
                      <input type="number" min="1" max="100" required value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)} className="admin-input" placeholder={t('admin.couponDiscountPlaceholder')} />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{t('admin.couponUsageLabel')}</label>
                    <input type="number" min="0" value={couponUsageLimit} onChange={e => setCouponUsageLimit(e.target.value)} className="admin-input" placeholder={t('admin.couponUsagePlaceholder')} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>{t('admin.couponExpiryLabel')}</label>
                    <input type="date" value={couponExpiry} onChange={e => setCouponExpiry(e.target.value)} className="admin-input" />
                  </div>

                  <button type="submit" className="btn-admin" style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.Plus} {t('admin.couponCreateBtn')}</button>
                </form>
              </div>

              <div className="admin-panel">
                <h3 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.couponsListTitle')}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.couponTableCode')}</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.couponTableType')}</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.couponTableValue')}</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.couponTableUsage')}</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.couponTableExpiry')}</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.couponTableAction')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(coupon => {
                        const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                        const isFullyUsed = coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit;
                        const isInactive = isExpired || isFullyUsed;

                        return (
                          <tr key={coupon.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: isInactive ? 0.6 : 1 }}>
                            <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{coupon.code}</td>
                            <td style={{ padding: '1rem' }}>{coupon.type === 'percentage' ? t('admin.couponTypePct') : t('admin.couponTypeFree')}</td>
                            <td style={{ padding: '1rem' }}>{coupon.type === 'percentage' ? `${coupon.discount_value}%` : '-'}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <span style={{ fontWeight: 'bold' }}>{coupon.used_count}</span>
                              {coupon.usage_limit > 0 ? ` / ${coupon.usage_limit}` : ' / ∞'}
                            </td>
                            <td suppressHydrationWarning style={{ padding: '1rem', color: isExpired ? '#ef4444' : 'inherit' }}>
                              {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : t('admin.noExpiry')}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button onClick={() => handleDeleteCoupon(coupon.id)} className="action-btn-danger" title={t('admin.deleteCouponTitle')}>{Icons.Trash}</button>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>{t('admin.noCoupons')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-categories-page">
              <div className="admin-categories-hero">
                <div>
                  <span>{t('admin.sidebarCategories')}</span>
                  <h3>{t('admin.addCategoryTitle')}</h3>
                </div>
                <strong>{categories.length}</strong>
              </div>

              <div className="admin-panel admin-categories-form-card">
                <form onSubmit={handleAddCategory} className="admin-categories-form">
                  <input type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="admin-input" placeholder={t('admin.categoryNamePlaceholder')} />
                  <button type="submit" className="btn-admin" style={{ whiteSpace: 'nowrap' }}>{Icons.Plus} {t('admin.addCategoryBtn')}</button>
                </form>
              </div>

              <div className="admin-categories-grid">
                {categories.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>{t('admin.noCategories')}</p> : categories.map(cat => (
                  <div key={cat.id} className="admin-category-card">
                    <div className="admin-category-card-main">
                      <div className="admin-category-card-icon">
                        {Icons.Categories}
                      </div>
                      <div>
                        <strong>{cat.name}</strong>
                        <small>#{cat.id}</small>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="action-btn-danger" title={t('admin.deleteCategoryTitle')}>
                      {Icons.Trash}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              {productView === 'list' ? (
                (() => {
                  const normalizedSearch = productSearchQuery.trim().toLowerCase();
                  const filteredProducts = products.filter(product => {
                    const productCategories = getProductCategories(product);
                    const matchesSearch = !normalizedSearch || [
                      product.id,
                      product.title,
                      product.category,
                      productCategories.join(' '),
                      product.badge
                    ].some(value => String(value ?? '').toLowerCase().includes(normalizedSearch));
                    const matchesCategory = !productCategoryFilter || productCategories.includes(productCategoryFilter);
                    const matchesStatus = !productStatusFilter ||
                      (productStatusFilter === 'active' && isProductActive(product)) ||
                      (productStatusFilter === 'hidden' && !isProductActive(product));
                    return matchesSearch && matchesCategory && matchesStatus;
                  });
                  const activeProductsCount = products.filter(isProductActive).length;
                  const hiddenProductsCount = products.length - activeProductsCount;
                  const lowStockCount = products.filter(product => getProductStock(product) <= 5).length;

                  return (
                    <div className="admin-products-page">
                      <div className="admin-products-header">
                        <div>
                          <h3>{t('admin.productListTitle', { count: products.length })}</h3>
                          <p>{t('admin.productResultsCount', { count: filteredProducts.length })}</p>
                        </div>
                        <button onClick={handleAddNewClick} className="btn-admin admin-products-add-btn">
                          {Icons.Plus} {t('admin.addProductBtn')}
                        </button>
                      </div>

                      <div className="admin-products-summary">
                        <div className="admin-products-summary-card total">
                          <div className="admin-products-summary-icon"><Package size={22} /></div>
                          <div>
                            <span>{t('admin.productSummaryTotal')}</span>
                            <strong>{products.length}</strong>
                          </div>
                        </div>
                        <div className="admin-products-summary-card active">
                          <div className="admin-products-summary-icon"><PackageCheck size={22} /></div>
                          <div>
                            <span>{t('admin.productSummaryActive')}</span>
                            <strong>{activeProductsCount}</strong>
                          </div>
                        </div>
                        <div className="admin-products-summary-card hidden">
                          <div className="admin-products-summary-icon"><PackageX size={22} /></div>
                          <div>
                            <span>{t('admin.productSummaryHidden')}</span>
                            <strong>{hiddenProductsCount}</strong>
                          </div>
                        </div>
                        <div className="admin-products-summary-card low-stock">
                          <div className="admin-products-summary-icon"><AlertCircle size={22} /></div>
                          <div>
                            <span>{t('admin.productSummaryLowStock')}</span>
                            <strong>{lowStockCount}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="admin-products-filters">
                        <label className="admin-products-search">
                          <Search size={19} />
                          <input
                            type="search"
                            value={productSearchQuery}
                            onChange={event => setProductSearchQuery(event.target.value)}
                            placeholder={t('admin.productSearchPlaceholder')}
                          />
                        </label>
                        <label className="admin-products-select">
                          <SlidersHorizontal size={18} />
                          <select value={productCategoryFilter} onChange={event => setProductCategoryFilter(event.target.value)}>
                            <option value="">{t('admin.productFilterAllCategories')}</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="admin-products-select">
                          <SlidersHorizontal size={18} />
                          <select value={productStatusFilter} onChange={event => setProductStatusFilter(event.target.value)}>
                            <option value="">{t('admin.productFilterAllStatuses')}</option>
                            <option value="active">{t('admin.productStatusActive')}</option>
                            <option value="hidden">{t('admin.productHiddenBadge')}</option>
                          </select>
                        </label>
                      </div>

                      {loading ? (
                        <div className="admin-products-empty">{t('admin.loading')}</div>
                      ) : (
                        <div className="admin-products-table-wrapper">
                          <table className="admin-table admin-products-table">
                            <thead>
                              <tr>
                                <th>{t('admin.productTitle')}</th>
                                <th>{t('admin.productCategory')}</th>
                                <th>{t('admin.productPrice')}</th>
                                <th>{t('admin.productStock')}</th>
                                <th>{t('admin.viewCount')}</th>
                                <th>{t('admin.salesCount')}</th>
                                <th>{t('admin.tableStatus')}</th>
                                <th>{t('admin.couponTableAction')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProducts.map(product => {
                                const productImage = getProductImage(product);
                                const stock = getProductStock(product);
                                const isActiveProduct = isProductActive(product);
                                return (
                                  <tr
                                    key={product.id}
                                    draggable
                                    onDragStart={(e) => handleProductDragStart(e, product.id)}
                                    onDragOver={handleProductDragOver}
                                    onDrop={(e) => handleProductDrop(e, product.id)}
                                    onDragEnd={handleProductDragEnd}
                                    className={draggedProductId === product.id ? 'dragging' : ''}
                                    style={{ cursor: 'grab' }}
                                  >
                                    <td data-label={t('admin.productTitle')}>
                                      <div className="admin-product-table-info">
                                        <div className="admin-product-table-thumb">
                                          <span>{Icons.Image}</span>
                                          {productImage && (
                                            <img
                                              src={productImage}
                                              alt={product.title}
                                              onError={event => { event.currentTarget.style.display = 'none'; }}
                                            />
                                          )}
                                        </div>
                                        <div className="admin-product-table-name">
                                          <strong>{product.title}</strong>
                                          <div>
                                            <span className="admin-product-id">#{product.id}</span>
                                            {product.is_offer === 1 || product.is_offer === true ? (
                                              <span className="admin-product-offer">{t('admin.offerLabel')}</span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td data-label={t('admin.productCategory')}>
                                      <div className="admin-product-category-list">
                                        {(getProductCategories(product).length ? getProductCategories(product) : [t('admin.otherCategory')]).map(item => (
                                          <span key={item} className="admin-product-category-badge">{item}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td data-label={t('admin.productPrice')}>
                                      <div className="admin-product-price-cell">
                                        <strong>{Number(product.price || 0).toLocaleString()} {t('admin.currency')}</strong>
                                        {product.old_price ? <span>{Number(product.old_price).toLocaleString()} {t('admin.currency')}</span> : null}
                                      </div>
                                    </td>
                                    <td data-label={t('admin.productStock')}>
                                      <button
                                        type="button"
                                        className={`admin-product-stock-badge ${stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'available'}`}
                                        onClick={() => openInventoryModal(product)}
                                        title={t('admin.invModalTitle')}
                                      >
                                        {stock}
                                      </button>
                                    </td>
                                    <td data-label={t('admin.viewCount')}>
                                      <span className="admin-product-metric">{Icons.Eye} {product.views || 0}</span>
                                    </td>
                                    <td data-label={t('admin.salesCount')}>
                                      <span className="admin-product-metric sales">{Icons.Trending} {product.sales || 0}</span>
                                    </td>
                                    <td data-label={t('admin.tableStatus')}>
                                      <span className={`admin-product-status ${isActiveProduct ? 'active' : 'hidden'}`}>
                                        {isActiveProduct ? t('admin.productStatusActive') : t('admin.productHiddenBadge')}
                                      </span>
                                    </td>
                                    <td data-label={t('admin.couponTableAction')}>
                                      <div className="admin-product-actions">
                                        <button type="button" onClick={() => handleEditClick(product)} className="admin-product-action edit" title={t('admin.editTooltip')}>
                                          {Icons.Edit}
                                        </button>
                                        <button type="button" onClick={() => openInventoryModal(product)} className="admin-product-action stock" title={t('admin.invModalTitle')}>
                                          <Box size={18} />
                                        </button>
                                        <button type="button" onClick={() => handleDeleteProduct(product.id)} className="admin-product-action delete" title={t('admin.deleteTooltip')}>
                                          {Icons.Trash}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {filteredProducts.length === 0 && (
                                <tr>
                                  <td colSpan="8" className="admin-products-empty">
                                    {products.length === 0 ? t('admin.noProductsText') : t('admin.productNoFilterResults')}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="admin-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: '800', margin: 0 }}>
                      {editingProductId ? t('admin.editProductTitle') : t('admin.addProductTitle')}
                    </h3>
                    <button onClick={() => setProductView('list')} className="btn-admin" style={{ background: '#f1f5f9', color: 'var(--text-dark)', padding: '0.6rem 1.2rem', fontSize: '0.95rem', boxShadow: 'none' }}>
                      {t('admin.cancelBtn')}
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="admin-form-grid" style={{ gap: '2rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.productNameLabel')}</label>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder={t('admin.productNamePlaceholder')} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{language === 'ar' ? 'ترتيب المنتج (اختياري - رقم يحدد موضع المنتج)' : 'Product Order (Optional)'}</label>
                      <input type="number" min="0" onWheel={(e) => e.target.blur()} value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="admin-input" placeholder={language === 'ar' ? '0 (الترتيب الافتراضي)' : '0 (Default Order)'} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.productBadgeOptionalLabel')}</label>
                      <input type="text" value={productBadge} onChange={e => setProductBadge(e.target.value)} className="admin-input" placeholder={t('admin.productBadgePlaceholder')} />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.priceLabelEgp')}</label>
                      <input type="number" onWheel={(e) => e.target.blur()} required value={price} onChange={e => setPrice(e.target.value)} className="admin-input" placeholder="0.00" />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.oldPriceLabel')}</label>
                      <input type="number" onWheel={(e) => e.target.blur()} value={oldPrice} onChange={e => setOldPrice(e.target.value)} className="admin-input" placeholder="0.00" />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.categorySelectLabel')}</label>
                      <div className="admin-multi-category-picker">
                        {categories.map(cat => (
                          <label key={cat.id} className={`admin-multi-category-option ${selectedCategories.includes(cat.name) ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.name)}
                              onChange={() => toggleProductCategory(cat.name)}
                            />
                            <span>{cat.name}</span>
                          </label>
                        ))}
                      </div>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                        {selectedCategories.length > 0 ? selectedCategories.join(' , ') : t('admin.categorySelectPlaceholder')}
                      </small>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.descriptionLabel')}</label>
                      <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} className="admin-input" placeholder={t('admin.descriptionPlaceholder')} rows="3" style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.descriptionImageOptionalLabel') || 'صور إضافية للوصف (اختياري)'}</label>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {descriptionImages.map((imgObj, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <img src={imgObj.preview} alt="Desc Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const newDesc = [...descriptionImages];
                                newDesc.splice(idx, 1);
                                setDescriptionImages(newDesc);
                              }}
                              style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <X size={14} color="#ef4444" />
                            </button>
                          </div>
                        ))}

                        <div
                          onClick={() => descFileInputRef.current?.click()}
                          style={{ width: '120px', height: '120px', borderRadius: '10px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', background: '#f8fafc', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold' }}>إضافة صورة</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={descFileInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files).map(file => ({
                              file,
                              preview: URL.createObjectURL(file)
                            }));
                            setDescriptionImages(prev => [...prev, ...newFiles]);
                            e.target.value = null; // reset input
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" id="is_offer" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: 'var(--primary-color)' }} />
                        <label htmlFor="is_offer" style={{ fontWeight: '800', color: 'var(--text-dark)', cursor: 'pointer', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Flame size={20} color="var(--primary-color)" /> {t('admin.offerLabel')}
                        </label>
                      </div>

                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#10b981' }} />
                        <label htmlFor="is_active" style={{ fontWeight: '800', color: 'var(--text-dark)', cursor: 'pointer', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          {t('admin.productActiveLabel')}
                        </label>
                      </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.colorsLabel')}</label>
                      <input type="text" value={productColors} onChange={e => setProductColors(e.target.value)} className="admin-input" placeholder={t('admin.colorsPlaceholder')} style={{ marginBottom: '1.5rem' }} />

                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.sizesLabel')}</label>
                      <input type="text" value={productSizes} onChange={e => setProductSizes(e.target.value)} className="admin-input" placeholder={t('admin.sizesPlaceholder')} />

                      {productSizes.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                        <div style={{ marginTop: '1.5rem', background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>تفاصيل المقاسات (اختياري)</label>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            {productSizes.split(',').map(s => s.trim()).filter(Boolean).map(size => (
                              <div key={size} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem' }}>
                                <div style={{ minWidth: '80px', fontWeight: '700', color: 'var(--primary-color)' }}>مقاس {size}</div>
                                <input
                                  type="text"
                                  value={sizeDetailsMap[size] || ''}
                                  onChange={e => setSizeDetailsMap({ ...sizeDetailsMap, [size]: e.target.value })}
                                  className="admin-input"
                                  placeholder={`مثال: يلبس من 1 إلى 2 سنة`}
                                  style={{ flex: '1 1 200px' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>


                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>{t('admin.imagesLabel')}</label>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <label className="admin-upload-box" style={{ width: '150px', height: '150px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <input type="file" multiple accept="image/*,video/*" onChange={handleProductImageChange} ref={productFileInputRef} style={{ display: 'none' }} />
                          <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{Icons.Image}</div>
                          <span style={{ color: 'var(--primary-color)', fontWeight: '700', textAlign: 'center', fontSize: '0.9rem' }}>{t('admin.uploadImageLabel')}</span>
                        </label>

                        {productImages.map((img, index) => (
                          <div key={index} style={{ width: '150px', height: '220px', borderRadius: '16px', overflow: 'hidden', border: primaryImageIndex === index ? '2px solid var(--primary-color)' : '1px solid #e2e8f0', position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '150px', position: 'relative' }}>
                              {(img.type === 'video' || isVideoUrl(img.preview)) ? (
                                <video src={img.preview || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline controls />
                              ) : (
                                <img src={img.preview || ''} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style=\"display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:0.85rem;font-weight:700\">No image</div>'; }} />
                              )}
                              <button type="button" onClick={() => removeProductImage(index)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrimaryImageIndex(index)}
                              className={`admin-primary-image-btn ${primaryImageIndex === index ? 'active' : ''}`}
                            >
                              {primaryImageIndex === index ? 'الصورة الأساسية' : 'اجعلها الأساسية'}
                            </button>
                            <select
                              value={img.color || ''}
                              onChange={(e) => {
                                const newImgs = [...productImages];
                                newImgs[index].color = e.target.value;
                                setProductImages(newImgs);
                              }}
                              style={{ width: '100%', border: 'none', borderTop: '1px solid #e2e8f0', padding: '0.4rem', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', background: '#f8fafc', color: 'var(--text-dark)' }}
                            >
                              <option value="">{t('admin.selectColorPlaceholder')}</option>
                              {productColors.split(',').map(s => s.trim()).filter(Boolean).map((col, i) => (
                                <option key={i} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn-admin" style={{ gridColumn: '1 / -1', padding: '1.2rem', marginTop: '1rem' }}>
                      {editingProductId ? t('admin.saveEditBtn') : t('admin.saveProductBtn')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.inventoryTitle')}</h3>
              </div>
              <div className="admin-panel" style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'right' }}>{t('admin.invProduct')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.invCategory')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.invStock')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.invStatus')}</th>
                      <th style={{ textAlign: 'center' }}>{t('admin.invUpdate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>{t('admin.invNoProducts')}</td></tr> : products.map(product => (
                      <tr key={product.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'right' }}>
                          <img src={getProductImage(product) || 'https://via.placeholder.com/40'} alt={product.title} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 'bold' }}>{product.title}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{product.category || '-'}</td>
                        <td style={{ fontWeight: '900', fontSize: '1.2rem', textAlign: 'center' }}>
                          {product.stock != null ? product.stock : 100}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {(product.stock != null ? product.stock : 100) <= 0 ? (
                            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' }}>{t('admin.invOutOfStock')}</span>
                          ) : (product.stock != null ? product.stock : 100) <= 10 ? (
                            <span style={{ background: '#fffbeb', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block', border: '1px solid #fcd34d' }}>{t('admin.invLowStock', { stock: (product.stock != null ? product.stock : 100) })}</span>
                          ) : (
                            <span style={{ background: '#ecfdf5', color: '#10b981', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' }}>{t('admin.invAvailable')}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => openInventoryModal(product)} className="btn-admin" style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>{t('admin.invEditBtn')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
              <style>{`
                @keyframes adminFadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .admin-fade-in {
                  animation: adminFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
              `}</style>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                <div style={{ color: 'var(--primary-color)' }}>{Icons.Settings}</div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', fontWeight: '900', margin: 0 }}>{t('admin.settingsTitle')}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>{t('admin.settingsDesc')}</p>
                </div>
              </div>

              {/* Settings Sub-Tabs Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                {[
                  { id: 'general', label: t('admin.settingsGenId') },
                  { id: 'hero', label: t('admin.settingsHero') },
                  { id: 'features', label: t('admin.settingsFeatures') },
                  { id: 'about', label: t('admin.settingsAbout') },
                  { id: 'why_us', label: t('admin.settingsWhyUs') },
                  { id: 'branches', label: t('admin.settingsBranches') },
                  { id: 'whatsapp', label: 'واتساب' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSettingsSubTab(sub.id)}
                    style={{
                      padding: '0.8rem 1.2rem',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      background: settingsSubTab === sub.id ? 'var(--primary-gradient)' : '#f8fafc',
                      color: settingsSubTab === sub.id ? 'white' : '#475569',
                      transition: 'all 0.3s',
                      boxShadow: settingsSubTab === sub.id ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none'
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* SUBTAB: GENERAL */}
                {settingsSubTab === 'general' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem' }}>{t('admin.settingsGeneralTitle')}</h4>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsStoreNameLabel')}</label>
                      <input type="text" name="store_name" value={settings.store_name || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsStoreNamePlaceholder')} />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsDefaultLangLabel')}</label>
                      <select
                        name="default_language"
                        value={settings.default_language || 'ar'}
                        onChange={handleSettingsChange}
                        className="admin-input"
                        style={{ padding: '0.8rem', cursor: 'pointer' }}
                      >
                        <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
                        <option value="en">{language === 'ar' ? 'English' : 'English'}</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
                      <div className="admin-form-group">
                        <label style={{ fontWeight: '700' }}>{t('admin.settingsFacebookLabel')}</label>
                        <input type="text" name="facebook_link" value={settings.facebook_link || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFacebookPlaceholder')} style={{ direction: 'ltr' }} />
                      </div>
                      <div className="admin-form-group">
                        <label style={{ fontWeight: '700' }}>{t('admin.settingsInstagramLabel')}</label>
                        <input type="text" name="instagram_link" value={settings.instagram_link || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsInstagramPlaceholder')} style={{ direction: 'ltr' }} />
                      </div>
                      <div className="admin-form-group">
                        <label style={{ fontWeight: '700' }}>{t('admin.settingsTiktokLabel')}</label>
                        <input type="text" name="tiktok_link" value={settings.tiktok_link || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsTiktokPlaceholder')} style={{ direction: 'ltr' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: HERO */}
                {settingsSubTab === 'hero' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem' }}>{t('admin.settingsHeroTitle')}</h4>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsHeroBadgeLabel')}</label>
                      <input type="text" name="hero_badge" value={settings.hero_badge || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsHeroBadgePlaceholder')} />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsHeroTitleLabel')}</label>
                      <input type="text" name="hero_title" value={settings.hero_title || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsHeroTitlePlaceholder')} />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsHeroDescLabel')}</label>
                      <textarea name="hero_desc" value={settings.hero_desc || ''} onChange={handleSettingsChange} className="admin-input" rows="3" placeholder={t('admin.settingsHeroDescPlaceholder')} style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div>
                      <label style={{ fontWeight: '800', display: 'block', marginBottom: '1rem', color: 'var(--text-dark)' }}>{t('admin.settingsHeroImagesLabel')}</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="admin-form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t('admin.settingsHeroImage1Label')}</label>
                          <label className="admin-upload-box" style={{ minHeight: '120px', marginTop: '0.5rem' }}>
                            <input type="file" accept="image/*" onChange={handleHeroImageChange} ref={heroFileInputRef} style={{ display: 'none' }} />
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{Icons.Image}</div>
                            <p style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.85rem' }}>{t('admin.settingsChangeImage')}</p>
                          </label>
                          {heroImagePreview && (
                            <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                              <img src={heroImagePreview} alt="Hero 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>

                        <div className="admin-form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t('admin.settingsHeroImage2Label')}</label>
                          <label className="admin-upload-box" style={{ minHeight: '120px', marginTop: '0.5rem' }}>
                            <input type="file" accept="image/*" onChange={handleHeroImage2Change} ref={heroFileInputRef2} style={{ display: 'none' }} />
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{Icons.Image}</div>
                            <p style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.85rem' }}>{t('admin.settingsChangeImage')}</p>
                          </label>
                          {heroImagePreview2 && (
                            <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                              <img src={heroImagePreview2} alt="Hero 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>

                        <div className="admin-form-group">
                          <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t('admin.settingsHeroImage3Label')}</label>
                          <label className="admin-upload-box" style={{ minHeight: '120px', marginTop: '0.5rem' }}>
                            <input type="file" accept="image/*" onChange={handleHeroImage3Change} ref={heroFileInputRef3} style={{ display: 'none' }} />
                            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{Icons.Image}</div>
                            <p style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.85rem' }}>{t('admin.settingsChangeImage')}</p>
                          </label>
                          {heroImagePreview3 && (
                            <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                              <img src={heroImagePreview3} alt="Hero 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: FEATURES */}
                {settingsSubTab === 'features' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem' }}>{t('admin.settingsFeaturesTitle')}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '-1rem 0 1rem 0' }}>{t('admin.settingsFeaturesDesc')}</p>

                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsFeature1Label')}</label>
                      <input type="text" name="ticker_text_1" value={settings.ticker_text_1 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeature1Placeholder')} />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsFeature2Label')}</label>
                      <input type="text" name="ticker_text_2" value={settings.ticker_text_2 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeature2Placeholder')} />
                    </div>
                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsFeature3Label')}</label>
                      <input type="text" name="ticker_text_3" value={settings.ticker_text_3 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeature3Placeholder')} />
                    </div>
                  </div>
                )}

                {/* SUBTAB: ABOUT */}
                {settingsSubTab === 'about' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem' }}>{t('admin.settingsAboutTitle')}</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="admin-form-group">
                        <label style={{ fontWeight: '700' }}>{t('admin.settingsAboutSubtitleLabel')}</label>
                        <input type="text" name="about_subtitle" value={settings.about_subtitle || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsAboutSubtitlePlaceholder')} />
                      </div>
                      <div className="admin-form-group">
                        <label style={{ fontWeight: '700' }}>{t('admin.settingsAboutTitleLabel')}</label>
                        <input type="text" name="about_title" value={settings.about_title || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsAboutTitlePlaceholder')} />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700' }}>{t('admin.settingsAboutTextLabel')}</label>
                      <textarea name="about_text" value={settings.about_text || ''} onChange={handleSettingsChange} className="admin-input" rows="5" placeholder={t('admin.settingsAboutTextPlaceholder')} style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>صورة قسم عن الرحاب</label>
                      <label className="admin-upload-box" style={{ minHeight: '120px', marginTop: '0.5rem' }}>
                        <input type="file" accept="image/*" onChange={handleAboutImageChange} ref={aboutFileInputRef} style={{ display: 'none' }} />
                        <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{Icons.Image}</div>
                        <p style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.85rem' }}>{t('admin.settingsChangeImage')}</p>
                      </label>
                      {aboutImagePreview && (
                        <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '240px' }}>
                          <img src={aboutImagePreview} alt="About Us" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUBTAB: WHY US */}
                {settingsSubTab === 'why_us' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem' }}>{t('admin.settingsWhyUsSectionTitle')}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>{t('admin.settingsWhyUsDesc')}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="admin-form-group">
                          <label style={{ fontWeight: '700' }}>{t('admin.settingsWhySubtitleLabel')}</label>
                          <input type="text" name="why_subtitle" value={settings.why_subtitle || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsWhySubtitlePlaceholder')} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontWeight: '700' }}>{t('admin.settingsWhyTitleLabel')}</label>
                          <input type="text" name="why_title" value={settings.why_title || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsWhyTitlePlaceholder')} />
                        </div>
                      </div>
                      <div className="admin-form-group" style={{ marginTop: '1.2rem' }}>
                        <label style={{ fontWeight: '700' }}>وصف قسم لماذا الرحاب</label>
                        <textarea name="why_desc" value={settings.why_desc || ''} onChange={handleSettingsChange} className="admin-input" rows="3" placeholder="اكتب وصفاً مختصراً يظهر أسفل عنوان قسم لماذا تختار الرحاب" style={{ resize: 'vertical' }}></textarea>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {/* Feature 1 */}
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('admin.settingsFeatureCard1')}</h5>
                        <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardTitle')}</label>
                          <input type="text" name="feature_title_1" value={settings.feature_title_1 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeatureNaturalPlaceholder')} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardDesc')}</label>
                          <textarea name="feature_desc_1" value={settings.feature_desc_1 || ''} onChange={handleSettingsChange} className="admin-input" rows="2" placeholder={t('admin.settingsFeatureDescPlaceholder')}></textarea>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('admin.settingsFeatureCard2')}</h5>
                        <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardTitle')}</label>
                          <input type="text" name="feature_title_2" value={settings.feature_title_2 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeatureQualityPlaceholder')} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardDesc')}</label>
                          <textarea name="feature_desc_2" value={settings.feature_desc_2 || ''} onChange={handleSettingsChange} className="admin-input" rows="2" placeholder={t('admin.settingsFeatureDescPlaceholder')}></textarea>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('admin.settingsFeatureCard3')}</h5>
                        <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardTitle')}</label>
                          <input type="text" name="feature_title_3" value={settings.feature_title_3 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeatureModernPlaceholder')} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardDesc')}</label>
                          <textarea name="feature_desc_3" value={settings.feature_desc_3 || ''} onChange={handleSettingsChange} className="admin-input" rows="2" placeholder={t('admin.settingsFeatureDescPlaceholder')}></textarea>
                        </div>
                      </div>

                      {/* Feature 4 */}
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>{t('admin.settingsFeatureCard4')}</h5>
                        <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardTitle')}</label>
                          <input type="text" name="feature_title_4" value={settings.feature_title_4 || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.settingsFeatureServicePlaceholder')} />
                        </div>
                        <div className="admin-form-group">
                          <label style={{ fontSize: '0.85rem' }}>{t('admin.settingsFeatureCardDesc')}</label>
                          <textarea name="feature_desc_4" value={settings.feature_desc_4 || ''} onChange={handleSettingsChange} className="admin-input" rows="2" placeholder={t('admin.settingsFeatureDescPlaceholder')}></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: BRANCHES */}
                {settingsSubTab === 'branches' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', margin: 0 }}>{t('admin.settingsBranchesTitle')}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>{t('admin.settingsBranchesDesc')}</p>
                      </div>
                      <button type="button" onClick={handleAddBranch} className="btn-admin" style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}>
                        {Icons.Plus} {t('admin.settingsAddBranchBtn')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      {branches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1' }}>
                          <p style={{ color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>{t('admin.settingsNoBranches')}</p>
                        </div>
                      ) : (
                        branches.map((branch, index) => (
                          <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              <input
                                type="text"
                                value={branch.name}
                                onChange={(e) => handleUpdateBranch(index, 'name', e.target.value)}
                                className="admin-input"
                                placeholder={t('admin.settingsBranchNamePlaceholder')}
                                style={{ padding: '0.8rem' }}
                              />
                              <input
                                type="text"
                                value={branch.link}
                                onChange={(e) => handleUpdateBranch(index, 'link', e.target.value)}
                                className="admin-input"
                                placeholder={t('admin.settingsBranchLinkPlaceholder')}
                                style={{ padding: '0.8rem', direction: 'ltr' }}
                              />
                            </div>
                            <button type="button" onClick={() => handleRemoveBranch(index)} className="action-btn-danger" style={{ alignSelf: 'center', padding: '0.8rem', borderRadius: '12px' }} title={t('admin.settingsDeleteBranchTitle')}>
                              {Icons.Trash}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SUBTAB: WHATSAPP */}
                {settingsSubTab === 'whatsapp' && (
                  <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Phone size={24} /> إعدادات واتساب
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>تحكم في أرقام الواتساب ورسائل التأكيد التلقائية للطلبات وتجهيز الطلبيات.</p>
                    </div>

                    <div className="admin-form-group" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: '800', marginBottom: '1rem', display: 'block', color: 'var(--primary-color)' }}>رقم هاتف الإدارة (لاستقبال الطلبات)</label>
                      <input type="text" name="admin_whatsapp" value={settings.admin_whatsapp || ''} onChange={handleSettingsChange} className="admin-input" placeholder="مثال: +201012345678" style={{ direction: 'ltr', fontSize: '1.1rem', padding: '1rem' }} />
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.8rem' }}>يجب أن يبدأ برمز الدولة (+20 لمصر)</p>
                    </div>

                    <div className="admin-form-group" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: '800', marginBottom: '1rem', display: 'block', color: 'var(--primary-color)' }}>قالب رسالة تأكيد الطلب (تجهيز شتلات وزراعة)</label>
                      <textarea name="wa_template_booking_order" value={settings.wa_template_booking_order || ''} onChange={handleSettingsChange} className="admin-input" rows="9" placeholder="مرحباً {name}،&#10;تم استلام طلب تجهيز الشتلات الخاص بك بنجاح (طلب رقم #{order_id}).&#10;&#10;تفاصيل الحجز:&#10;- المساحة: {qirat} قيراط&#10;- عدد الصواني: {trays} صواني&#10;المنتجات:&#10;{items}&#10;&#10;الإجمالي: {total} ج.م&#10;&#10;سيتم التواصل معك قريباً لتأكيد موعد التسليم. شكراً لاختيارك مشاتل الرحاب!" style={{ resize: 'vertical', padding: '1rem', lineHeight: '1.6' }}></textarea>
                      <div style={{ marginTop: '1rem', background: '#e2e8f0', padding: '1rem', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>المتغيرات المتاحة في الرسالة:</span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {['{name}', '{order_id}', '{total}', '{qirat}', '{trays}', '{items}'].map(v => (
                            <span key={v} style={{ background: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#0f172a' }}>{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}                <button type="submit" className="btn-admin" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.25)' }}>
                  {t('admin.settingsSaveAll')}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'booking_settings' && (
            <div className="admin-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <form onSubmit={handleSaveSettings} className="admin-form-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Calendar size={24} /> إعدادات الحجز (تجهيز طلبية)
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>تحكم في أسعار وصور صفحة حجز وتجهيز الطلبيات الزراعية.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '800', marginBottom: '0.5rem', display: 'block' }}>سعر الصينية الواحدة (ج.م)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={settings.booking_price_per_tray || ''}
                      onChange={(e) => setSettings({ ...settings, booking_price_per_tray: e.target.value })}
                      placeholder="مثال: 120"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '800', marginBottom: '0.5rem', display: 'block' }}>عدد الصواني لكل قيراط</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={settings.booking_trays_per_qirat || ''}
                      onChange={(e) => setSettings({ ...settings, booking_trays_per_qirat: e.target.value })}
                      placeholder="مثال: 6"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '800', marginBottom: '0.5rem', display: 'block' }}>ملاحظات للعميل تظهر في ملخص الحجز</label>
                  <textarea
                    className="admin-input"
                    value={settings.booking_notes || ''}
                    onChange={(e) => setSettings({ ...settings, booking_notes: e.target.value })}
                    placeholder="مثال: الشحن مجاني، سيتم التواصل معك لتحديد موعد التسليم..."
                    rows={3}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '800', marginBottom: '0.5rem', display: 'block' }}>صور صغيرة لمربعات شرح البونيكام</label>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                    اختر صورة واحدة من الميديا لكل مربع. ستظهر الصورة صغيرة بجانب الأيقونة في صفحة الحجز.
                  </p>
                  {[
                    ['booking_seo_image_1', 'ما هو البونيكام البرازيلي؟'],
                    ['booking_seo_image_2', 'مميزات شتلات البونيكام'],
                    ['booking_seo_image_3', 'لماذا يختار المربون البونيكام؟'],
                    ['booking_seo_image_4', 'دعم فني قبل وبعد الزراعة'],
                    ['booking_seo_image_5', 'توصيل شتلات البونيكام']
                  ].map(([field, label]) => {
                    const selectedUrl = settings[field] || '';
                    const imageItems = mediaGalleryItems.filter(item => !isVideoUrl(item.image_url));
                    return (
                      <div key={field} style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.8rem' }}>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{label}</strong>
                          {selectedUrl && (
                            <button
                              type="button"
                              onClick={() => setSettings(prev => ({ ...prev, [field]: '' }))}
                              style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: '999px', padding: '0.35rem 0.8rem', fontWeight: '800', cursor: 'pointer' }}
                            >
                              مسح
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: '8px' }}>
                          {imageItems.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', color: '#94a3b8', textAlign: 'center', padding: '0.8rem' }}>لا توجد صور متاحة في الميديا.</div>
                          ) : imageItems.map((item, idx) => {
                            const isSelected = selectedUrl === item.image_url;
                            return (
                              <button
                                type="button"
                                key={`${field}-${item.id || idx}`}
                                onClick={() => setSettings(prev => ({ ...prev, [field]: item.image_url }))}
                                style={{
                                  position: 'relative',
                                  cursor: 'pointer',
                                  borderRadius: '10px',
                                  overflow: 'hidden',
                                  border: isSelected ? '3px solid var(--primary-color)' : '2px solid transparent',
                                  opacity: isSelected ? 1 : 0.72,
                                  transition: 'all 0.2s',
                                  height: '74px',
                                  padding: 0,
                                  background: '#fff'
                                }}
                              >
                                <img src={normalizeMediaUrl(item.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                {isSelected && (
                                  <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={15} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '800', marginBottom: '0.5rem', display: 'block' }}>صور المعرض في صفحة الحجز</label>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                    اختر الصور التي تود عرضها في معرض الحجز بالضغط عليها.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {mediaGalleryItems.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>لا توجد صور في الميديا. قم برفع الصور من تبويب الميديا أولاً.</div>
                    ) : (
                      mediaGalleryItems.map((item, idx) => {
                        let selectedImages = [];
                        try { selectedImages = JSON.parse(settings.booking_gallery_images || '[]'); } catch { }
                        const isSelected = selectedImages.includes(item.image_url);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              const newImages = isSelected ? selectedImages.filter(url => url !== item.image_url) : [...selectedImages, item.image_url];
                              setSettings({ ...settings, booking_gallery_images: JSON.stringify(newImages) });
                            }}
                            style={{
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isSelected ? '3px solid var(--primary-color)' : '3px solid transparent',
                              opacity: isSelected ? 1 : 0.6,
                              transition: 'all 0.2s',
                              height: '100px'
                            }}
                          >
                            <img src={item.image_url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={16} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-admin" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.25)' }}>
                  <Save size={20} /> حفظ إعدادات الحجز
                </button>
              </form>
            </div>
          )}

          {/* TAB: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="admin-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <form onSubmit={handleSaveSettings} className="admin-form-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>{Icons.Shipping} {t('admin.shippingTitle')}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{t('admin.shippingDesc')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {shippingRates.map((rate, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', background: rate.enabled ? '#f8fafc' : '#f1f5f9', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', gap: '1rem', opacity: rate.enabled ? 1 : 0.6, transition: 'all 0.3s' }}>
                      <input
                        type="checkbox"
                        checked={rate.enabled}
                        onChange={(e) => handleUpdateShipping(index, 'enabled', e.target.checked)}
                        style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        title={t('admin.shippingEnableTitle')}
                      />
                      <span style={{ fontWeight: 'bold', color: 'var(--text-dark)', width: '100px' }}>{rate.gov}</span>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="number"
                          value={rate.price}
                          onChange={(e) => handleUpdateShipping(index, 'price', e.target.value)}
                          disabled={!rate.enabled}
                          className="admin-input"
                          placeholder={rate.enabled ? "0" : t('admin.shippingNotSupported')}
                          style={{ padding: '0.8rem 1rem 0.8rem 2.5rem', margin: 0, textAlign: 'left', direction: 'ltr', background: rate.enabled ? 'white' : 'transparent', cursor: rate.enabled ? 'text' : 'not-allowed' }}
                          onWheel={(e) => e.target.blur()}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: rate.enabled ? '#94a3b8' : 'transparent', fontWeight: 'bold', pointerEvents: 'none' }}>{t('admin.currency')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn-admin" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '3rem', width: '100%' }}>{t('admin.shippingSaveBtn')}</button>
              </form>
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && isAdmin && (
            <div className="admin-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)' }}>{t('admin.messagesTitle')}</h2>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                  {t('admin.messagesTotal', { count: contactMessages.length })}
                </div>
              </div>

              {contactMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" style={{ margin: '0 auto 1rem auto' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <p style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '700' }}>{t('admin.messagesEmpty')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {contactMessages.map(msg => (
                    <div key={msg.id} style={{ background: msg.is_read ? 'white' : '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: msg.is_read ? '1px solid #e2e8f0' : '1px solid #bbf7d0', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{msg.first_name} {msg.last_name}</h4>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> <span dir="ltr">{msg.phone}</span></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> {msg.email}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!msg.is_read && (
                            <button onClick={() => handleMarkMessageRead(msg.id)} style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>{t('admin.messagesMarkRead')}</button>
                          )}
                          <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>{t('admin.messagesDelete')}</button>
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                        {msg.message}
                      </div>
                      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }} suppressHydrationWarning>
                        {t('admin.messagesDatePrefix')} {new Date(msg.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'users' && isAdmin && (
            <div className="admin-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>

              <form onSubmit={handleCreateUser} className="admin-form-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>{t('admin.addUserTitle')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="admin-label">{t('admin.usernameLabel')}</label>
                    <input type="text" required className="admin-input" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder={t('admin.usernamePlaceholder')} />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">{t('admin.passwordLabel')}</label>
                    <input type="password" required className="admin-input" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder={t('admin.passwordPlaceholder')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="admin-label">{t('admin.roleLabel')}</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1, background: newUser.role === 'sales' ? '#f0fdf4' : 'transparent', borderColor: newUser.role === 'sales' ? '#22c55e' : '#e2e8f0' }}>
                        <input type="radio" name="role" value="sales" checked={newUser.role === 'sales'} onChange={() => setNewUser({ ...newUser, role: 'sales', permissions: SALES_TABS })} />
                        <span style={{ fontWeight: 'bold' }}>{t('admin.roleSalesLabel')}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1, background: newUser.role === 'admin' ? '#fff7ed' : 'transparent', borderColor: newUser.role === 'admin' ? '#ea580c' : '#e2e8f0' }}>
                        <input type="radio" name="role" value="admin" checked={newUser.role === 'admin'} onChange={() => setNewUser({ ...newUser, role: 'admin', permissions: ADMIN_TABS })} />
                        <span style={{ fontWeight: 'bold' }}>{t('admin.roleAdminLabel')}</span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="admin-label">الصلاحيات المسموحة</label>
                    <div className="admin-permissions-grid">
                      {PERMISSION_TAB_OPTIONS.map(option => {
                        const checked = Array.isArray(newUser.permissions) && newUser.permissions.includes(option.tab);
                        return (
                          <label key={option.tab} className={`admin-permission-chip ${checked ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleNewUserPermission(option.tab)}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {/* Warning removed */}
                  </div>
                </div>
                <button type="submit" className="btn-admin" style={{ marginTop: '2rem', width: '100%' }}>{t('admin.addUserBtn')}</button>
              </form>

              <div className="admin-card">
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>{t('admin.usersListTitle')}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.usersTableUsername')}</th>
                        <th>{t('admin.usersTableRole')}</th>
                        <th>الصلاحيات</th>
                        <th>{t('admin.usersTableDate')}</th>
                        <th style={{ textAlign: 'left' }}>{t('admin.usersTableActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                          <td>
                            {u.role === 'admin' ?
                              <span style={{ background: '#fff7ed', color: '#ea580c', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{t('admin.roleAdminBadge')}</span> :
                              <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{t('admin.roleSalesBadge')}</span>
                            }
                          </td>
                          <td>
                            <div className="admin-user-permissions-cell">
                              {(Array.isArray(u.permissions) && u.permissions.length > 0 ? u.permissions : (u.role === 'admin' ? ADMIN_TABS : SALES_TABS)).slice(0, 5).map(tab => (
                                <span key={tab}>{PERMISSION_TAB_OPTIONS.find(option => option.tab === tab)?.label || tab}</span>
                              ))}
                            </div>
                          </td>
                          <td suppressHydrationWarning>{new Date(u.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                          <td style={{ textAlign: 'left' }}>
                            {u.username !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u.id)} className="btn-action btn-delete" title={t('admin.userDeleteTooltip')}>
                                {Icons.Trash}
                              </button>
                            )}
                            {u.username === 'admin' && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('admin.userPrimary')}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && isAdmin && (
            <div className="admin-card animate-fade-in">
              <h2 className="admin-card-title">{t('admin.testimonialsTitle')}</h2>
              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center', marginBottom: '2rem' }}>
                <input type="file" accept="image/*" ref={testimonialFileInputRef} style={{ display: 'none' }} onChange={handleTestimonialUpload} />
                <button type="button" className="btn-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', background: 'var(--primary-gradient)' }} onClick={() => testimonialFileInputRef.current.click()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  {t('admin.testimonialsUploadBtn')}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {testimonials.map(t => (
                  <div key={t.id} style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <img src={t.image_url} alt="Review" style={{ width: '100%', height: '180px', objectFit: 'contain', display: 'block', background: '#f1f5f9' }} />
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEDIA GALLERY */}
          {activeTab === 'media' && isAdmin && (
            <div className="admin-card animate-fade-in">
              <h2 className="admin-card-title">معرض الميديا (صور)</h2>

              {/* Info bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span style={{ color: '#166534', fontWeight: '700', fontSize: '0.95rem' }}>
                  اضغط على الزر الخاص بالرئيسية على أي صورة لإظهارها في الصفحة الرئيسية — الصور ذات الإطار الأخضر محددة حالياً.
                </span>
                <span style={{ marginRight: 'auto', background: '#16a34a', color: '#fff', borderRadius: '100px', padding: '0.25rem 0.8rem', fontSize: '0.85rem', fontWeight: '800' }}>
                  {mediaGalleryItems.filter(m => Number(m.show_on_homepage) === 1).length} محدد
                </span>
              </div>

              <div
                style={{
                  background: isMediaDragging ? '#e0f2fe' : '#f8fafc',
                  padding: '3rem 2rem',
                  borderRadius: '20px',
                  border: isMediaDragging ? '2px dashed #0ea5e9' : '2px dashed #cbd5e1',
                  marginBottom: '2rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onDragOver={handleMediaDragOver}
                onDragLeave={handleMediaDragLeave}
                onDrop={handleMediaDrop}
                onClick={() => mediaFileInputRef.current.click()}
              >
                <div style={{ pointerEvents: 'none' }}>
                  <input type="file" accept="image/*" multiple ref={mediaFileInputRef} style={{ display: 'none' }} onChange={handleMediaUpload} />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={isMediaDragging ? "#0ea5e9" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', display: 'block', transition: 'all 0.2s ease' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: isMediaDragging ? '#0369a1' : '#334155', fontSize: '1.2rem', fontWeight: 'bold' }}>اسحب وأفلت الصور هنا</h3>
                  <p style={{ margin: 0, color: '#64748b' }}>أو اضغط لاختيار أكثر من ملف (الحد الأقصى 15 ميجا للملف)</p>

                  {isMediaUploading && (
                    <div style={{ marginTop: '1.5rem', color: '#0ea5e9', fontWeight: 'bold' }}>جاري رفع الملفات، يرجى الانتظار...</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {mediaGalleryItems.map(item => {
                  const isPinned = Number(item.show_on_homepage) === 1;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleMediaSortDragStart(e, item.id)}
                      onDragOver={handleMediaSortDragOver}
                      onDrop={(e) => handleMediaSortDrop(e, item.id)}
                      style={{
                        position: 'relative',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        border: isPinned ? '2.5px solid #16a34a' : (draggedMediaId === item.id ? '2px dashed #0ea5e9' : '1px solid #e2e8f0'),
                        boxShadow: isPinned ? '0 0 0 3px rgba(22,163,74,0.15), 0 4px 6px -1px rgba(0,0,0,0.05)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                        background: '#fff',
                        cursor: 'grab',
                        opacity: draggedMediaId === item.id ? 0.5 : 1,
                        transform: 'translateZ(0)',
                        transition: 'border 0.25s, box-shadow 0.25s'
                      }}
                    >
                      {/* Drag handle */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px', borderRadius: '8px', zIndex: 10, display: 'flex', alignItems: 'center', cursor: 'grab' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      </div>

                      {/* Media */}
                      <img src={normalizeMediaUrl(item.image_url)} alt={item.title || 'media'} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', background: '#f1f5f9' }} />

                      {/* Bottom action bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                        {/* Homepage pin toggle */}
                        <button
                          title={isPinned ? 'إلغاء التثبيت من الصفحة الرئيسية' : 'تثبيت في الصفحة الرئيسية'}
                          onClick={(e) => { e.stopPropagation(); handleToggleHomepage(item.id, isPinned ? 1 : 0); }}
                          style={{
                            flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            transition: 'all 0.25s',
                            background: isPinned ? '#dcfce7' : '#f1f5f9',
                            color: isPinned ? '#166534' : '#64748b',
                          }}
                        >
                          {isPinned ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> محدد</>
                          ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> الرئيسية</>
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id); }}
                          title="حذف"
                          style={{ background: '#fff0f0', color: '#dc2626', border: 'none', width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>

                      {/* Pinned badge */}
                      {isPinned && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#16a34a', color: '#fff', borderRadius: '8px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: '800', zIndex: 10, boxShadow: '0 2px 8px rgba(22,163,74,0.4)' }}>
                          رئيسية
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.whatsappTitle')}</h3>

                <div style={{ marginBottom: '2rem' }}>
                  {waStatus === 'CONNECTED' ? (
                    <div style={{ padding: '2rem', background: '#dcfce7', borderRadius: '15px', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 'bold' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <p style={{ fontSize: '1.2rem' }}>{t('admin.waConnected')}</p>
                      <button onClick={handleWaLogout} className="btn-admin" style={{ marginTop: '1rem', background: '#ef4444', border: 'none', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>{t('admin.waLogout')}</button>
                    </div>
                  ) : waStatus === 'WAITING_FOR_SCAN' ? (
                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                      <p style={{ color: 'var(--text-dark)', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>ربط الواتساب (مطلوب مسح الباركود)</p>
                      
                      {/* QR Code Only */}
                      {waQr ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem' }}>
                          <p style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold', background: '#fef2f2', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                            تنبيه: تم إيقاف الربط برقم الهاتف نهائياً بسبب أعطال من شركة واتساب نفسها.<br />
                            <strong>يجب استخدام كاميرا الموبايل لمسح هذا الباركود!</strong>
                          </p>
                          <p style={{ color: '#334155', fontSize: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            افتح الواتساب على موبايلك &gt; الأجهزة المرتبطة &gt; ربط بجهاز &gt; وجه الكاميرا للمربع الأسفل:
                          </p>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(waQr)}&size=300x300&margin=10`} alt="WhatsApp QR Code" style={{ width: '300px', height: '300px', border: '3px solid #10b981', borderRadius: '15px', padding: '10px', background: '#fff', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)' }} />
                          <button onClick={handleWaRestart} style={{ marginTop: '1.5rem', background: '#64748b', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>تحديث الباركود لو مش شغال</button>
                        </div>
                      ) : (
                         <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>جاري تحميل الباركود، يرجى الانتظار...</div>
                      )}
                    </div>
                  ) : waStatus === 'ERROR_NO_BACKEND' ? (
                    <div style={{ padding: '2rem', background: '#fef2f2', borderRadius: '15px', border: '1px solid #fecaca', color: '#ef4444', fontWeight: 'bold' }}>
                      <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('admin.waNoBackend')}</p>
                      <p style={{ fontSize: '0.9rem' }}>{t('admin.waNoBackendDesc')}</p>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', background: '#fffbeb', borderRadius: '15px', border: '1px solid #fde68a', color: '#b45309', fontWeight: 'bold' }}>
                      <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('admin.waInitializing')}</p>
                      <p style={{ fontSize: '0.9rem' }}>{t('admin.waWaitQr', { status: waStatus })}</p>
                    </div>
                  )}
                </div>
                <div style={{ width: '100%', maxWidth: '420px', padding: '1rem 1.2rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 900 }}>
                  الرسائل المحفوظة في الطابور: <span style={{ color: 'var(--primary-color)' }}>{waQueuedMessages}</span>
                </div>
                {waQrError && (
                  <p style={{ marginTop: '0.8rem', color: '#b45309', fontWeight: 800, fontSize: '0.9rem' }}>
                    جاري التجهيز... {waQrError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { handleWaRestart(); setWaPairingCode(''); setWaPairingPhone(''); }}
                  className="btn-admin"
                  style={{ marginTop: '1rem', background: '#0f172a', color: '#fff', border: 'none', padding: '0.85rem 1.5rem' }}
                >
                  إعادة تهيئة التسجيل
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="admin-panel">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.waSettingsTitle')}</h3>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="admin-form-group">
                    <label>{t('admin.waAdminPhoneLabel')}</label>
                    <input type="text" name="admin_whatsapp" value={settings.admin_whatsapp || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.waAdminPhonePlaceholder')} style={{ direction: 'ltr' }} />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waAdminPhoneHint')}</small>
                  </div>

                  <div className="admin-form-group">
                    <label>{t('admin.waSupportPhoneLabel')}</label>
                    <input type="text" name="support_whatsapp" value={settings.support_whatsapp || ''} onChange={handleSettingsChange} className="admin-input" placeholder={t('admin.waSupportPhonePlaceholder')} style={{ direction: 'ltr' }} />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waSupportPhoneHint')}</small>
                  </div>

                  <div className="admin-form-group">
                    <label>قالب رسالة تأكيد الطلب (تجهيز شتلات وزراعة)</label>
                    <textarea name="wa_template_new_order" value={settings.wa_template_new_order || ''} onChange={handleSettingsChange} className="admin-input" style={{ minHeight: '260px', resize: 'vertical', lineHeight: 1.8 }}></textarea>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waTemplateHint')}</small>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem', lineHeight: 1.8 }}>
                      متغيرات إضافية: {'{date_time}'}، {'{governorate}'}، {'{address}'}، {'{phones}'}، {'{products}'}، {'{subtotal}'}، {'{shipping}'}
                    </small>
                  </div>
                </div>

                <button type="submit" className="btn-admin" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '2rem', width: '100%' }}>{t('admin.waSaveBtn')}</button>
              </form>
            </div>
          )}

          {activeTab === 'select_market' && user && user.username === 'scmarkting' && (
            <div className="admin-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <form onSubmit={handleSaveSettings} className="admin-form-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src="/s-logo.png" alt="S" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    {t('admin.selectMarketTitle')}
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>{t('admin.selectMarketDesc')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Meta Card */}
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'settings.meta_pixel_enabled' === 'true' ? '1.5rem' : '0' }}>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        Meta Pixel & CAPI
                      </h4>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: settings.meta_pixel_enabled === 'true' ? '#10b981' : '#94a3b8' }}>{settings.meta_pixel_enabled === 'true' ? t('admin.integrationEnabled') : t('admin.integrationDisabled')}</span>
                        <div style={{ position: 'relative', width: '44px', height: '24px', background: settings.meta_pixel_enabled === 'true' ? '#10b981' : '#cbd5e1', borderRadius: '12px', transition: 'all 0.3s' }}>
                          <div style={{ position: 'absolute', top: '2px', left: settings.meta_pixel_enabled === 'true' ? '2px' : '22px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={settings.meta_pixel_enabled === 'true'} onChange={(e) => handleSettingsChange({ target: { name: 'meta_pixel_enabled', value: e.target.checked ? 'true' : 'false' } })} />
                      </label>
                    </div>
                    {settings.meta_pixel_enabled === 'true' && (
                      <div className="admin-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <div>
                          <label className="admin-label">Meta Pixel ID</label>
                          <input type="text" name="meta_pixel_id" value={settings.meta_pixel_id || ''} onChange={handleSettingsChange} className="admin-input" placeholder="e.g. 1234567890" style={{ direction: 'ltr' }} />
                        </div>
                        <div>
                          <label className="admin-label">Meta Access Token (Conversions API)</label>
                          <textarea name="meta_access_token" value={settings.meta_access_token || ''} onChange={handleSettingsChange} className="admin-input" rows="3" placeholder="EAAB..." style={{ direction: 'ltr', resize: 'vertical' }}></textarea>
                        </div>
                        <div>
                          <label className="admin-label">Test Event Code (Optional)</label>
                          <input type="text" name="meta_test_event_code" value={settings.meta_test_event_code || ''} onChange={handleSettingsChange} className="admin-input" placeholder="TEST12345" style={{ direction: 'ltr' }} />
                        </div>
                        <div>
                          <label className="admin-label">Meta Catalog Feed URL (Auto-Generated)</label>
                          <input suppressHydrationWarning type="text" readOnly value={`${origin}/api/catalog`} className="admin-input" style={{ direction: 'ltr', background: '#f8fafc', color: '#0f172a', cursor: 'copy', fontWeight: 'bold', border: '1px dashed #cbd5e1' }} onClick={e => { e.target.select(); navigator.clipboard.writeText(e.target.value); alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied!'); }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Google Ads Card */}
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'settings.google_ads_enabled' === 'true' ? '1.5rem' : '0' }}>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Google Ads Tracking
                      </h4>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: settings.google_ads_enabled === 'true' ? '#10b981' : '#94a3b8' }}>{settings.google_ads_enabled === 'true' ? t('admin.integrationEnabled') : t('admin.integrationDisabled')}</span>
                        <div style={{ position: 'relative', width: '44px', height: '24px', background: settings.google_ads_enabled === 'true' ? '#10b981' : '#cbd5e1', borderRadius: '12px', transition: 'all 0.3s' }}>
                          <div style={{ position: 'absolute', top: '2px', left: settings.google_ads_enabled === 'true' ? '2px' : '22px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={settings.google_ads_enabled === 'true'} onChange={(e) => handleSettingsChange({ target: { name: 'google_ads_enabled', value: e.target.checked ? 'true' : 'false' } })} />
                      </label>
                    </div>
                    {settings.google_ads_enabled === 'true' && (
                      <div className="admin-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <div>
                          <label className="admin-label">Google Tag ID (AW-XXXX)</label>
                          <input type="text" name="google_tag_id" value={settings.google_tag_id || ''} onChange={handleSettingsChange} className="admin-input" placeholder="AW-123456789" style={{ direction: 'ltr' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TikTok Card */}
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'settings.tiktok_pixel_enabled' === 'true' ? '1.5rem' : '0' }}>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8h-3v15a4 4 0 0 1-2-3.7z"></path></svg>
                        TikTok Pixel
                      </h4>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: settings.tiktok_pixel_enabled === 'true' ? '#10b981' : '#94a3b8' }}>{settings.tiktok_pixel_enabled === 'true' ? t('admin.integrationEnabled') : t('admin.integrationDisabled')}</span>
                        <div style={{ position: 'relative', width: '44px', height: '24px', background: settings.tiktok_pixel_enabled === 'true' ? '#10b981' : '#cbd5e1', borderRadius: '12px', transition: 'all 0.3s' }}>
                          <div style={{ position: 'absolute', top: '2px', left: settings.tiktok_pixel_enabled === 'true' ? '2px' : '22px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={settings.tiktok_pixel_enabled === 'true'} onChange={(e) => handleSettingsChange({ target: { name: 'tiktok_pixel_enabled', value: e.target.checked ? 'true' : 'false' } })} />
                      </label>
                    </div>
                    {settings.tiktok_pixel_enabled === 'true' && (
                      <div className="admin-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <div>
                          <label className="admin-label">TikTok Pixel ID</label>
                          <input type="text" name="tiktok_pixel_id" value={settings.tiktok_pixel_id || ''} onChange={handleSettingsChange} className="admin-input" placeholder="e.g. C01234567890" style={{ direction: 'ltr' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bosta Courier Card */}
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.bosta_enabled === 'true' ? '1.5rem' : '0' }}>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <img src="/bosta-logo.png" alt="Bosta Courier" style={{ height: '32px', objectFit: 'contain' }} />
                      </h4>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: settings.bosta_enabled === 'true' ? '#10b981' : '#94a3b8' }}>{settings.bosta_enabled === 'true' ? t('admin.integrationEnabled') : t('admin.integrationDisabled')}</span>
                        <div style={{ position: 'relative', width: '44px', height: '24px', background: settings.bosta_enabled === 'true' ? '#10b981' : '#cbd5e1', borderRadius: '12px', transition: 'all 0.3s' }}>
                          <div style={{ position: 'absolute', top: '2px', left: settings.bosta_enabled === 'true' ? '2px' : '22px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={settings.bosta_enabled === 'true'} onChange={(e) => handleSettingsChange({ target: { name: 'bosta_enabled', value: e.target.checked ? 'true' : 'false' } })} />
                      </label>
                    </div>
                    {settings.bosta_enabled === 'true' && (
                      <div className="admin-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <div>
                          <label className="admin-label">Bosta API Key</label>
                          <input type="text" name="bosta_api_key" value={settings.bosta_api_key || ''} onChange={handleSettingsChange} className="admin-input" placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5c..." style={{ direction: 'ltr' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Aramex Courier Card */}
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.aramex_enabled === 'true' ? '1.5rem' : '0' }}>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <img src="/aramex-logo.png" alt="Aramex Courier" style={{ height: '32px', objectFit: 'contain' }} />
                      </h4>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: settings.aramex_enabled === 'true' ? '#10b981' : '#94a3b8' }}>{settings.aramex_enabled === 'true' ? t('admin.integrationEnabled') : t('admin.integrationDisabled')}</span>
                        <div style={{ position: 'relative', width: '44px', height: '24px', background: settings.aramex_enabled === 'true' ? '#10b981' : '#cbd5e1', borderRadius: '12px', transition: 'all 0.3s' }}>
                          <div style={{ position: 'absolute', top: '2px', left: settings.aramex_enabled === 'true' ? '2px' : '22px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        </div>
                        <input type="checkbox" style={{ display: 'none' }} checked={settings.aramex_enabled === 'true'} onChange={(e) => handleSettingsChange({ target: { name: 'aramex_enabled', value: e.target.checked ? 'true' : 'false' } })} />
                      </label>
                    </div>
                    {settings.aramex_enabled === 'true' && (
                      <div className="admin-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <div>
                          <label className="admin-label">Aramex API Key</label>
                          <input type="text" name="aramex_api_key" value={settings.aramex_api_key || ''} onChange={handleSettingsChange} className="admin-input" placeholder="e.g. 1234567890abcdef..." style={{ direction: 'ltr' }} />
                        </div>
                        <div>
                          <label className="admin-label">Aramex Account PIN</label>
                          <input type="text" name="aramex_account_pin" value={settings.aramex_account_pin || ''} onChange={handleSettingsChange} className="admin-input" placeholder="e.g. 123456" style={{ direction: 'ltr' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn-admin" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.25)' }}>
                  {t('admin.settingsSaveAll')}
                </button>
              </form>
            </div>
          )}

          {/* TAB: SHIPPING MANAGEMENT */}
          {activeTab === 'shipping_management' && (
            <div className="admin-fade-in" style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <ShippingDashboard />
            </div>
          )}

          {/* TAB: TRANSLATIONS */}
          {activeTab === 'catalog_translations' && (
            <CatalogTranslationEditor />
          )}

          {activeTab === 'translations' && (
            <TranslationEditor />
          )}
          {/* TAB: ABOUT SELECT */}
          {activeTab === 'about_select' && (
            <div className="admin-card fade-in" style={{ padding: '3rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <img src="/s-logo.png" alt="S C Marketing" style={{ height: '180px', objectFit: 'contain', marginBottom: '1.5rem', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))' }} />
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>S C Marketing</h2>
                <p style={{ fontSize: '1.2rem', color: '#475569', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                  نحن مؤسسة رقمية متكاملة تم تأسيسها عام 2018 متخصصة في تقديم خدمات التسويق الإلكتروني وتصميم الهويات التجارية بالإضافة لحلول الويب و البرمجة و خدمات إستضافة المواقع و السيرفرات كما أننا نقدم حلول مبتكرة للشركات والمؤسسات وتطويرها بالأفكار الجديدة وبطرق تسويقية عصرية تساعد على الإنتشار وتحقيق الأهداف المطلوبة
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(157, 2, 124, 0.1)', color: '#9d027c', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>متابعة إحترافية مع خدمة العملاء</h3>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>متابعة دائمة لحلول أي عواقب وطرح إقتراحات تفيد نشاطك التجاري ونتبع دائماً مراحل تطويره.</p>
                </div>

                <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(255, 188, 1, 0.1)', color: '#ffbc01', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>اكثر من 15000+ حملة إعلانية</h3>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>نمتلك القدرة على تحسين مستوي حملاتك الإعلانية وإستهداف عملائك بخطة تسويقية خاصة بنشاطك التجاري لإستقطاب عملائك بكل سهولة.</p>
                </div>

                <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>خبرة اكثر من 9+ سنوات</h3>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>نحن عائلة كبيرة رواد في التسويق الرقمي من 2018 ومستمرين في تطوير الأنشطة التجارية انضم إلي عائلتنا.</p>
                </div>
              </div>

              <div style={{ background: '#0f172a', color: '#fff', padding: '3rem', borderRadius: '24px', marginBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffbc01', marginBottom: '1.5rem' }}>لماذا يجب أن تكون شركة S C Marketing إختيارك الأول؟</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '2', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                    يقال عنا إننا نتميز بالتخطيط القوي والتنفيذ الإبداعي المدعوم بمحتوى أصلي وجذاب ويخلق تفاعل كبير من قبل العملاء فإذا كنت تبحث عن شريك قوي وموثوق به وبنجاحاته ويمتلك خبرة كبيرة في خطط التسويق والمبادرات الرقمية الناجحة فإن S C Marketing خيارك الأفضل كما إننا نسعى جاهدين لفهم ودراسة حقيقية لأهداف النشاط التجاري أولاً ثم يتم إتخاذ جميع القرارات مع وضع هذه الأهداف في الإعتبار حيث أن الموقع الألكتروني لامع عديم القيمة إذا لم يساعدك في تحقيق أهدافك لدينا فريق عمل متخصص ذو خبرة كبيرة في مجال الخدمات الرقمية لدينا أفضل التحديثات الجديدة في العالم الرقمي في تنفيذ أعمالنا التواصل والمتابعة والتخطيط الدائم مع عملاؤنا نقوم ببناء سمعتك الإلكترونية من الصفر ومساعدتك على تطوير كيانك التجاري وتحقيق أهدافك التسويقية.
                  </p>
                </div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(157, 2, 124, 0.2)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 1 }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div style={{ borderRight: '4px solid #9d027c', paddingRight: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.8rem' }}>المتابعة</h4>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>بعد جهد دقيق وعملية تصميم وتنسيق، يتم تسليم المشروع إلى العميل. لكن ذلك لا يعني أبدًا أنه أخر المطاف. فنحن سنقوم بالتعرف على رد فعل العميل، ثم سنعود للعمل مرة أخرى لكي نطبق كل تعليقاته.</p>
                </div>
                <div style={{ borderRight: '4px solid #ffbc01', paddingRight: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.8rem' }}>العمل</h4>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>يعمل كتابنا، مصممينا، وجميع فريق التنفيذ بالعمل معاً على جلب العلامة التجارية إلى الحياة بما يتوافق مع القواعد وخطة العمل المقدمة.</p>
                </div>
                <div style={{ borderRight: '4px solid #10b981', paddingRight: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.8rem' }}>التخطيط</h4>
                  <p style={{ color: '#475569', lineHeight: '1.7', margin: 0 }}>بعد إستيعاب جميع النواحي والأفكار يجتمع فريق التسويق الإبداعي معاً ليتفقوا على أفضل طريقة للقيام بعملية إنشاء العلامة التجارية.</p>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #9d027c 0%, #ffbc01 100%)', padding: '2rem', borderRadius: '20px', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 10px 30px rgba(157, 2, 124, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={24} /></div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>اتصل بنا</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', direction: 'ltr' }}>01013100178</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>راسلنا</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>info@selectcustomersmarketing.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '300px' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={24} /></div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>العنوان</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.4' }}>شارع 15 مايو امام مطعم كنتاكي - شبرا الخيمة - القاهرة</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>





      </main>

      {inventoryModalProduct && (
        <div className="premium-modal-overlay" onClick={() => setInventoryModalProduct(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="premium-modal-content animate-up" onClick={e => e.stopPropagation()} style={{ background: '#ffffff', padding: '0', borderRadius: '24px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>

            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(to left, #f8fafc, #ffffff)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <Package size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: '900', margin: 0 }}>{t('admin.invModalTitle')}</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', fontWeight: 'bold' }}>{inventoryModalProduct.title}</p>
                </div>
              </div>
              <button onClick={() => setInventoryModalProduct(null)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}><X size={20} strokeWidth={2.5} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', overflowY: 'auto' }}>

              <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '800', color: '#334155', fontSize: '1.1rem' }}>{t('admin.invGeneralStockLabel')}</label>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{t('admin.invGeneralStockDesc')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '15px', color: '#94a3b8' }}><Box size={20} /></div>
                    <input type="number" onWheel={e => e.target.blur()} value={inventoryModalStock} onChange={e => setInventoryModalStock(e.target.value)} className="admin-input" placeholder={t('admin.invVariantPlaceholder')} style={{ paddingRight: '45px', fontSize: '1.1rem', fontWeight: 'bold', width: '100%', maxWidth: '200px' }} />
                  </div>
                </div>
                <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#475569', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  {inventoryModalStock || '0'}
                </div>
              </div>

              {(() => {
                let parsedOpts = {};
                try { parsedOpts = typeof inventoryModalProduct.options === 'string' ? JSON.parse(inventoryModalProduct.options) : (inventoryModalProduct.options || {}); } catch (e) { }
                if (Array.isArray(parsedOpts)) parsedOpts = { sizes: parsedOpts.map(o => o.name), colors: [] };

                const colorsArray = parsedOpts.colors || [];
                const sizesArray = parsedOpts.sizes || [];
                if (colorsArray.length === 0 && sizesArray.length === 0) return null;

                let variants = [];
                if (colorsArray.length > 0 && sizesArray.length > 0) {
                  colorsArray.forEach(c => sizesArray.forEach(s => variants.push(`${c} - ${s}`)));
                } else if (colorsArray.length > 0) {
                  variants = [...colorsArray];
                } else if (sizesArray.length > 0) {
                  variants = [...sizesArray];
                }

                return (
                  <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '20px', border: '2px dashed #fcd34d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '10px', color: '#d97706' }}><Edit3 size={22} /></div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#b45309' }}>{t('admin.invVariantTitle')}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>{t('admin.invVariantDesc')}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.2rem' }}>
                      {variants.map(variant => (
                        <div key={variant} style={{ background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #fde68a', boxShadow: '0 2px 4px rgba(217,119,6,0.05)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#fbbf24' }}></div>
                          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '900', marginBottom: '0.8rem', color: '#92400e' }}>{variant}</label>
                          <input type="number" onWheel={e => e.target.blur()} value={inventoryModalVariants[variant] ?? ''} onChange={e => setInventoryModalVariants({ ...inventoryModalVariants, [variant]: e.target.value })} className="admin-input" placeholder={t('admin.invVariantPlaceholder')} style={{ padding: '0.6rem', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }} />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                      <AlertCircle size={20} color="#b45309" />
                      <span style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 'bold' }}>{t('admin.invVariantNote')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setInventoryModalProduct(null)} className="btn-admin" style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '1rem 2rem', fontSize: '1.1rem' }}>{t('admin.invCancelBtn')}</button>
              <button onClick={handleSaveInventory} className="btn-admin" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(101, 163, 13, 0.2)' }}><Save size={20} /> {t('admin.invSaveBtn')}</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
