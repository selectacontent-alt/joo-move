import React, { useEffect, useState } from 'react';
import { User, LogOut, Package, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const getStatusTheme = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (
    normalized.includes('delivered') ||
    normalized.includes('تم التوصيل') ||
    normalized.includes('مكتمل') ||
    normalized.includes('completed')
  ) {
    return 'success';
  }

  if (
    normalized.includes('shipped') ||
    normalized.includes('shipping') ||
    normalized.includes('قيد الشحن') ||
    normalized.includes('تم الشحن') ||
    normalized.includes('dispatch')
  ) {
    return 'info';
  }

  if (
    normalized.includes('cancel') ||
    normalized.includes('رفض') ||
    normalized.includes('ملغي') ||
    normalized.includes('مرفوض')
  ) {
    return 'danger';
  }

  if (
    normalized.includes('review') ||
    normalized.includes('pending') ||
    normalized.includes('processing') ||
    normalized.includes('قيد') ||
    normalized.includes('مراجعة') ||
    normalized.includes('انتظار')
  ) {
    return 'warning';
  }

  return 'neutral';
};

const CustomerDashboard = ({ setCurrentPage, customerAuth, setCustomerAuth }) => {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!customerAuth) {
      setCurrentPage('login');
      return;
    }

    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setOrdersError('');

        const response = await fetch('/api/customer/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('customer_token')}`,
          },
        });

        const data = await response.json();

        if (!isMounted) return;

        if (!response.ok) {
          setOrders([]);
          setOrdersError(
            data?.error || t('account.loadFailed')
          );
          return;
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Customer orders fetch failed:', error);
        if (!isMounted) return;
        setOrders([]);
        setOrdersError(t('account.loadError'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [customerAuth, language, setCurrentPage, t]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    setCustomerAuth(null);
    setCurrentPage('home');
  };

  if (!customerAuth) return null;

  return (
    <div className="customer-dashboard" style={{ minHeight: '80vh', padding: '4rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem' }}>
              {t('account.title')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
              {t('account.welcome', { name: customerAuth.name })}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#fef2f2',
              color: '#ef4444',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={18} /> {t('account.logout')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {t('account.details')}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
                  {t('account.name')}
                </p>
                <p style={{ color: '#334155', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{customerAuth.name}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
                  {t('account.email')}
                </p>
                <p style={{ color: '#334155', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{customerAuth.email}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
                  {t('account.phone')}
                </p>
                <p
                  style={{
                    color: '#334155',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    margin: 0,
                    direction: 'ltr',
                    textAlign: language === 'ar' ? 'right' : 'left',
                  }}
                >
                  {customerAuth.phone || '---'}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              gridColumn: '1 / -1',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={24} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {t('account.orders')}
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                {t('account.loading')}
              </div>
            ) : ordersError ? (
              <div className="customer-orders-error">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <ShoppingBag size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.3rem', color: '#64748b', fontWeight: 'bold' }}>
                  {t('account.empty')}
                </h3>
                <button
                  onClick={() => setCurrentPage('store')}
                  style={{
                    marginTop: '1.5rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 2rem',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {t('account.browse')}
                </button>
              </div>
            ) : (
              <>
                <div className="customer-orders-table-wrap">
                  <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.9rem' }}>
                        <th
                          style={{
                            padding: '1rem',
                            textAlign: language === 'ar' ? 'right' : 'left',
                            borderRadius: language === 'ar' ? '0 12px 12px 0' : '12px 0 0 12px',
                          }}
                        >
                          {t('account.orderNumber')}
                        </th>
                        <th style={{ padding: '1rem', textAlign: language === 'ar' ? 'right' : 'left' }}>
                          {t('account.date')}
                        </th>
                        <th style={{ padding: '1rem', textAlign: language === 'ar' ? 'right' : 'left' }}>
                          {t('account.total')}
                        </th>
                        <th
                          style={{
                            padding: '1rem',
                            textAlign: language === 'ar' ? 'right' : 'left',
                            borderRadius: language === 'ar' ? '12px 0 0 12px' : '0 12px 12px 0',
                          }}
                        >
                          {t('account.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusTheme = getStatusTheme(order.status);

                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                              #{order.order_number || order.id}
                            </td>
                            <td style={{ padding: '1rem', color: '#64748b' }}>
                              {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{order.total} {t('account.currency')}</td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`customer-order-status customer-order-status--${statusTheme}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="customer-orders-mobile-list">
                  {orders.map((order) => {
                    const statusTheme = getStatusTheme(order.status);

                    return (
                      <article key={order.id} className="customer-order-card">
                        <div className="customer-order-card__top">
                          <div className="customer-order-card__meta">
                            <span className="customer-order-card__label">{t('account.orderNumber')}</span>
                            <strong>#{order.order_number || order.id}</strong>
                          </div>
                          <span className={`customer-order-status customer-order-status--${statusTheme}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="customer-order-card__grid">
                          <div className="customer-order-card__field">
                            <span>{t('account.date')}</span>
                            <strong>{new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</strong>
                          </div>
                          <div className="customer-order-card__field">
                            <span>{t('account.total')}</span>
                            <strong>{order.total} {t('account.currency')}</strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
