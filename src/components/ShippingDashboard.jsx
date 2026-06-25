import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const copy = {
  ar: {
    title: 'إدارة شحن الطلبات',
    subtitle: 'قبول الطلبات وإرسالها لشركات الشحن وطباعة البوليصة من مكان واحد.',
    refresh: 'تحديث',
    search: 'بحث برقم الطلب، العميل، الهاتف، أو رقم التتبع...',
    all: 'كل الطلبات',
    pending: 'جاهزة للشحن',
    dispatched: 'تم الشحن',
    empty: 'لا توجد طلبات مطابقة.',
    totalOrders: 'إجمالي الطلبات',
    readyOrders: 'جاهزة للشحن',
    shippedOrders: 'تم شحنها',
    totalValue: 'قيمة الطلبات',
    order: 'الطلب',
    customer: 'العميل',
    phone: 'الهاتف',
    date: 'التاريخ',
    value: 'القيمة',
    status: 'حالة الشحن',
    tracking: 'التتبع',
    actions: 'الإجراء',
    noPhone: 'لا يوجد هاتف',
    noTracking: 'لم يصدر بعد',
    provider: 'شركة الشحن',
    printLabel: 'طباعة البوليصة',
    dispatchBosta: 'بوسطة',
    dispatchAramex: 'أرامكس',
    dispatching: 'جاري الإرسال',
    pendingStatus: 'لم يتم الشحن',
    dispatchedStatus: 'تم الشحن',
    errorPrefix: 'تعذر تنفيذ العملية',
    shippingDisabledMsg: 'يرجى التواصل مع خدمه العملاء لتفعيل خدمه الشحن',
    egp: 'ج.م',
  },
  en: {
    title: 'Shipping Management',
    subtitle: 'Accept orders, dispatch them to couriers, and print labels from one operational table.',
    refresh: 'Refresh',
    search: 'Search by order, customer, phone, or tracking number...',
    all: 'All Orders',
    pending: 'Ready to Ship',
    dispatched: 'Dispatched',
    empty: 'No matching orders found.',
    totalOrders: 'Total Orders',
    readyOrders: 'Ready to Ship',
    shippedOrders: 'Dispatched',
    totalValue: 'Orders Value',
    order: 'Order',
    customer: 'Customer',
    phone: 'Phone',
    date: 'Date',
    value: 'Value',
    status: 'Shipping Status',
    tracking: 'Tracking',
    actions: 'Action',
    noPhone: 'No phone',
    noTracking: 'Not issued yet',
    provider: 'Courier',
    printLabel: 'Print Label',
    dispatchBosta: 'Bosta',
    dispatchAramex: 'Aramex',
    dispatching: 'Dispatching',
    pendingStatus: 'Not shipped',
    dispatchedStatus: 'Dispatched',
    errorPrefix: 'Could not complete action',
    shippingDisabledMsg: 'Please contact customer service to activate the shipping service',
    egp: 'EGP',
  },
};

const formatCurrency = (value, language, label) => {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} ${label}`;
};

const getOrderNumber = (order) => order.order_number || order.id;

const getCustomerName = (order) => {
  const [name] = String(order.customer_name || '').split('|').map((part) => part.trim());
  return name || '-';
};

const isDispatched = (order) => order.shipping_status === 'Dispatched' || Boolean(order.tracking_number);

export default function ShippingDashboard() {
  const { language } = useLanguage();
  const text = copy[language] || copy.ar;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState(null);

  const fetchOrders = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      const sorted = data.sort((a, b) => {
        if (isDispatched(a) && !isDispatched(b)) return 1;
        if (!isDispatched(a) && isDispatched(b)) return -1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      setError(`${text.errorPrefix}: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((order) => !isDispatched(order));
    const shippedOrders = orders.filter(isDispatched);
    const totalValue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return [
      { label: text.totalOrders, value: orders.length, tone: 'neutral', icon: PackageCheck },
      { label: text.readyOrders, value: pendingOrders.length, tone: 'warning', icon: Clock3 },
      { label: text.shippedOrders, value: shippedOrders.length, tone: 'success', icon: CheckCircle2 },
      { label: text.totalValue, value: formatCurrency(totalValue, language, text.egp), tone: 'money', icon: Truck },
    ];
  }, [orders, language, text]);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      if (filter === 'pending' && isDispatched(order)) return false;
      if (filter === 'dispatched' && !isDispatched(order)) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        getOrderNumber(order),
        getCustomerName(order),
        order.customer_name,
        order.customer_phone,
        order.shipping_provider,
        order.tracking_number,
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [orders, query, filter]);

  const handleDispatch = async (orderId, provider) => {
    setDispatchingId(`${orderId}-${provider}`);
    setError(null);

    try {
      const response = await fetch(`/api/shipping/dispatch/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to dispatch order');

      await fetchOrders({ silent: true });
    } catch (err) {
      const errorMsg = err.message === 'shippingDisabledMsg' ? text.shippingDisabledMsg : err.message;
      setError(`${text.errorPrefix}: ${errorMsg}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handlePrintLabel = (url) => {
    if (url) window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="shipping-dashboard-loading">
        <Loader2 className="shipping-spin" size={34} />
      </div>
    );
  }

  return (
    <section className="shipping-dashboard">
      <div className="shipping-toolbar">
        <div className="shipping-title-block">
          <div className="shipping-title-icon">
            <Truck size={24} />
          </div>
          <div>
            <h2>{text.title}</h2>
            <p>{text.subtitle}</p>
          </div>
        </div>

        <button className="shipping-refresh-btn" type="button" onClick={() => fetchOrders({ silent: true })} disabled={refreshing}>
          {refreshing ? <Loader2 className="shipping-spin" size={18} /> : <RefreshCw size={18} />}
          {text.refresh}
        </button>
      </div>

      <div className="shipping-stats-grid">
        {stats.map(({ label, value, tone, icon: Icon }) => (
          <div className={`shipping-stat shipping-stat-${tone}`} key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="shipping-controls">
        <div className="shipping-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
        </div>

        <div className="shipping-segments" role="tablist" aria-label={text.status}>
          {[
            ['all', text.all],
            ['pending', text.pending],
            ['dispatched', text.dispatched],
          ].map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="shipping-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="shipping-table-wrap">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>{text.order}</th>
              <th>{text.customer}</th>
              <th>{text.phone}</th>
              <th>{text.date}</th>
              <th>{text.value}</th>
              <th>{text.status}</th>
              <th>{text.tracking}</th>
              <th>{text.actions}</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => {
              const dispatched = isDispatched(order);
              const rowStatus = dispatched ? text.dispatchedStatus : text.pendingStatus;
              const orderDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                : '-';

              return (
                <tr key={order.id}>
                  <td>
                    <div className="shipping-order-cell">
                      <strong>#{getOrderNumber(order)}</strong>
                      <span>ID: {order.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="shipping-customer-cell">
                      <strong>{getCustomerName(order)}</strong>
                      <span>{order.shipping_provider || text.provider}</span>
                    </div>
                  </td>
                  <td dir="ltr" className="shipping-phone-cell">{order.customer_phone || text.noPhone}</td>
                  <td>{orderDate}</td>
                  <td className="shipping-value-cell">{formatCurrency(order.total, language, text.egp)}</td>
                  <td>
                    <span className={`shipping-status ${dispatched ? 'shipping-status-success' : 'shipping-status-pending'}`}>
                      {dispatched ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                      {rowStatus}
                    </span>
                  </td>
                  <td>
                    <div className="shipping-tracking-cell">
                      <strong>{order.tracking_number || text.noTracking}</strong>
                      {order.shipping_provider && <span>{order.shipping_provider}</span>}
                    </div>
                  </td>
                  <td>
                    {dispatched ? (
                      <button
                        type="button"
                        className="shipping-action-btn shipping-print-btn"
                        onClick={() => handlePrintLabel(order.shipping_label_url)}
                        disabled={!order.shipping_label_url}
                      >
                        <Printer size={16} />
                        {text.printLabel}
                      </button>
                    ) : (
                      <div className="shipping-action-group">
                        <button
                          type="button"
                          className="shipping-action-btn shipping-bosta-btn"
                          onClick={() => handleDispatch(order.id, 'Bosta')}
                          disabled={Boolean(dispatchingId)}
                        >
                          {dispatchingId === `${order.id}-Bosta` ? (
                            <>
                              <Loader2 className="shipping-spin" size={16} />
                              {text.dispatching}
                            </>
                          ) : (
                            <img src="/bosta-logo.png" alt="Bosta" style={{ height: '18px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="shipping-action-btn shipping-aramex-btn"
                          onClick={() => handleDispatch(order.id, 'Aramex')}
                          disabled={Boolean(dispatchingId)}
                        >
                          {dispatchingId === `${order.id}-Aramex` ? (
                            <>
                              <Loader2 className="shipping-spin" size={16} />
                              {text.dispatching}
                            </>
                          ) : (
                            <img src="/aramex-logo.png" alt="Aramex" style={{ height: '18px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleOrders.length === 0 && (
          <div className="shipping-empty">
            <PackageCheck size={38} />
            <p>{text.empty}</p>
          </div>
        )}
      </div>

      <style>{`
        .shipping-dashboard {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
          color: #0f172a;
          overflow: hidden;
        }

        .shipping-dashboard-loading {
          min-height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
        }

        .shipping-spin {
          animation: shippingSpin 1s linear infinite;
        }

        .shipping-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.4rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .shipping-title-block {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          min-width: 0;
        }

        .shipping-title-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e0f2fe;
          color: #0369a1;
          flex: 0 0 auto;
        }

        .shipping-title-block h2 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 0;
        }

        .shipping-title-block p {
          margin: 0.25rem 0 0;
          color: #64748b;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .shipping-refresh-btn,
        .shipping-action-btn,
        .shipping-segments button {
          border: 0;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          white-space: nowrap;
        }

        .shipping-refresh-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 42px;
          padding: 0 1rem;
          border-radius: 10px;
          background: #0f172a;
          color: white;
          font-weight: 850;
        }

        .shipping-refresh-btn:disabled,
        .shipping-action-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .shipping-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border-bottom: 1px solid #eef2f7;
        }

        .shipping-stat {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.3rem 0.65rem;
          align-items: center;
          padding: 0.95rem;
          border-radius: 12px;
          border: 1px solid transparent;
          min-height: 86px;
        }

        .shipping-stat span {
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .shipping-stat strong {
          grid-column: 1 / -1;
          font-size: 1.45rem;
          font-weight: 950;
          color: #0f172a;
          line-height: 1.1;
        }

        .shipping-stat-neutral {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #334155;
        }

        .shipping-stat-warning {
          background: #fffbeb;
          border-color: #fde68a;
          color: #b45309;
        }

        .shipping-stat-success {
          background: #ecfdf5;
          border-color: #bbf7d0;
          color: #047857;
        }

        .shipping-stat-money {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        .shipping-controls {
          display: flex;
          gap: 0.9rem;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .shipping-search {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-height: 44px;
          padding: 0 0.9rem;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          color: #64748b;
          background: #ffffff;
        }

        .shipping-search input {
          border: 0;
          outline: 0;
          width: 100%;
          font-family: inherit;
          font-weight: 700;
          color: #0f172a;
          background: transparent;
          min-width: 0;
        }

        .shipping-segments {
          display: inline-grid;
          grid-template-columns: repeat(3, minmax(105px, 1fr));
          gap: 0.25rem;
          padding: 0.25rem;
          background: #f1f5f9;
          border-radius: 12px;
        }

        .shipping-segments button {
          min-height: 36px;
          padding: 0 0.8rem;
          border-radius: 9px;
          color: #64748b;
          background: transparent;
          font-weight: 850;
        }

        .shipping-segments button.active {
          color: #0f172a;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.09);
        }

        .shipping-error {
          margin: 1rem 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          background: #fef2f2;
          color: #b91c1c;
          font-weight: 800;
          border: 1px solid #fecaca;
        }

        .shipping-table-wrap {
          overflow-x: auto;
          background: #ffffff;
        }

        .shipping-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 1080px;
        }

        .shipping-table th {
          padding: 0.9rem 1rem;
          text-align: start;
          color: #475569;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.78rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .shipping-table td {
          padding: 1rem;
          border-bottom: 1px solid #eef2f7;
          color: #334155;
          vertical-align: middle;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .shipping-table tbody tr:hover td {
          background: #f8fafc;
        }

        .shipping-order-cell,
        .shipping-customer-cell,
        .shipping-tracking-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .shipping-order-cell strong,
        .shipping-customer-cell strong,
        .shipping-tracking-cell strong,
        .shipping-value-cell {
          color: #0f172a;
          font-weight: 950;
        }

        .shipping-order-cell span,
        .shipping-customer-cell span,
        .shipping-tracking-cell span {
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .shipping-phone-cell {
          color: #475569;
          font-weight: 850;
        }

        .shipping-status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.42rem 0.65rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 900;
          border: 1px solid transparent;
        }

        .shipping-status-pending {
          background: #fffbeb;
          color: #b45309;
          border-color: #fde68a;
        }

        .shipping-status-success {
          background: #ecfdf5;
          color: #047857;
          border-color: #bbf7d0;
        }

        .shipping-action-group {
          display: grid;
          grid-template-columns: repeat(2, minmax(104px, 1fr));
          gap: 0.45rem;
        }

        .shipping-action-btn {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.42rem;
          padding: 0 0.8rem;
          border-radius: 10px;
          color: white;
          font-weight: 900;
          font-size: 0.84rem;
        }

        .shipping-action-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.13);
        }

        .shipping-bosta-btn {
          background: #7c3aed;
        }

        .shipping-aramex-btn {
          background: #e11d48;
        }

        .shipping-print-btn {
          background: #0f766e;
          min-width: 138px;
        }

        .shipping-empty {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          color: #94a3b8;
          font-weight: 850;
        }

        @keyframes shippingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .shipping-toolbar,
          .shipping-controls {
            align-items: stretch;
            flex-direction: column;
          }

          .shipping-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .shipping-segments {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .shipping-dashboard {
            border-radius: 14px;
          }

          .shipping-toolbar,
          .shipping-stats-grid,
          .shipping-controls {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .shipping-stats-grid {
            grid-template-columns: 1fr;
          }

          .shipping-segments {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
