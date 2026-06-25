import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  ShieldCheck,
  Truck,
  User,
  Phone,
  MapPin,
  Mail,
  Home,
  Tag,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  CreditCard,
  X,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTracker } from '../components/TrackingEngine';

const emptyForm = {
  name: '',
  phone: '',
  altPhone: '',
  governorate: '',
  city: '',
  address: '',
  apartment: '',
  landmark: '',
  email: '',
  notes: '',
  termsAccepted: false
};

const profileToForm = (profile = {}) => ({
  name: profile.name || '',
  phone: profile.phone || '',
  altPhone: profile.alt_phone || profile.altPhone || '',
  governorate: profile.governorate || '',
  city: profile.city || '',
  address: profile.address || '',
  apartment: profile.apartment || '',
  landmark: profile.landmark || '',
  email: profile.email || ''
});

const hasSavedDeliveryData = (profile = {}) => (
  Boolean(
    profile
    && (profile.phone || profile.alt_phone || profile.altPhone || profile.governorate || profile.city || profile.address || profile.apartment || profile.landmark)
  )
);

const mergeProfileIntoForm = (currentForm, profile, overwrite = false) => {
  const profileForm = profileToForm(profile);
  const nextForm = { ...currentForm };

  Object.entries(profileForm).forEach(([key, value]) => {
    if (!value) return;
    if (overwrite || !nextForm[key]) {
      nextForm[key] = value;
    }
  });

  return nextForm;
};

const buildCustomerProfilePayload = (orderForm) => ({
  name: orderForm.name,
  phone: orderForm.phone,
  alt_phone: orderForm.altPhone,
  governorate: orderForm.governorate,
  city: orderForm.city,
  address: orderForm.address,
  apartment: orderForm.apartment,
  landmark: orderForm.landmark
});

const CheckoutPage = ({ cartItems = [], clearCart, setCurrentPage, removeFromCart, updateCartQuantity, customerAuth, setCustomerAuth }) => {
  const [orderForm, setOrderForm] = useState(emptyForm);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shippingRates, setShippingRates] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [hasTrackedCheckout, setHasTrackedCheckout] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const [savedCustomerProfile, setSavedCustomerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { t, language } = useLanguage();
  const tracker = useTracker();

  const validCartItems = cartItems.filter(item => item && item.product);
  const totalItems = validCartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalPrice = validCartItems.reduce((sum, item) => sum + ((Number(item.currentPrice) || 0) * (Number(item.quantity) || 1)), 0);
  const selectedShipping = shippingRates.find(rate => rate.gov === orderForm.governorate);
  let shippingCost = selectedShipping ? Number(selectedShipping.price) : 0;
  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'free_shipping') {
      shippingCost = 0;
    } else if (appliedCoupon.type === 'percentage') {
      discountAmount = (totalPrice * Number(appliedCoupon.discount_value)) / 100;
    }
  }

  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);
  const money = (value) => `${Number(value || 0).toLocaleString('ar-EG')} ${t('checkout.currency')}`;
  const hasAccountDeliveryData = hasSavedDeliveryData(savedCustomerProfile);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (cartItems.length === 0 && checkoutStep !== 2) {
      setCurrentPage('store');
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.shipping_rates) {
          try {
            setShippingRates(JSON.parse(data.shipping_rates));
          } catch (e) {}
        }
      })
      .catch(console.error);
  }, [cartItems.length, checkoutStep, setCurrentPage]);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('customer_token');
    let localCustomer = customerAuth;

    if (!localCustomer) {
      try {
        const saved = localStorage.getItem('customer_data');
        localCustomer = saved ? JSON.parse(saved) : null;
      } catch (error) {
        localCustomer = null;
      }
    }

    if (localCustomer) {
      setSavedCustomerProfile(localCustomer);
      setOrderForm(prev => mergeProfileIntoForm(prev, localCustomer));
    }

    if (!token) return;

    setProfileLoading(true);
    fetch('/api/customer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.customer || cancelled) return;
        setSavedCustomerProfile(data.customer);
        setOrderForm(prev => mergeProfileIntoForm(prev, data.customer));
        localStorage.setItem('customer_data', JSON.stringify(data.customer));
        setCustomerAuth?.(data.customer);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerAuth?.id, setCustomerAuth]);

  useEffect(() => {
    if (!hasTrackedCheckout && validCartItems.length > 0 && checkoutStep === 1) {
      tracker.trackInitiateCheckout(validCartItems, totalPrice);
      setHasTrackedCheckout(true);
    }
  }, [validCartItems, hasTrackedCheckout, totalPrice, checkoutStep, tracker]);

  const updateForm = (key, value) => setOrderForm(prev => ({ ...prev, [key]: value }));
  const applySavedProfile = () => {
    if (!savedCustomerProfile) return;
    setOrderForm(prev => mergeProfileIntoForm(prev, savedCustomerProfile, true));
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponMsg({ text: t('checkout.couponApplied'), type: 'success' });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ text: data.error || t('checkout.couponInvalid'), type: 'error' });
      }
    } catch (e) {
      setCouponMsg({ text: t('checkout.couponError'), type: 'error' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleOrderSubmit = (event) => {
    event.preventDefault();
    setErrorMsg('');
    setCreatedOrderId(null);

    if (!orderForm.name.trim()) {
      setErrorMsg(t('checkoutNew.firstNameRequired'));
      return;
    }

    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(orderForm.phone)) {
      setErrorMsg(t('checkout.validationPhone'));
      return;
    }

    if (orderForm.altPhone && !egPhoneRegex.test(orderForm.altPhone)) {
      setErrorMsg(t('checkout.validationAltPhone'));
      return;
    }

    if (!orderForm.termsAccepted) {
      setErrorMsg(t('checkout.validationTerms') || 'يجب الموافقة على الشروط والأحكام أولاً');
      return;
    }

    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    setConfirmLoading(true);

    const addressDetails = [
      orderForm.governorate,
      orderForm.city ? `المدينة: ${orderForm.city}` : '',
      `الشارع: ${orderForm.address}`,
      orderForm.apartment ? `شقة/وحدة: ${orderForm.apartment}` : '',
      orderForm.landmark ? `علامة مميزة: ${orderForm.landmark}` : ''
    ].filter(Boolean).join(' - ');

    const emailStr = orderForm.email ? ` | الايميل: ${orderForm.email}` : '';
    const notesStr = orderForm.notes ? ` | الملاحظات: ${orderForm.notes}` : '';
    const orderData = {
      customer_name: `${orderForm.name} | ${orderForm.phone} ${orderForm.altPhone ? `(Alt: ${orderForm.altPhone})` : ''} | ${addressDetails}${emailStr}${notesStr}`,
      customer_phone: orderForm.phone,
      total: finalTotal,
      products: validCartItems.map(item => ({
        id: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        variantName: item.variantName,
        variantLabel: item.variantLabel || item.variantName,
        price: item.currentPrice
      })),
      coupon_id: appliedCoupon ? appliedCoupon.id : null,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      customer_profile: buildCustomerProfilePayload(orderForm)
    };

    try {
      const token = localStorage.getItem('customer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });
      const data = await res.json();

      if (res.ok) {
        if (data.customer) {
          setSavedCustomerProfile(data.customer);
          setCustomerAuth?.(data.customer);
          localStorage.setItem('customer_data', JSON.stringify(data.customer));
        }
        tracker.trackPurchase({
          id: data.orderId || data.id,
          total: finalTotal,
          products: validCartItems.map(item => ({ id: item.product.id, price: item.currentPrice, quantity: item.quantity })),
          email: orderForm.email,
          phone: orderForm.phone
        });
        setCreatedOrderId(data.orderId || data.id);
        setShowConfirm(false);
        setCheckoutStep(2);
        clearCart();
        setOrderForm(emptyForm);
        setAppliedCoupon(null);
        setCouponCodeInput('');
        window.scrollTo(0, 0);
      } else {
        setShowConfirm(false);
        setErrorMsg(data.error || t('checkout.errorSubmit'));
      }
    } catch (err) {
      setShowConfirm(false);
      setErrorMsg(t('checkout.errorConnection'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const CartItem = ({ item, index, compact = false }) => (
    <div className={`checkout-order-item ${compact ? 'compact' : ''}`}>
      <div className="checkout-order-image">
        <img src={item.selectedImage || item.product.image || 'https://via.placeholder.com/90'} alt={item.product.title} />
      </div>
      <div className="checkout-order-copy">
        <strong>{item.product.title}</strong>
        {item.variantName && <span>{item.variantLabel || item.variantName}</span>}
        {compact && <span>{t('checkoutNew.quantity')}: {item.quantity || 1}</span>}
        {!compact && (
          <div className="checkout-qty-control">
            <button type="button" onClick={() => updateCartQuantity?.(index, -1)} aria-label={t('checkoutNew.decrease')}>
              <Minus size={15} />
            </button>
            <span>{item.quantity || 1}</span>
            <button type="button" onClick={() => updateCartQuantity?.(index, 1)} aria-label={t('checkoutNew.increase')}>
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="checkout-order-side">
        {!compact && (
          <button type="button" className="checkout-remove-item" onClick={() => removeFromCart?.(index)} title={t('checkoutNew.remove')}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );

  if (checkoutStep === 2) {
    return (
      <main className="checkout-page checkout-success-page">
        <section className="checkout-success-card">
          <span className="checkout-success-icon"><CheckCircle size={74} /></span>
          <h1>{t('checkout.successHeading')}</h1>
          <p>{t('checkout.successDesc')}</p>
          {createdOrderId && (
            <div className="checkout-success-order-id" style={{ marginTop: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem' }}>{t('checkoutNew.trackingId')}</span>
              <strong style={{ fontSize: '1.4rem', color: '#0f172a', letterSpacing: '2px' }}>{createdOrderId}</strong>
            </div>
          )}
          <button className="checkout-primary-action" onClick={() => setCurrentPage('store')}>
            {t('checkout.successContinue')}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <header className="checkout-heading">
          <span><ShieldCheck size={18} /> {t('checkoutNew.secureBadge')}</span>
          <h1>{t('checkout.stepFormTitle')}</h1>
          <p>{t('checkoutNew.intro')}</p>
        </header>

        {errorMsg && (
          <div className="checkout-error" role="alert">
            <X size={18} />
            {errorMsg}
          </div>
        )}

        <div className="checkout-modern-layout">
          <section className="checkout-details-panel">
            <form id="checkout-form" onSubmit={handleOrderSubmit} className="checkout-form">
              <div className="checkout-panel-title">
                <User size={20} />
                <div>
                  <h2>{t('checkoutNew.customerTitle')}</h2>
                  <p>{t('checkoutNew.customerDesc')}</p>
                </div>
              </div>

              {savedCustomerProfile && (
                <div className={`checkout-saved-address ${hasAccountDeliveryData ? 'ready' : 'empty'}`}>
                  <div>
                    <strong>{t(hasAccountDeliveryData ? 'checkoutNew.savedReady' : 'checkoutNew.savedEmpty')}</strong>
                    <span>
                      {profileLoading
                        ? t('checkoutNew.savedLoading')
                        : hasAccountDeliveryData
                          ? t('checkoutNew.savedFilled')
                          : t('checkoutNew.savedHint')}
                    </span>
                  </div>
                  {hasAccountDeliveryData && (
                    <button type="button" onClick={applySavedProfile} disabled={profileLoading}>
                      {t('checkoutNew.useSaved')}
                    </button>
                  )}
                </div>
              )}

              <label className="checkout-field full">
                <span>{t('checkout.formFullName')}</span>
                <div>
                  <User size={18} />
                  <input type="text" required placeholder={t('checkoutNew.namePlaceholder')} value={orderForm.name} onChange={event => updateForm('name', event.target.value)} />
                </div>
              </label>

              <div className="checkout-two-cols">
                <label className="checkout-field">
                  <span>{t('checkout.formPrimaryPhone')}</span>
                  <div>
                    <Phone size={18} />
                    <input type="tel" required placeholder="010XXXXXXXX" value={orderForm.phone} onChange={event => updateForm('phone', event.target.value)} dir="ltr" />
                  </div>
                </label>
                <label className="checkout-field">
                  <span>{t('checkout.formAltPhone')}</span>
                  <div>
                    <Phone size={18} />
                    <input type="tel" placeholder={t('checkoutNew.optional')} value={orderForm.altPhone} onChange={event => updateForm('altPhone', event.target.value)} dir="ltr" />
                  </div>
                </label>
              </div>

              <div className="checkout-panel-title spacing">
                <MapPin size={20} />
                <div>
                  <h2>{t('checkout.shippingInfoTitle')}</h2>
                  <p>{t('checkoutNew.shippingHint')}</p>
                </div>
              </div>

              <div className="checkout-two-cols">
                <label className="checkout-field">
                  <span>{t('checkout.formGovernorate') || 'المحافظة'}</span>
                  <div>
                    <MapPin size={18} />
                    <select required value={orderForm.governorate} onChange={event => updateForm('governorate', event.target.value)}>
                      <option value="" disabled>{t('checkout.formSelectGov')}</option>
                      {shippingRates.length > 0 ? shippingRates.map((rate, index) => (
                        <option key={index} value={rate.gov}>{rate.gov} {Number(rate.price) > 0 ? `(+${rate.price} ${t('checkout.currency')})` : ''}</option>
                      )) : (
                        <>
                          <option value="الإسكندرية">الإسكندرية</option>
                          <option value="القاهرة">القاهرة</option>
                        </>
                      )}
                    </select>
                  </div>
                </label>
                <label className="checkout-field">
                  <span>{t('checkout.formCity')}</span>
                  <div>
                    <Home size={18} />
                    <input type="text" required placeholder={t('checkoutNew.cityPlaceholder')} value={orderForm.city} onChange={event => updateForm('city', event.target.value)} />
                  </div>
                </label>
              </div>

              <label className="checkout-field full">
                <span>{t('checkout.formStreet')}</span>
                <div>
                  <MapPin size={18} />
                  <input type="text" required placeholder={t('checkoutNew.streetPlaceholder')} value={orderForm.address} onChange={event => updateForm('address', event.target.value)} />
                </div>
              </label>

              <div className="checkout-two-cols">
                <label className="checkout-field">
                  <span>{t('checkout.formApartment')}</span>
                  <div>
                    <Home size={18} />
                    <input type="text" required placeholder={t('checkoutNew.apartmentPlaceholder')} value={orderForm.apartment} onChange={event => updateForm('apartment', event.target.value)} />
                  </div>
                </label>
                <label className="checkout-field">
                  <span>{t('checkout.formLandmark')}</span>
                  <div>
                    <MapPin size={18} />
                    <input type="text" required placeholder={t('checkout.formLandmarkPlaceholder')} value={orderForm.landmark} onChange={event => updateForm('landmark', event.target.value)} />
                  </div>
                </label>
              </div>

              <label className="checkout-field full">
                <span>{t('checkout.formEmail')}</span>
                <div>
                  <Mail size={18} />
                  <input type="email" placeholder={t('checkoutNew.optional')} value={orderForm.email} onChange={event => updateForm('email', event.target.value)} dir="ltr" />
                </div>
              </label>

              <label className="checkout-field full">
                <span>{t('checkout.formNotes') || 'ملاحظات الطلب (اختياري)'}</span>
                <div style={{alignItems: 'flex-start', padding: '0.8rem 1rem', width: '100%'}}>
                  <textarea 
                    placeholder={t('checkout.formNotesPlaceholder') || 'ملاحظات حول الطلب، مثال: ملحوظة خاصة بتسليم الطلب.'} 
                    value={orderForm.notes} 
                    onChange={event => updateForm('notes', event.target.value)} 
                    rows="5" 
                    style={{width: '100%', minHeight: '130px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem'}}
                  />
                </div>
              </label>

              <label className="checkout-terms">
                <input type="checkbox" required checked={orderForm.termsAccepted} onChange={event => updateForm('termsAccepted', event.target.checked)} />
                <span>{t('checkoutNew.termsPrefix')} <button type="button" onClick={() => { setCurrentPage('policy'); window.scrollTo(0, 0); }}>{t('checkoutNew.termsLink')}</button></span>
              </label>
            </form>
          </section>

          <aside className="checkout-order-panel">
            <div className="checkout-panel-title">
              <ShoppingBag size={20} />
              <div>
                <h2>{t('checkout.summaryTitle', { count: totalItems })}</h2>
                <p>{t('checkoutNew.summaryHint')}</p>
              </div>
            </div>

            <div className="checkout-products-box">
              {validCartItems.map((item, index) => (
                <CartItem key={`${item.product.id}-${index}`} item={item} index={index} />
              ))}
            </div>

            <div className="checkout-coupon-box">
              <label>
                <Tag size={17} />
                {t('checkout.couponLabel')}
              </label>
              <div className="checkout-coupon-row">
                <input type="text" value={couponCodeInput} onChange={event => setCouponCodeInput(event.target.value.toUpperCase())} placeholder={t('checkout.couponPlaceholder')} disabled={appliedCoupon !== null} />
                {appliedCoupon ? (
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponMsg({ text: '', type: '' }); setCouponCodeInput(''); }}>{t('checkout.couponCancel')}</button>
                ) : (
                  <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCodeInput}>
                    {couponLoading ? '...' : t('checkout.couponApply')}
                  </button>
                )}
              </div>
              {couponMsg.text && <p className={couponMsg.type}>{couponMsg.text}</p>}
            </div>

            <div className="checkout-totals-box">
              <div><span>{t('checkout.summarySubtotal')}</span><b>{money(totalPrice)}</b></div>
              {discountAmount > 0 && <div className="discount"><span>{t('checkout.summaryDiscount', { value: appliedCoupon.discount_value })}</span><b>-{money(discountAmount)}</b></div>}
              <div><span>{t('checkout.summaryShipping')}</span><b>{orderForm.governorate ? money(shippingCost) : t('checkout.summaryCalculatedLater')}</b></div>
              <div className="grand"><span>{t('checkout.summaryGrandTotal')}</span><b>{money(finalTotal)}</b></div>
            </div>

            <div className="checkout-payment-note">
              <CreditCard size={18} />
              <span>{t('checkout.paymentMethodCash')}</span>
            </div>

            <button type="submit" form="checkout-form" className="checkout-primary-action">
              <ShieldCheck size={20} />
              {t('checkout.formSubmit')}
            </button>
          </aside>
        </div>
      </div>

      {/* SEO Article Section */}
      <section className="checkout-seo-article" aria-label="مقال تعريفي عن شتلات البونيكام البرازيلي">
        <div className="checkout-seo-container">


          <h2 className="checkout-seo-title">
            شتلات البونيكام البرازيلي الأصلي
            <span className="checkout-seo-title-accent"> من شركة الرحاب للتنمية الزراعية</span>
          </h2>

          <p className="checkout-seo-lead">
            تُعد <strong>شركة الرحاب للتنمية الزراعية</strong> من الشركات المتخصصة في توفير <strong>شتلات البونيكام البرازيلي الأصلي</strong> بجودة عالية، لتلبية احتياجات المربين والمزارعين الباحثين عن مصدر علف قوي وآمن يساعد على تحسين التغذية وتقليل التكاليف.
          </p>

          <div className="checkout-seo-grid">

            <div className="checkout-seo-card">
              <div className="checkout-seo-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>ما هو البونيكام البرازيلي؟</h3>
              <p>البونيكام البرازيلي هو أحد أنواع الأعلاف الخضراء المميزة، يُستخدم بشكل واسع في تغذية المواشي مثل الأبقار والجاموس والأغنام والماعز. يتميز بسرعة النمو وكثافة الإنتاج، مما يجعله الاختيار الأمثل للمربين الباحثين عن علف طبيعي واقتصادي طوال الموسم.</p>
            </div>

            <div className="checkout-seo-card">
              <div className="checkout-seo-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>مميزات شتلات البونيكام من شركة الرحاب</h3>
              <ul className="checkout-seo-list">
                <li>شتلات بونيكام برازيلي أصلي بجودة عالية</li>
                <li>متابعة هندسية قبل الزراعة</li>
                <li>دعم وإرشاد بعد الزراعة</li>
                <li>توصيل لجميع المحافظات</li>
                <li>شتلات قوية تضمن إنتاجًا مثمرًا بإذن الله</li>
              </ul>
            </div>

            <div className="checkout-seo-card">
              <div className="checkout-seo-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3>لماذا يختار المربون زراعة البونيكام؟</h3>
              <ul className="checkout-seo-list">
                <li>علف آمن ومناسب لجميع أنواع المواشي</li>
                <li>إنتاج كثيف من العلف الأخضر</li>
                <li>تقليل الاعتماد على الأعلاف المكلفة</li>
                <li>مشروع زراعي مثالي للتربية والإنتاج الحيواني</li>
              </ul>
            </div>

          </div>

          <div className="checkout-seo-support-row">
            <div className="checkout-seo-support-card">
              <div className="checkout-seo-support-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h3>دعم فني قبل وبعد الزراعة</h3>
                <p>لا تقتصر خدماتنا على بيع الشتلات فقط، بل نوفر متابعة وإرشاد للمزارع قبل الزراعة، مع تقديم الدعم الفني بعد الزراعة لضمان أفضل نتيجة ممكنة. فريقنا يساعدك في معرفة الطريقة المناسبة للزراعة والاهتمام بالشتلات للحصول على إنتاج قوي.</p>
              </div>
            </div>
            <div className="checkout-seo-support-card">
              <div className="checkout-seo-support-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <h3>توصيل شتلات البونيكام لكل المحافظات</h3>
                <p>توفر شركة الرحاب للتنمية الزراعية خدمة توصيل شتلات البونيكام البرازيلي إلى جميع المحافظات، لتسهيل حصول المزارعين والمربين على الشتلات بكل سهولة أينما كانوا في مصر.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {showConfirm && (
        <div className="checkout-confirm-overlay">
          <section className="checkout-confirm-dialog">
            <button type="button" className="checkout-confirm-close" onClick={() => setShowConfirm(false)} disabled={confirmLoading}>
              <X size={20} />
            </button>
            <span className="checkout-confirm-icon"><ShieldCheck size={42} /></span>
            <h2>{t('checkout.confirmTitle')}</h2>
            <p>{t('checkout.confirmAsk')}</p>
            <div className="checkout-confirm-summary">
              <div><span>{t('checkoutNew.confirmCustomer')}</span><b>{orderForm.name}</b></div>
              <div><span>{t('checkoutNew.confirmPhone')}</span><b dir="ltr">{orderForm.phone}</b></div>
              <div><span>{t('checkoutNew.confirmGovernorate')}</span><b>{orderForm.governorate}</b></div>
              <div><span>{t('checkoutNew.confirmTotal')}</span><b style={{ color: '#ffbc01', fontSize: '1.35rem', fontWeight: '900' }}>{money(finalTotal)}</b></div>
            </div>
            <div className="checkout-confirm-products">
              {validCartItems.map((item, index) => (
                <CartItem key={`${item.product.id}-${index}`} item={item} index={index} compact />
              ))}
            </div>
            <div className="checkout-confirm-actions">
              <button type="button" onClick={confirmOrder} disabled={confirmLoading} className="checkout-primary-action">
                {confirmLoading ? <Loader2 className="spin" size={20} /> : <CheckCircle size={20} />}
                {confirmLoading ? t('checkout.confirmLoading') : t('checkout.confirmSubmit')}
              </button>
              {!confirmLoading && <button type="button" className="checkout-secondary-action" onClick={() => setShowConfirm(false)}>{t('checkout.confirmCancel')}</button>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CheckoutPage;
