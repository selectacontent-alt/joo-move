import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Receipt, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TrackingPage = () => {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { t, language } = useLanguage();

  const toEnglishNumbers = (str) => {
    const map = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
    return String(str || '').replace(/[٠-٩]/g, digit => map[digit] || digit);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    const normalizedQuery = toEnglishNumbers(query.trim());
    
    // Validate only numbers and length 8 or 11
    if (!/^\d+$/.test(normalizedQuery)) {
      setErrorMsg(t('tracking.numbersOnly'));
      return;
    }
    if (normalizedQuery.length !== 8 && normalizedQuery.length !== 11) {
      setErrorMsg(t('tracking.invalidLength'));
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(normalizedQuery)}`);
      setOrders(res.ok ? await res.json() : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    if (!status) return 1;
    const value = String(status).toLowerCase();
    if (value.includes('رفض') || value.includes('ملغي') || value.includes('إلغاء') || value.includes('cancel')) return -1;
    if (value.includes('استلام') || value.includes('مكتمل') || value.includes('توصيل') || value.includes('deliver')) return 3;
    if (value.includes('شحن') || value.includes('ship')) return 2;
    return 1;
  };

  const parseProducts = (products) => {
    try {
      const parsed = typeof products === 'string' ? JSON.parse(products) : products;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const getOrderDate = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const steps = [
    { id: 1, label: t('tracking.statusReview'), icon: Clock },
    { id: 2, label: t('tracking.statusShip'), icon: Truck },
    { id: 3, label: t('tracking.statusDelivered'), icon: CheckCircle }
  ];

  return (
    <main className="tracking-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <section className="tracking-hero">
        <h1>{t('tracking.title')}</h1>
        <p>{t('tracking.desc')}</p>
      </section>

      <section className="tracking-search-panel">
        <form onSubmit={handleSearch} className="tracking-search-form">
          <label>
            <span>{t('tracking.inputLabel')}</span>
            <div>
              <Search size={20} />
              <input
                type="text"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setErrorMsg(''); }}
                placeholder={t('tracking.inputPlaceholder')}
                required
              />
            </div>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? <span className="tracking-spinner" /> : <Search size={19} />}
            {loading ? t('tracking.btnSearching') : t('tracking.btnTrack')}
          </button>
        </form>
        {errorMsg && <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</div>}
      </section>

      {hasSearched && !loading && orders.length === 0 && (
        <section className="tracking-empty">
          <Search size={42} />
          <h2>{t('tracking.notFoundTitle')}</h2>
          <p>{t('tracking.notFoundDesc')}</p>
        </section>
      )}

      {orders.length > 0 && (
        <section className="tracking-results">
          <div className="tracking-results-title">
            <h2>{t('tracking.relatedOrders')}</h2>
            <span>{orders.length}</span>
          </div>

          {orders.map((order, index) => {
            const step = getStatusStep(order.status);
            const products = parseProducts(order.products);

            return (
              <article className="tracking-order-card" key={order.id} style={{ animationDelay: `${index * 0.06}s` }}>
                <header className="tracking-order-header">
                  <div>
                    <span className="tracking-status-pill">
                      {step === -1 ? <XCircle size={16} /> : <Package size={16} />}
                      {step === -1 ? t('tracking.statusCancelled') : order.status || t('tracking.statusReview')}
                    </span>
                    <h3>{t('tracking.orderNum')}{order.order_number || order.id}</h3>
                    <p>{t('tracking.orderDate')} {getOrderDate(order.created_at)}</p>
                  </div>
                  <div className="tracking-total-card">
                    <Receipt size={18} />
                    <span>{t('tracking.total')}</span>
                    <b>{Number(order.total || 0).toLocaleString()} {t('tracking.currency')}</b>
                  </div>
                </header>

                <div className={`tracking-progress ${step === -1 ? 'cancelled' : ''}`}>
                  <div className="tracking-progress-line">
                    <span style={{ width: step <= 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                  </div>
                  {steps.map(item => {
                    const Icon = item.icon;
                    const done = step >= item.id;
                    const active = step === item.id;
                    return (
                      <div key={item.id} className={`tracking-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <span><Icon size={20} /></span>
                        <b>{item.label}</b>
                      </div>
                    );
                  })}
                </div>

                {step === -1 && (
                  <div className="tracking-cancelled-note">
                    <XCircle size={18} />
                    {t('tracking.statusCancelled')}
                  </div>
                )}

                {products.length > 0 && (
                  <div className="tracking-products">
                    <div className="tracking-products-head">
                      <h4>{t('tracking.orderContents')}</h4>
                      <span>{t('tracking.productCount', { count: products.length })}</span>
                    </div>
                    {products.map((product, productIndex) => (
                      <div className="tracking-product-row" key={`${product.title}-${productIndex}`}>
                        <div className="tracking-product-qty">x{product.quantity || 1}</div>
                        <div className="tracking-product-copy">
                          <strong>{product.title || t('tracking.productFallback')}</strong>
                          {product.variantName && <span><MapPin size={13} /> {product.variantLabel || product.variantName}</span>}
                        </div>
                        <b>{Number((product.price || 0) * (product.quantity || 1)).toLocaleString()} {t('tracking.currency')}</b>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default TrackingPage;
