import React, { useState, useEffect } from 'react';
import { Package, MapPin, Phone, Calendar, Clock, ChevronDown, CheckCircle, Clock3, RotateCcw, Truck, FileText, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FulfillmentPage = ({ setCurrentPage }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError('خطأ في جلب الطلبات');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusConfig = (status) => {
    if (status === t('admin.statusDelivered')) return { icon: <CheckCircle size={18} />, color: '#166534', bg: '#dcfce7', border: '#bbf7d0', label: 'تم التوصيل' };
    if (status === t('admin.statusShipped')) return { icon: <Truck size={18} />, color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe', label: 'تم الشحن' };
    if (status === t('admin.statusReviewing')) return { icon: <FileText size={18} />, color: '#854d0e', bg: '#fef9c3', border: '#fef08a', label: 'جاري المراجعة' };
    if (status === t('admin.statusCancelled')) return { icon: <RotateCcw size={18} />, color: '#991b1b', bg: '#fef2f2', border: '#fecaca', label: 'ملغي' };
    return { icon: <Clock3 size={18} />, color: '#c2410c', bg: '#fff7ed', border: '#ffedd5', label: 'قيد الانتظار' };
  };

  const extractCustomerInfo = (customerNameStr) => {
    const parts = (customerNameStr || '').split('|').map(p => p.trim());
    return {
      name: parts[0] || 'غير معروف',
      phone: parts[1] || '',
      address: parts[2] || '',
      notes: parts[3] ? parts[3].replace('الملاحظات:', '').trim() : ''
    };
  };

  const availableStatuses = [
    t('admin.statusPending'), 
    t('admin.statusReviewing'), 
    t('admin.statusShipped'), 
    t('admin.statusDelivered'), 
    t('admin.statusCancelled')
  ];

  if (loading) return <div className="ff-loading">جاري تحميل الطلبات...</div>;

  return (
    <div className="ff-container">
      <div className="ff-header">
        <div className="ff-header-content">
          <h1><Package size={28} /> استقبال وإدارة الطلبات</h1>
          <button onClick={() => setCurrentPage('admin')} className="ff-btn-back">
            العودة للوحة التحكم
          </button>
        </div>
      </div>

      <div className="ff-content">
        {error && <div className="ff-error">{error}</div>}
        
        <div className="ff-grid">
          {orders.map(order => {
            const info = extractCustomerInfo(order.customer_name);
            const statusConfig = getStatusConfig(order.status || t('admin.statusPending'));
            let parsedProducts = [];
            try { parsedProducts = typeof order.products === 'string' ? JSON.parse(order.products) : order.products; } catch (e) {}

            return (
              <div key={order.id} className="ff-card">
                <div className="ff-card-header">
                  <div className="ff-order-id">#{order.order_number}</div>
                  <div className="ff-order-date">
                    <Clock size={14} /> {new Date(order.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="ff-customer-info">
                  <h3 className="ff-name">{info.name}</h3>
                  {info.phone && (
                    <a href={`tel:${info.phone}`} className="ff-info-row ff-clickable">
                      <Phone size={16} /> <span dir="ltr">{info.phone}</span>
                    </a>
                  )}
                  {info.address && (
                    <div className="ff-info-row">
                      <MapPin size={16} /> <span>{info.address}</span>
                    </div>
                  )}
                  {order.customer_phone && order.customer_phone !== info.phone && (
                     <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="ff-info-row ff-clickable ff-wa">
                       <Phone size={16} /> <span dir="ltr">واتساب: {order.customer_phone}</span>
                     </a>
                  )}
                </div>

                <div className="ff-products">
                  <h4>المنتجات المطلوبة</h4>
                  <ul>
                    {Array.isArray(parsedProducts) && parsedProducts.map((p, idx) => (
                      <li key={idx}>
                        <span className="ff-qty">{p.quantity}x</span> {p.title || 'منتج'} {p.variantName ? `(${p.variantName})` : ''}
                      </li>
                    ))}
                    {!Array.isArray(parsedProducts) && parsedProducts && typeof parsedProducts === 'object' && parsedProducts.type === 'booking' && (
                      <li style={{ display: 'block' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="ff-qty">{parsedProducts.quantity} {parsedProducts.unit_type === 'feddan' ? 'فدان' : 'قيراط'}</span> 
                          <span>تجهيز شتلات بونيكام</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', paddingRight: '0.5rem' }}>
                          إجمالي: {parsedProducts.totalQirat} قيراط، {parsedProducts.totalTrays} صينية
                        </div>
                      </li>
                    )}
                    {!Array.isArray(parsedProducts) && parsedProducts && typeof parsedProducts === 'object' && parsedProducts.type !== 'booking' && (
                      <li><span className="ff-qty">{parsedProducts.quantity || 1}x</span> {parsedProducts.title || 'منتج'}</li>
                    )}
                  </ul>
                </div>

                <div className="ff-footer">
                  <div className="ff-total">الإجمالي: <span>{Number(order.total).toLocaleString()} ج.م</span></div>
                  
                  <div className="ff-status-wrapper">
                    <select
                      value={order.status || t('admin.statusPending')}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="ff-status-select"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        borderColor: statusConfig.border
                      }}
                    >
                      {availableStatuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {updatingId === order.id ? (
                      <div className="ff-updating-spinner"></div>
                    ) : (
                      <ChevronDown size={16} className="ff-status-icon" style={{ color: statusConfig.color }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {orders.length === 0 && !loading && (
            <div className="ff-empty">لا توجد طلبات حالياً</div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .ff-container {
          min-height: 100vh;
          background: #f8fafc;
          direction: rtl;
          font-family: inherit;
        }
        
        .ff-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .ff-header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ff-header h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
        }
        
        .ff-btn-back {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .ff-btn-back:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        
        .ff-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        
        .ff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        
        .ff-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          transition: transform 0.2s;
        }
        
        .ff-card:hover {
          transform: translateY(-3px);
          border-color: #e2e8f0;
        }
        
        .ff-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.8rem;
        }
        
        .ff-order-id {
          font-weight: 800;
          color: #0f172a;
          font-size: 1.1rem;
          background: #f8fafc;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        
        .ff-order-date {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .ff-customer-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .ff-name {
          margin: 0 0 0.2rem 0;
          font-size: 1.15rem;
          color: #0f172a;
          font-weight: 700;
        }
        
        .ff-info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
          font-size: 0.9rem;
          text-decoration: none;
        }
        
        .ff-clickable {
          color: #0284c7;
        }
        
        .ff-clickable:hover {
          text-decoration: underline;
        }
        
        .ff-wa {
          color: #16a34a;
        }
        
        .ff-products {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 10px;
        }
        
        .ff-products h4 {
          margin: 0 0 0.8rem 0;
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .ff-products ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .ff-products li {
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 600;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.4;
        }
        
        .ff-qty {
          background: #e2e8f0;
          color: #334155;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 800;
        }
        
        .ff-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        
        .ff-total {
          font-size: 0.9rem;
          color: #64748b;
        }
        
        .ff-total span {
          display: block;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }
        
        .ff-status-wrapper {
          position: relative;
        }
        
        .ff-status-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 0.6rem 1rem 0.6rem 2.2rem;
          border-radius: 20px;
          border: 1px solid;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
          min-width: 130px;
          font-family: inherit;
        }
        
        .ff-status-select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .ff-status-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        
        .ff-updating-spinner {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          border: 2px solid;
          border-right-color: transparent !important;
          border-radius: 50%;
          animation: ff-spin 0.8s linear infinite;
        }
        
        @keyframes ff-spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
        
        .ff-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          color: #64748b;
          font-weight: 700;
        }
        
        .ff-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 16px;
          color: #94a3b8;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .ff-header h1 {
            font-size: 1.2rem;
          }
          .ff-btn-back {
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
          }
          .ff-content {
            padding: 1.5rem 1rem;
          }
          .ff-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FulfillmentPage;
