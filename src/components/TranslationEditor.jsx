import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Save, ChevronDown, ChevronUp, Globe } from 'lucide-react';

const SECTION_LABELS = {
  nav: 'Navbar',
  hero: 'Hero Section',
  products: 'Products',
  cart: 'Cart',
  about: 'About Us',
  testimonials: 'Testimonials',
  footer: 'Footer',
  policy: 'Return Policy',
  categories: 'Categories',
  checkout: 'Checkout',
  login: 'Login',
  app: 'App',
  whatsapp: 'WhatsApp Widget',
  admin: 'Admin Panel',
  tracking: 'Order Tracking',
  booking: 'Booking Page',
  media: 'Media Gallery',
  homeMedia: 'Homepage Gallery',
  customerAuth: 'Customer Login & Registration',
  b2b: 'Wholesale Features',
  account: 'Customer Account',
  checkoutNew: 'Checkout Experience',
  translationSettings: 'Translation Settings',
};

const SECTION_LABELS_AR = {
  nav: 'شريط التنقل', hero: 'الواجهة الرئيسية', products: 'المنتجات', cart: 'السلة',
  about: 'من نحن', testimonials: 'آراء العملاء', footer: 'الفوتر', policy: 'السياسات',
  categories: 'التصنيفات', checkout: 'إتمام الطلب', checkoutNew: 'تجربة إتمام الطلب',
  customerAuth: 'دخول وتسجيل العملاء', account: 'حساب العميل', booking: 'صفحة الحجز',
  media: 'معرض الميديا', homeMedia: 'معرض الصفحة الرئيسية', b2b: 'توريدات الجملة',
  login: 'دخول الأدمن', app: 'عناوين الصفحات', whatsapp: 'واتساب', tracking: 'تتبع الطلب',
  admin: 'لوحة التحكم', translationSettings: 'إعدادات الترجمة',
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const TranslationEditor = () => {
  const { t, updateTranslationsBatch, defaultTranslations, overrides, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sections = useMemo(() => {
    const result = {};
    const walk = (obj, prefix) => {
      for (const key of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (obj[key] && typeof obj[key] === 'object' && 'ar' in obj[key] && 'en' in obj[key]) {
          if (!result[prefix]) result[prefix] = [];
          result[prefix].push({ key: path, ar: obj[key].ar, en: obj[key].en });
        } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          walk(obj[key], path);
        }
      }
    };
    walk(defaultTranslations, '');
    return result;
  }, [defaultTranslations]);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    const result = {};
    for (const [section, entries] of Object.entries(sections)) {
      const filtered = entries.filter(e =>
        e.key.toLowerCase().includes(q) ||
        e.ar.includes(q) ||
        e.en.toLowerCase().includes(q)
      );
      if (filtered.length > 0) result[section] = filtered;
    }
    return result;
  }, [sections, search]);

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEdit = (key, field, value) => {
    setEdits(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
    setSaved(false);
  };

  const getDisplayValue = (key, field, defaultValue) => {
    if (edits[key] && edits[key][field] !== undefined) {
      return edits[key][field];
    }
    const ov = getNestedValue(overrides, key);
    if (ov && ov[field] !== undefined) {
      return ov[field];
    }
    return defaultValue;
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(edits).map(([key, obj]) => {
      const ov = getNestedValue(overrides, key) || {};
      const def = getNestedValue(defaultTranslations, key) || {};
      const arValue = obj.ar !== undefined ? obj.ar : (ov.ar !== undefined ? ov.ar : (def.ar || ''));
      const enValue = obj.en !== undefined ? obj.en : (ov.en !== undefined ? ov.en : (def.en || ''));
      return { key, arValue, enValue };
    });
    if (entries.length === 0) { setSaving(false); return; }
    await updateTranslationsBatch(entries);
    setEdits({});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionKeys = Object.keys(filteredSections);
  const sortedSections = ['nav', 'hero', 'products', 'cart', 'about', 'testimonials', 'footer', 'policy', 'categories', 'checkout', 'checkoutNew', 'customerAuth', 'account', 'booking', 'media', 'homeMedia', 'b2b', 'login', 'app', 'whatsapp', 'tracking', 'translationSettings', 'admin']
    .filter(s => sectionKeys.includes(s))
    .concat(sectionKeys.filter(s => !['nav', 'hero', 'products', 'cart', 'about', 'testimonials', 'footer', 'policy', 'categories', 'checkout', 'checkoutNew', 'customerAuth', 'account', 'booking', 'media', 'homeMedia', 'b2b', 'login', 'app', 'whatsapp', 'tracking', 'translationSettings', 'admin'].includes(s)));

  return (
    <div className="admin-fade-in">
      <div className="admin-form-card" style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Globe size={24} style={{ color: 'var(--primary-color)' }} /> {language === 'ar' ? 'إدارة ترجمات ونصوص الموقع' : 'Manage Site Languages & Texts'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{language === 'ar' ? 'تعديل النصوص والترجمات باللغتين العربية والإنجليزية لجميع أقسام الموقع.' : 'Edit Arabic and English texts/translations for all sections of the site.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '220px', outline: 'none' }}
              />
            </div>
            <button onClick={handleSave} disabled={saving || Object.keys(edits).length === 0} className="btn-admin" style={{ background: saved ? '#16a34a' : 'var(--primary-gradient)', color: 'white', border: 'none', padding: '0.7rem 1.8rem', borderRadius: '12px', fontWeight: '800', cursor: saving || Object.keys(edits).length === 0 ? 'not-allowed' : 'pointer', opacity: saving || Object.keys(edits).length === 0 ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Save size={18} /> {saved ? (language === 'ar' ? 'تم الحفظ!' : 'Saved!') : saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ جميع التعديلات' : 'Save All Changes')}
            </button>
          </div>
        </div>

        {sortedSections.map(section => (
          <div key={section} style={{ marginBottom: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div
              onClick={() => toggleSection(section)}
              style={{ padding: '1rem 1.5rem', background: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-dark)', userSelect: 'none' }}
            >
              <span>{language === 'ar' ? (SECTION_LABELS_AR[section] || section) : (SECTION_LABELS[section] || section)} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>({filteredSections[section].length})</span></span>
              {expanded[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expanded[section] && (
              <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
                {filteredSections[section].map(entry => {
                  const arEdited = edits[entry.key]?.ar !== undefined;
                  const enEdited = edits[entry.key]?.en !== undefined;
                  return (
                    <div key={entry.key} style={{ padding: '1.2rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>{entry.key}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>{language === 'ar' ? 'العربية' : 'Arabic'}</label>
                          <textarea
                            rows={entry.ar.length > 90 ? 3 : 1}
                            value={getDisplayValue(entry.key, 'ar', entry.ar)}
                            onChange={e => handleEdit(entry.key, 'ar', e.target.value)}
                            dir="rtl"
                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: arEdited ? '2px solid var(--primary-color)' : '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: arEdited ? '#fffbeb' : 'white', textAlign: 'right' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>English</label>
                          <textarea
                            rows={entry.en.length > 90 ? 3 : 1}
                            value={getDisplayValue(entry.key, 'en', entry.en)}
                            onChange={e => handleEdit(entry.key, 'en', e.target.value)}
                            dir="ltr"
                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: enEdited ? '2px solid var(--primary-color)' : '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: enEdited ? '#fffbeb' : 'white', textAlign: 'left' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {sortedSections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{language === 'ar' ? 'لا توجد ترجمات مطابقة' : 'No translations found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationEditor;
