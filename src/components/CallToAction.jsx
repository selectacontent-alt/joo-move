import React from 'react';
import { ChevronLeft, Wheat, Sprout, Leaf } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CallToAction = ({ setCurrentPage }) => {
  const { t, language } = useLanguage();

  return (
    <section className="cta-section" style={{ background: '#fafbfd', paddingBottom: '3rem' }}>
      <div className="container" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Agricultural CTA Banner */}
      <div className="cta-farm-banner scroll-reveal">
        {/* Background nature layers */}
        <div className="cta-farm-sky" aria-hidden="true"></div>
        <div className="cta-farm-hills" aria-hidden="true"></div>
        <div className="cta-farm-field" aria-hidden="true"></div>

        {/* Floating leaves */}
        <div className="cta-leaf cta-leaf-1" aria-hidden="true"><Leaf size={32} color="rgba(167, 243, 208, 0.6)" /></div>
        <div className="cta-leaf cta-leaf-2" aria-hidden="true"><Leaf size={24} color="rgba(167, 243, 208, 0.4)" /></div>
        <div className="cta-leaf cta-leaf-3" aria-hidden="true"><Wheat size={40} color="rgba(167, 243, 208, 0.5)" /></div>
        <div className="cta-leaf cta-leaf-4" aria-hidden="true"><Leaf size={28} color="rgba(167, 243, 208, 0.7)" /></div>
        <div className="cta-leaf cta-leaf-5" aria-hidden="true"><Leaf size={20} color="rgba(167, 243, 208, 0.3)" /></div>

        {/* Floating seed particles */}
        <div className="cta-seed cta-seed-1" aria-hidden="true"></div>
        <div className="cta-seed cta-seed-2" aria-hidden="true"></div>
        <div className="cta-seed cta-seed-3" aria-hidden="true"></div>
        <div className="cta-seed cta-seed-4" aria-hidden="true"></div>
        <div className="cta-seed cta-seed-5" aria-hidden="true"></div>
        <div className="cta-seed cta-seed-6" aria-hidden="true"></div>

        {/* Sun glow */}
        <div className="cta-sun-glow" aria-hidden="true"></div>

        {/* Content */}
        <div className="cta-farm-content">
          <h3>{t('b2b.ctaTitle')}</h3>
          <p>{t('b2b.ctaDesc')}</p>
          <button className="cta-farm-btn" onClick={() => { if(setCurrentPage) setCurrentPage('booking'); window.scrollTo(0,0); }}>
            <span className="cta-farm-btn-shine"></span>
            {t('b2b.ctaButton')} <ChevronLeft size={20} />
          </button>
        </div>

        {/* Agricultural graphic side */}
        <div className="cta-farm-graphics" aria-hidden="true">
          <div className="cta-wheat-group">
            <Wheat size={50} className="cta-wheat cta-wheat-1" />
            <Wheat size={65} className="cta-wheat cta-wheat-2" />
            <Wheat size={55} className="cta-wheat cta-wheat-3" />
            <Wheat size={45} className="cta-wheat cta-wheat-4" />
            <Wheat size={60} className="cta-wheat cta-wheat-5" />
          </div>
          <Leaf size={90} className="cta-big-leaf" />
        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════
           AGRICULTURAL CTA BANNER
        ══════════════════════════════════════ */
        .cta-farm-banner {
          position: relative;
          border-radius: 28px;
          padding: 4.5rem 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          background: linear-gradient(160deg, #064e3b 0%, #065f46 25%, #047857 50%, #059669 80%, #34d399 100%);
          box-shadow:
            0 30px 80px rgba(5, 150, 105, 0.25),
            0 0 0 1px rgba(52, 211, 153, 0.2),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* ── Sky layer ── */
        .cta-farm-sky {
          position: absolute; inset: 0;
          background: linear-gradient(180deg,
            rgba(16, 185, 129, 0.0) 0%,
            rgba(6, 78, 59, 0.3) 100%
          );
          pointer-events: none;
        }

        /* ── Rolling hills ── */
        .cta-farm-hills {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 60%;
          background:
            radial-gradient(ellipse 80% 50% at 20% 100%, rgba(4, 120, 87, 0.5) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 70% 100%, rgba(5, 150, 105, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 90% 60% at 50% 100%, rgba(6, 95, 70, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Field texture at bottom ── */
        .cta-farm-field {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 35%;
          background:
            repeating-linear-gradient(
              85deg,
              transparent,
              transparent 8px,
              rgba(52, 211, 153, 0.06) 8px,
              rgba(52, 211, 153, 0.06) 9px
            );
          pointer-events: none;
          mask-image: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        }

        /* ── Floating leaves ── */
        .cta-leaf {
          position: absolute;
          font-size: 1.5rem;
          pointer-events: none;
          opacity: 0;
          animation: leafDrift linear infinite;
        }
        .cta-leaf-1 { top: 15%; right: 8%; font-size: 1.8rem; animation-duration: 12s; animation-delay: 0s; }
        .cta-leaf-2 { top: 30%; right: 25%; font-size: 1.3rem; animation-duration: 15s; animation-delay: -3s; }
        .cta-leaf-3 { top: 10%; right: 40%; font-size: 2rem; animation-duration: 10s; animation-delay: -6s; }
        .cta-leaf-4 { top: 50%; right: 15%; font-size: 1.1rem; animation-duration: 14s; animation-delay: -2s; }
        .cta-leaf-5 { top: 25%; right: 55%; font-size: 1.4rem; animation-duration: 16s; animation-delay: -8s; }

        @keyframes leafDrift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          50% { opacity: 0.35; }
          90% { opacity: 0.4; }
          100% { transform: translate(-120px, 80px) rotate(180deg); opacity: 0; }
        }

        /* ── Floating seed particles ── */
        .cta-seed {
          position: absolute;
          border-radius: 50%;
          background: rgba(167, 243, 208, 0.5);
          pointer-events: none;
          animation: seedFloat ease-in-out infinite;
        }
        .cta-seed-1 { width: 4px; height: 4px; bottom: 20%; left: 12%; animation-duration: 6s; }
        .cta-seed-2 { width: 3px; height: 3px; bottom: 30%; left: 30%; animation-duration: 8s; animation-delay: -2s; }
        .cta-seed-3 { width: 5px; height: 5px; bottom: 15%; left: 50%; animation-duration: 7s; animation-delay: -4s; }
        .cta-seed-4 { width: 3px; height: 3px; bottom: 40%; left: 65%; animation-duration: 9s; animation-delay: -1s; }
        .cta-seed-5 { width: 4px; height: 4px; bottom: 25%; left: 80%; animation-duration: 5s; animation-delay: -3s; }
        .cta-seed-6 { width: 3px; height: 3px; bottom: 35%; left: 45%; animation-duration: 10s; animation-delay: -5s; }

        @keyframes seedFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-40px) scale(1.3); opacity: 0.7; }
        }

        /* ── Sun glow ── */
        .cta-sun-glow {
          position: absolute;
          top: -80px; right: -40px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.05) 30%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: sunPulse 6s ease-in-out infinite alternate;
        }

        @keyframes sunPulse {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
        }

        /* ── Content ── */
        .cta-farm-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
        }

        .cta-farm-content h3 {
          font-size: 2.5rem;
          color: #ffffff;
          margin-bottom: 1rem;
          font-weight: 900;
          line-height: 1.3;
          text-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .cta-farm-content p {
          font-size: 1.15rem;
          color: rgba(209, 250, 229, 0.8);
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }

        /* ── Button ── */
        .cta-farm-btn {
          background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
          color: #065f46;
          border: none;
          padding: 1.1rem 2.8rem;
          border-radius: 100px;
          font-size: 1.1rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .cta-farm-btn-shine {
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent);
          transform: skewX(-20deg);
          animation: farmBtnShine 3s ease-in-out infinite;
        }

        @keyframes farmBtnShine {
          0% { left: -100%; }
          20% { left: 150%; }
          100% { left: 150%; }
        }

        .cta-farm-btn:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          background: #ffffff;
        }

        /* ── Agricultural graphics side ── */
        .cta-farm-graphics {
          position: absolute;
          top: 0; left: 0;
          width: 45%; height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
          opacity: 0.25;
        }

        .cta-wheat-group {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          margin-bottom: -5px;
        }

        .cta-wheat {
          color: rgba(167, 243, 208, 0.7);
          transform-origin: bottom center;
        }

        .cta-wheat-1 { animation: wheatSway 4s ease-in-out infinite; }
        .cta-wheat-2 { animation: wheatSway 4.5s ease-in-out infinite -0.5s; }
        .cta-wheat-3 { animation: wheatSway 3.8s ease-in-out infinite -1s; }
        .cta-wheat-4 { animation: wheatSway 4.2s ease-in-out infinite -1.5s; }
        .cta-wheat-5 { animation: wheatSway 5s ease-in-out infinite -2s; }

        @keyframes wheatSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .cta-big-leaf {
          position: absolute;
          top: 20%; left: 15%;
          color: rgba(167, 243, 208, 0.15);
          transform: rotate(-30deg);
          animation: bigLeafFloat 8s ease-in-out infinite;
        }

        @keyframes bigLeafFloat {
          0%, 100% { transform: rotate(-30deg) translateY(0); }
          50% { transform: rotate(-25deg) translateY(-10px); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .cta-farm-banner {
            flex-direction: column;
            text-align: center;
            padding: 2.5rem 1.5rem;
          }
          .cta-farm-content h3 { font-size: 1.4rem; margin-bottom: 1rem; }
          .cta-farm-content p { font-size: 0.95rem; }
          .cta-farm-btn { margin: 0 auto; width: 100%; justify-content: center; }
          .cta-farm-graphics { opacity: 0.1; width: 100%; }
          .cta-leaf { font-size: 1rem !important; }
        }
      `}</style>
      </div>
    </section>
  );
};

export default CallToAction;