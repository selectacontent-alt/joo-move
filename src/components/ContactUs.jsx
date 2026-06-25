import React, { useState } from 'react';
import { Phone, Mail, Clock, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContactUs() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });
  
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' });
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', padding: '10rem 1rem 4rem 1rem', fontFamily: 'inherit', position: 'relative', overflow: 'hidden' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20, 90, 36, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20, 90, 36, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }} className="animate-up">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>{t('contact.titlePart1')} <span className="text-gradient">{t('contact.titlePart2')}</span></h1>
          <p className="section-subtitle" style={{ marginBottom: '0', maxWidth: '600px', margin: '0 auto' }}>{t('contact.subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {/* Phone */}
          <a href="tel:01127847539" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(20, 90, 36, 0.1)', transition: 'all 0.3s ease', cursor: 'pointer', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(20, 90, 36, 0.1)'; e.currentTarget.style.borderColor = 'rgba(20, 90, 36, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(20, 90, 36, 0.1)'; }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(20, 90, 36, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
              <Phone size={28} />
            </div>
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.phoneTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', direction: 'ltr', fontWeight: 'bold' }}>01127847539</p>
          </a>
          
          {/* Email */}
          <a href="mailto:info@alrehab-agri.com" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(20, 90, 36, 0.1)', transition: 'all 0.3s ease', cursor: 'pointer', textDecoration: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(20, 90, 36, 0.1)'; e.currentTarget.style.borderColor = 'rgba(20, 90, 36, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(20, 90, 36, 0.1)'; }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(20, 90, 36, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
              <Mail size={28} />
            </div>
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.emailTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 'bold' }}>info@Al Rehab.com</p>
          </a>
          
          {/* Working Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(20, 90, 36, 0.1)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(20, 90, 36, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(20, 90, 36, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.hoursTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 'bold' }}>{t('contact.hoursValue')}</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '30px', padding: '3rem', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)', maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '2rem', textAlign: 'center' }}>{t('contact.formTitle')}</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {status === 'success' && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
                {t('contact.successMsg')}
              </div>
            )}
            {status === 'error' && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #fecaca' }}>
                {t('contact.errorMsg')}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.firstName')}</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.firstNamePlaceholder')}
                  style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: 'var(--text-dark)', fontSize: '1.05rem', padding: '1rem 1.2rem', outline: 'none', borderRadius: '12px', transition: 'all 0.3s' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.lastName')}</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.lastNamePlaceholder')}
                  style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: 'var(--text-dark)', fontSize: '1.05rem', padding: '1rem 1.2rem', outline: 'none', borderRadius: '12px', transition: 'all 0.3s' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.phone')}</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.phonePlaceholder')}
                  dir="ltr"
                  style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: 'var(--text-dark)', fontSize: '1.05rem', padding: '1rem 1.2rem', outline: 'none', borderRadius: '12px', transition: 'all 0.3s', textAlign: 'right' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.email')}</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.emailPlaceholder')}
                  dir="ltr"
                  style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: 'var(--text-dark)', fontSize: '1.05rem', padding: '1rem 1.2rem', outline: 'none', borderRadius: '12px', transition: 'all 0.3s', textAlign: 'right' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>{t('contact.messageLabel')}</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder={t('contact.messagePlaceholder')}
                rows="5"
                style={{ background: '#f8fafc', border: '2px solid #e2e8f0', color: 'var(--text-dark)', fontSize: '1.05rem', padding: '1.2rem', outline: 'none', borderRadius: '16px', resize: 'vertical', transition: 'all 0.3s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-primary contact-submit-btn"
                disabled={status === 'submitting'}
                style={{ 
                  opacity: status === 'submitting' ? 0.7 : 1,
                  gap: '0.5rem'
                }}
              >
                <Send size={20} />
                {status === 'submitting' ? t('contact.btnSending') : t('contact.btnSend')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
