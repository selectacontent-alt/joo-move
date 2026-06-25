import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CustomerAuthPage = ({ setCurrentPage, setCustomerAuth }) => {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/customer/auth/login' : '/api/customer/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || t(isLogin ? 'customerAuth.loginFailed' : 'customerAuth.registerFailed'));
      }

      setSuccess(t(isLogin ? 'customerAuth.loginSuccess' : 'customerAuth.registerSuccess'));
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_data', JSON.stringify(data.customer));
      
      setTimeout(() => {
        setCustomerAuth(data.customer);
        setCurrentPage('account');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-auth-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '3rem 1rem', 
      background: '#fdfbf7', // Premium light cream background
      position: 'relative',
      overflow: 'hidden',
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {/* Elegant Gold Ambient Background Blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(253,251,247,0) 70%)', filter: 'blur(60px)', animation: 'pulse-slow 15s ease-in-out infinite alternate', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(181,133,0,0.1) 0%, rgba(253,251,247,0) 70%)', filter: 'blur(60px)', animation: 'pulse-slow 20s ease-in-out infinite alternate-reverse', zIndex: 0 }}></div>

      <div className="auth-card" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: '#ffffff', 
        borderRadius: '32px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(212,175,55,0.1)', 
        position: 'relative',
        zIndex: 10,
        padding: '3.5rem 2.5rem',
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #d4af37 0%, #b58500 100%)', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 15px 30px rgba(212, 175, 55, 0.3)',
            transform: 'rotate(-5deg)',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'}
          >
            <ShoppingBag size={36} color="white" style={{ transform: 'rotate(5deg)' }} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#111111', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
            {t(isLogin ? 'customerAuth.loginTitle' : 'customerAuth.registerTitle')}
          </h2>
          <p style={{ margin: 0, color: '#666666', fontSize: '1.05rem', lineHeight: '1.6' }}>
            {isLogin 
              ? t('customerAuth.loginSubtitle')
              : t('customerAuth.registerSubtitle')}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem 1.2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', border: '1px solid #fecaca', animation: 'shake 0.5s' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '1rem 1.2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
            <CheckCircle size={20} /> {success}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: language === 'ar' ? '1.2rem' : 'auto', left: language === 'ar' ? 'auto' : '1.2rem', color: '#a1a1aa', transition: 'color 0.3s' }} className="input-icon">
                <User size={20} />
              </div>
              <input 
                type="text" 
                name="name"
                placeholder={t('customerAuth.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="auth-input"
                style={{ width: '100%', padding: '1.2rem 3rem', borderRadius: '16px', border: '1.5px solid #f4f4f5', background: '#fafafa', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s', color: '#111111', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = '#d4af37'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; e.target.previousSibling.style.color = '#d4af37'; }}
                onBlur={(e) => { e.target.style.borderColor = '#f4f4f5'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.color = '#a1a1aa'; }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: language === 'ar' ? '1.2rem' : 'auto', left: language === 'ar' ? 'auto' : '1.2rem', color: '#a1a1aa', transition: 'color 0.3s' }} className="input-icon">
              <Mail size={20} />
            </div>
            <input 
              type="email" 
              name="email"
              placeholder={t('customerAuth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
              style={{ width: '100%', padding: '1.2rem 3rem', borderRadius: '16px', border: '1.5px solid #f4f4f5', background: '#fafafa', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s', color: '#111111', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#d4af37'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; e.target.previousSibling.style.color = '#d4af37'; }}
              onBlur={(e) => { e.target.style.borderColor = '#f4f4f5'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.color = '#a1a1aa'; }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: language === 'ar' ? '1.2rem' : 'auto', left: language === 'ar' ? 'auto' : '1.2rem', color: '#a1a1aa', transition: 'color 0.3s' }} className="input-icon">
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              name="password"
              placeholder={t('customerAuth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              style={{ width: '100%', padding: '1.2rem 3rem', borderRadius: '16px', border: '1.5px solid #f4f4f5', background: '#fafafa', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s', color: '#111111', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#d4af37'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; e.target.previousSibling.style.color = '#d4af37'; }}
              onBlur={(e) => { e.target.style.borderColor = '#f4f4f5'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.color = '#a1a1aa'; }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              background: 'linear-gradient(135deg, #d4af37 0%, #b58500 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '1.2rem', 
              fontWeight: '800', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginTop: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.8rem', 
              opacity: loading ? 0.8 : 1, 
              transition: 'all 0.3s ease', 
              boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)' 
            }}
            onMouseEnter={(e) => { if(!loading) { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 30px rgba(212, 175, 55, 0.4)'; } }}
            onMouseLeave={(e) => { if(!loading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.3)'; } }}
          >
            {loading ? t('customerAuth.loading') : t(isLogin ? 'customerAuth.signIn' : 'customerAuth.register')}
            {!loading && <ArrowRight size={24} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #f4f4f5' }}>
          <p style={{ color: '#666666', fontSize: '1.05rem', margin: 0 }}>
            {t(isLogin ? 'customerAuth.noAccount' : 'customerAuth.hasAccount')}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: '#d4af37', fontWeight: '800', cursor: 'pointer', margin: '0 0.5rem', fontSize: '1.05rem', padding: '0.5rem 1rem', borderRadius: '10px', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(212, 175, 55, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'none'; }}
            >
              {t(isLogin ? 'customerAuth.registerNow' : 'customerAuth.signIn')}
            </button>
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-input::placeholder {
          color: #a1a1aa;
        }
      `}} />
    </div>
  );
};

export default CustomerAuthPage;
