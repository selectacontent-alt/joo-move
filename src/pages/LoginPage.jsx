import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowLeft, Monitor, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LoginPage = ({ setAuth, setCurrentPage, targetPage = 'admin' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_auth', JSON.stringify(data.user));
        setAuth(data.user);
        setCurrentPage(targetPage);
      } else {
        setError(data.error || t('login.errorInvalid'));
      }
    } catch (err) {
      setError(t('login.errorConnection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container" style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      direction: 'rtl',
      fontFamily: "'Cairo', 'Tajawal', sans-serif"
    }}>
      {/* Dynamic Ambient Background */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(157,2,124,0.4) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(80px)', animation: 'pulse 15s ease-in-out infinite alternate', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,188,1,0.2) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(80px)', animation: 'pulse 20s ease-in-out infinite alternate-reverse', zIndex: 0 }}></div>

      <div className="login-card animate-up" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        margin: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Logo Section - Centered, Large, White */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img 
              src="/sc-marketing-logo-new.png" 
              alt="SC Marketing Logo" 
              style={{ 
                height: '140px', 
                objectFit: 'contain', 
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))',
                animation: 'floatingLogo 4s ease-in-out infinite'
              }} 
            />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>{t('login.title') || 'تسجيل الدخول'}</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', margin: 0, textAlign: 'center' }}>{t('login.subtitle') || 'أدخل بيانات الاعتماد الخاصة بك للوصول'}</p>
        </div>

        {(isMobile && targetPage === 'admin') ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', margin: '0 0 1rem 0' }}>غير مدعوم على الهاتف</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: 0, lineHeight: '1.6' }}>
                لوحة تحكم الإدارة تحتوي على إعدادات متقدمة مخصصة للعرض والتحكم من خلال أجهزة الكمبيوتر فقط.
              </p>
            </div>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{ marginTop: '1rem', width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: '#9d027c', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                animation: 'shake 0.5s'
              }}>
                <ShieldCheck size={20} /> {error}
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none', display: 'flex' }}>
                <User size={22} />
              </div>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px', 
                  padding: '1.2rem 3.5rem 1.2rem 1.2rem', 
                  width: '100%',
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }} 
                placeholder={t('login.formUsername') || 'اسم المستخدم'} 
                onFocus={(e) => { e.target.style.borderColor = '#ffbc01'; e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = '0 0 0 4px rgba(255, 188, 1, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none', display: 'flex' }}>
                <Lock size={22} />
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px', 
                  padding: '1.2rem 3.5rem 1.2rem 1.2rem', 
                  width: '100%',
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }} 
                placeholder={t('login.formPassword') || 'كلمة المرور'} 
                onFocus={(e) => { e.target.style.borderColor = '#ffbc01'; e.target.style.background = 'rgba(0,0,0,0.4)'; e.target.style.boxShadow = '0 0 0 4px rgba(255, 188, 1, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                marginTop: '1rem', 
                width: '100%', 
                padding: '1.2rem', 
                fontSize: '1.2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #9d027c 0%, #d904ab 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '800',
                boxShadow: '0 10px 25px rgba(157, 2, 124, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { if(!isLoading) { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 30px rgba(157, 2, 124, 0.5)'; } }}
              onMouseLeave={(e) => { if(!isLoading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 25px rgba(157, 2, 124, 0.4)'; } }}
            >
              {isLoading ? t('login.formLoading') || 'جاري تسجيل الدخول...' : (
                <>
                  {t('login.formSubmit') || 'تسجيل الدخول'}
                  <ArrowLeft size={20} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatingLogo {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(20px, -20px); }
          100% { transform: scale(1.1) translate(-20px, 20px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-up {
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default LoginPage;
