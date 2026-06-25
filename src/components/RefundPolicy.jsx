import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, Truck, CheckCircle, PackageOpen, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const RefundPolicy = () => {
  const { t } = useLanguage();
  return (
    <div className="policy-page-wrapper" style={{ 
      paddingTop: 'clamp(140px, 12vw, 160px)', 
      minHeight: '100vh', 
      background: 'var(--bg-color, #fafafa)',
      paddingBottom: 'clamp(4rem, 8vw, 6rem)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'var(--primary-color, #000)', opacity: '0.03', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '500px', height: '500px', background: 'var(--primary-color, #000)', opacity: '0.04', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'white', borderRadius: '16px', color: 'var(--primary-color, #111)', marginBottom: '1rem', boxShadow: '0 15px 35px rgba(0,0,0,0.06)' }}>
            <ShieldCheck size={28} strokeWidth={2} />
          </div>
          <h1 className="policy-title" style={{ 
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', 
            fontWeight: '900', 
            color: 'var(--text-dark, #111)', 
            marginBottom: '0.8rem',
            letterSpacing: '-0.02em',
            lineHeight: '1.3'
          }}>
            {t('policy.title')}
          </h1>
          <p style={{ 
            fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', 
            color: 'var(--text-muted, #666)', 
            maxWidth: '650px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            {t('policy.description')}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'clamp(1rem, 3vw, 2rem)' 
        }}>
          
          {/* Card 1: Inspection */}
          <div className="policy-luxury-card">
            <div className="policy-icon-wrapper">
              <PackageOpen size={24} strokeWidth={1.8} />
            </div>
            <h3 className="policy-card-title">{t('policy.inspectionTitle')}</h3>
            <div className="policy-highlight-box">
              <p className="policy-card-text" style={{ color: 'var(--primary-color, #111)', fontWeight: '700' }}>
                {t('policy.inspectionText')}
              </p>
            </div>
          </div>

          {/* Card 2: General Rules */}
          <div className="policy-luxury-card">
            <div className="policy-icon-wrapper">
              <RefreshCw size={24} strokeWidth={1.8} />
            </div>
            <h3 className="policy-card-title">{t('policy.conditionsTitle')}</h3>
            <ul className="policy-list">
              <li>
                <div className="policy-check-icon"><CheckCircle size={18} strokeWidth={2.5} /></div>
                <span dangerouslySetInnerHTML={{ __html: t('policy.conditionWithin14') }}></span>
              </li>
              <li>
                <div className="policy-check-icon"><CheckCircle size={18} strokeWidth={2.5} /></div>
                <span>{t('policy.conditionPolicyDuration')}</span>
              </li>
              <li>
                <div className="policy-check-icon"><CheckCircle size={18} strokeWidth={2.5} /></div>
                <span>{t('policy.conditionUnused')}</span>
              </li>
              <li>
                <div className="policy-check-icon"><CheckCircle size={18} strokeWidth={2.5} /></div>
                <span>{t('policy.conditionReceipt')}</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Shipping */}
          <div className="policy-luxury-card">
            <div className="policy-icon-wrapper">
              <Truck size={24} strokeWidth={1.8} />
            </div>
            <h3 className="policy-card-title">{t('policy.shippingTitle')}</h3>
            <p className="policy-card-text">
              {t('policy.shippingText1')}
            </p>
            <p className="policy-card-text" style={{ marginTop: '1rem' }}>
              {t('policy.shippingText2')}
            </p>
          </div>

          {/* Card 4: Refund Process */}
          <div className="policy-luxury-card" style={{ gridColumn: '1 / -1' }}>
            <div className="policy-icon-wrapper">
              <ShieldCheck size={24} strokeWidth={1.8} />
            </div>
            <h3 className="policy-card-title">{t('policy.refundTitle')}</h3>
            <div className="policy-grid-3col">
              <div className="policy-info-block">
                <p className="policy-card-text">
                  {t('policy.refundProcess')}
                </p>
              </div>
              <div className="policy-info-block warning-block">
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', fontSize: '0.95rem' }}>{t('policy.refundLateTitle')}</h4>
                <p className="policy-card-text">{t('policy.refundLateText')}</p>
              </div>
              <div className="policy-info-block">
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dark, #111)', fontWeight: '800', fontSize: '0.95rem' }}>{t('policy.refundDiscountedLabel')}</strong>
                <p className="policy-card-text">{t('policy.refundDiscountedText')}</p>
              </div>
            </div>
          </div>

          {/* Card 5: Exceptions */}
          <div className="policy-luxury-card exception-card" style={{ gridColumn: '1 / -1' }}>
            <div className="policy-icon-wrapper exception-icon">
              <AlertTriangle size={24} strokeWidth={1.8} />
            </div>
            <h3 className="policy-card-title exception-title">{t('policy.exceptionsTitle')}</h3>
            <div className="policy-grid-2col" style={{ marginTop: '1.5rem' }}>
              <ul className="policy-list exception-list">
                <li>
                  <div className="policy-cross-icon">✕</div>
                  <span>{t('policy.exceptionNotOriginal')}</span>
                </li>
              </ul>
              <ul className="policy-list exception-list">
                <li>
                  <div className="policy-cross-icon">✕</div>
                  <span>{t('policy.exceptionAfter14')}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Styling inside the component for isolation */}
        <style dangerouslySetInnerHTML={{__html: `
          .policy-luxury-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 24px;
            padding: clamp(1.5rem, 4vw, 2.5rem);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          }
          .policy-luxury-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.95);
            border-color: rgba(0,0,0,0.05);
          }
          
          .policy-icon-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: white;
            color: var(--primary-color, #111);
            border-radius: 14px;
            margin-bottom: 1.25rem;
            box-shadow: 0 8px 20px rgba(0,0,0,0.04);
            transition: all 0.3s;
          }
          .policy-luxury-card:hover .policy-icon-wrapper {
            background: var(--primary-color, #111);
            color: white;
            transform: scale(1.05) rotate(-5deg);
          }
          
          .policy-card-title {
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--text-dark, #111);
            margin: 0 0 0.8rem 0;
            letter-spacing: -0.01em;
          }
          
          .policy-card-text {
            color: var(--text-muted, #555);
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 0;
          }
          
          .policy-highlight-box {
            background: rgba(var(--primary-color-rgb, 0,0,0), 0.03);
            padding: 1.2rem;
            border-radius: 16px;
            border-left: 3px solid var(--primary-color, #111);
          }

          .policy-grid-2col {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          @media (min-width: 768px) {
            .policy-grid-2col {
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
            }
          }

          .policy-grid-3col {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-top: 1.5rem;
          }
          @media (min-width: 768px) {
            .policy-grid-3col {
              grid-template-columns: repeat(3, 1fr);
              gap: 2rem;
            }
          }

          .policy-info-block {
            padding: 1.5rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            height: 100%;
          }

          .warning-block {
            background: #fff5f5;
            color: #c53030;
          }
          .warning-block .policy-card-text {
            color: #c53030;
          }
          .warning-block h4 {
            color: #9b2c2c;
          }

          .policy-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .policy-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.8rem;
            color: var(--text-muted, #555);
            font-size: 0.85rem;
            line-height: 1.6;
            font-weight: 500;
          }
          .policy-check-icon {
            color: var(--primary-color, #111);
            background: rgba(var(--primary-color-rgb, 0,0,0), 0.05);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .exception-card {
            background: #fffcfc;
            border-color: #ffe5e5;
          }
          .exception-card:hover {
            background: white;
            border-color: #ffcccc;
          }
          .exception-title {
            color: #e53e3e;
          }
          .exception-icon {
            color: #e53e3e;
            background: #fff5f5;
          }
          .exception-card:hover .exception-icon {
            background: #e53e3e;
            color: white;
          }
          .policy-cross-icon {
            color: #e53e3e;
            background: #fff5f5;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.85rem;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .exception-list li {
            color: #c53030;
          }
        `} } />
      </div>
    </div>
  );
};

export default RefundPolicy;
