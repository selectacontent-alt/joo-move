import React from 'react';
import { PackageOpen, Truck, HeadphonesIcon, BadgeCheck, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const B2BFeatures = ({ setCurrentPage }) => {
  const { t, language } = useLanguage();

  const pillars = [
    {
      icon: PackageOpen,
      title: t('b2b.bulkTitle'),
      desc: t('b2b.bulkDesc'),
      num: '01',
    },
    {
      icon: ShieldCheck,
      title: t('b2b.qualityTitle'),
      desc: t('b2b.qualityDesc'),
      num: '02',
    },
    {
      icon: Truck,
      title: t('b2b.logisticsTitle'),
      desc: t('b2b.logisticsDesc'),
      num: '03',
    },
    {
      icon: HeadphonesIcon,
      title: t('b2b.supportTitle'),
      desc: t('b2b.supportDesc'),
      num: '04',
    },
  ];

  return (
    <section className="b2b-wholesale-section" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Section Header */}
        <div className="b2b-impact-header scroll-reveal">
          <div className="b2b-header-line"></div>
          <h2 className="luxury-section-title">{t('b2b.title')}</h2>
          <p className="b2b-subtitle">{t('b2b.subtitle')}</p>
        </div>

        {/* The 4 Core B2B Pillars */}
        <div className="b2b-pillars-grid">
          {pillars.map((p, i) => (
            <div className="b2b-pillar-card scroll-reveal" style={{ transitionDelay: `${0.1 + i * 0.1}s` }} key={i}>
              <div className="pillar-card-number">{p.num}</div>
              <div className="pillar-top-row">
                <div className="pillar-icon-wrap">
                  <p.icon size={28} />
                </div>
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="pillar-glow"></div>
            </div>
          ))}
        </div>


      </div>

      <style>{`
        .b2b-wholesale-section {
          padding: 7rem 0 0 0;
          background: #fafbfd;
          position: relative;
          overflow: hidden;
        }

        .b2b-wholesale-section::before {
          content: '';
          position: absolute;
          top: -200px; right: -200px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .b2b-wholesale-section::after {
          content: '';
          position: absolute;
          bottom: -150px; left: -150px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .b2b-impact-header {
          text-align: center;
          margin-bottom: 4.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .b2b-header-line {
          width: 60px; height: 4px;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .b2b-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 750px;
          margin: 1.2rem auto 0;
          line-height: 1.9;
          font-weight: 500;
        }

        /* ── Pillar Cards ── */
        .b2b-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .b2b-pillar-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 2rem 2rem;
          border: 1px solid #e8ecf1;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: right;
          position: relative;
          overflow: hidden;
          cursor: default;
        }

        .b2b-pillar-card:hover {
          transform: translateY(-12px);
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 25px 60px rgba(16, 185, 129, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.1);
        }

        /* Glowing corner accent */
        .pillar-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          border-radius: 50%;
          transition: all 0.5s;
          opacity: 0;
        }

        .b2b-pillar-card:hover .pillar-glow {
          opacity: 1;
          transform: scale(1.5);
        }

        /* Card number watermark */
        .pillar-card-number {
          position: absolute;
          top: 12px; left: 16px;
          font-size: 4rem;
          font-weight: 900;
          color: rgba(16, 185, 129, 0.06);
          line-height: 1;
          pointer-events: none;
          transition: color 0.5s;
        }

        .b2b-pillar-card:hover .pillar-card-number {
          color: rgba(16, 185, 129, 0.12);
        }

        .pillar-top-row {
          margin-bottom: 1.5rem;
        }

        .pillar-icon-wrap {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #059669;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
        }

        .b2b-pillar-card:hover .pillar-icon-wrap {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          transform: scale(1.1) rotate(3deg);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.3);
        }

        .b2b-pillar-card h3 {
          font-size: 1.25rem;
          color: #0f172a;
          margin-bottom: 0.8rem;
          font-weight: 800;
          transition: color 0.3s;
        }

        .b2b-pillar-card:hover h3 {
          color: #065f46;
        }

        .b2b-pillar-card p {
          color: #64748b;
          line-height: 1.8;
          font-size: 0.95rem;
          margin: 0;
        }

        /* ── Bottom green line on hover ── */
        .b2b-pillar-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%; height: 3px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          border-radius: 3px;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .b2b-pillar-card:hover::after {
          transform: translateX(-50%) scaleX(1);
        }



        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .b2b-pillars-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .b2b-wholesale-section { padding: 3rem 0; }
          .b2b-pillars-grid { grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
          .b2b-pillar-card { padding: 1.5rem 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
          .pillar-icon-box { margin-bottom: 1rem; width: 45px; height: 45px; margin: 0 auto 1rem; }
          .pillar-icon-box svg { width: 22px; height: 22px; }
          .b2b-pillar-card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
          .b2b-pillar-card p { font-size: 0.8rem; line-height: 1.5; }

        }
      `}</style>
    </section>
  );
};

export default B2BFeatures;
