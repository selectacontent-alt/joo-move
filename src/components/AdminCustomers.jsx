import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Mail, MapPin, MessageCircle, Phone, Package, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const formatDate = (value, language) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
};

const getCustomerAddress = (customer) => {
  const parts = [
    customer.governorate,
    customer.city,
    customer.address,
    customer.apartment ? `شقة/وحدة: ${customer.apartment}` : '',
    customer.landmark ? `علامة: ${customer.landmark}` : ''
  ].filter(Boolean);

  return parts.join(' - ');
};

const AdminCustomers = () => {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/customers')
      .then(async res => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch customers');
        return data;
      })
      .then(data => {
        if (!cancelled) {
          setCustomers(Array.isArray(data) ? data : []);
          setError('');
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => ({
    customers: customers.length,
    withPhone: customers.filter(customer => customer.phone).length,
    withAddress: customers.filter(customer => getCustomerAddress(customer)).length
  }), [customers]);

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank');
  };

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-header">
        <div className="admin-customers-title">
          <span><Users size={26} /></span>
          <div>
            <h2>{language === 'ar' ? 'العملاء المسجلين' : 'Registered Customers'}</h2>
            <p>{language === 'ar' ? 'بيانات الحساب والعنوان المحفوظة من التشيك أوت' : 'Account and saved checkout delivery data'}</p>
          </div>
        </div>
        <div className="admin-customers-stats">
          <div><strong>{stats.customers}</strong><span>{language === 'ar' ? 'عميل' : 'Customers'}</span></div>
          <div><strong>{stats.withPhone}</strong><span>{language === 'ar' ? 'بأرقام' : 'Phones'}</span></div>
          <div><strong>{stats.withAddress}</strong><span>{language === 'ar' ? 'بعناوين' : 'Addresses'}</span></div>
        </div>
      </div>

      {loading ? (
        <div className="admin-customers-empty">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : error ? (
        <div className="admin-customers-empty error">
          {language === 'ar' ? 'تعذر تحميل العملاء' : 'Could not load customers'}
        </div>
      ) : customers.length === 0 ? (
        <div className="admin-customers-empty">
          <Users size={54} />
          <h3>{language === 'ar' ? 'لا يوجد عملاء مسجلين حتى الآن' : 'No customers registered yet'}</h3>
        </div>
      ) : (
        <div className="admin-customers-table-wrap">
          <table className="admin-table admin-customers-table">
            <thead>
              <tr>
                <th>{language === 'ar' ? 'العميل' : 'Customer'}</th>
                <th>{language === 'ar' ? 'البريد' : 'Email'}</th>
                <th>{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                <th>{language === 'ar' ? 'العنوان' : 'Address'}</th>
                <th>{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                <th>{language === 'ar' ? 'آخر تحديث' : 'Updated'}</th>
                <th>{language === 'ar' ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const address = getCustomerAddress(customer);

                return (
                  <tr key={customer.id}>
                    <td>
                      <div className="admin-customer-main-cell">
                        <span className="admin-customer-avatar">{customer.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        <div>
                          <strong>{customer.name || '---'}</strong>
                          <small><CalendarDays size={13} /> {formatDate(customer.created_at, language)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a className="admin-customer-link" href={`mailto:${customer.email}`}>
                        <Mail size={15} />
                        <span>{customer.email}</span>
                      </a>
                    </td>
                    <td>
                      {customer.phone ? (
                        <div className="admin-customer-phone" dir="ltr">
                          <Phone size={15} />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="admin-customer-muted">---</span>
                      )}
                      {customer.alt_phone && <small className="admin-customer-alt-phone" dir="ltr">{customer.alt_phone}</small>}
                    </td>
                    <td>
                      {address ? (
                        <div className="admin-customer-address" title={address}>
                          <MapPin size={15} />
                          <span>{address}</span>
                        </div>
                      ) : (
                        <span className="admin-customer-muted">{language === 'ar' ? 'لم يضف عنواناً' : 'No address'}</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-customer-orders">
                        <Package size={15} />
                        {Number(customer.order_count) || 0}
                      </span>
                      {customer.last_order_at && <small className="admin-customer-last-order">{formatDate(customer.last_order_at, language)}</small>}
                    </td>
                    <td>{formatDate(customer.updated_at || customer.created_at, language)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-customer-whatsapp"
                        onClick={() => openWhatsApp(customer.phone)}
                        disabled={!customer.phone}
                        title={language === 'ar' ? 'فتح واتساب' : 'Open WhatsApp'}
                      >
                        <MessageCircle size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
