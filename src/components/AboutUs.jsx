import React, { useEffect, useState } from 'react';
import { Target, ShieldCheck, Users, Tractor, CheckCircle, Leaf, Globe, Award, ArrowUpLeft } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../lib/homeSettings';

const AboutUs = ({ isHomepage = false }) => {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : DEFAULT_SITE_SETTINGS)
      .then(data => {
        if (!cancelled) setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
      })
      .catch(() => {
        if (!cancelled) setSettings(DEFAULT_SITE_SETTINGS);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      icon: Globe,
      title: settings.feature_title_1 || DEFAULT_SITE_SETTINGS.feature_title_1,
      desc: settings.feature_desc_1 || DEFAULT_SITE_SETTINGS.feature_desc_1,
      stat: '+١٢',
      statLabel: 'دولة مصدر',
    },
    {
      icon: Award,
      title: settings.feature_title_2 || DEFAULT_SITE_SETTINGS.feature_title_2,
      desc: settings.feature_desc_2 || DEFAULT_SITE_SETTINGS.feature_desc_2,
      stat: '١٠٠٪',
      statLabel: 'نسبة المطابقة',
    },
    {
      icon: Tractor,
      title: settings.feature_title_3 || DEFAULT_SITE_SETTINGS.feature_title_3,
      desc: settings.feature_desc_3 || DEFAULT_SITE_SETTINGS.feature_desc_3,
      stat: '+٢٠٠',
      statLabel: 'شاحنة نقل',
    },
    {
      icon: CheckCircle,
      title: settings.feature_title_4 || DEFAULT_SITE_SETTINGS.feature_title_4,
      desc: settings.feature_desc_4 || DEFAULT_SITE_SETTINGS.feature_desc_4,
      stat: '+٥٠',
      statLabel: 'خبير زراعي',
    },
  ];

  return (
    <section id="about" className="elite-about-section">
      <div className="container">
        
        {!isHomepage && (
          <div className="elite-about-intro animate-up">
            <span className="elite-badge-soft"><Leaf size={16} /> {settings.about_subtitle || DEFAULT_SITE_SETTINGS.about_subtitle}</span>
            <h2 className="elite-section-title" style={{color: '#0f172a'}}>{settings.about_title || DEFAULT_SITE_SETTINGS.about_title}</h2>
            <p className="elite-section-desc" style={{color: '#64748b'}}>{settings.about_text || DEFAULT_SITE_SETTINGS.about_text}</p>

            <div className="elite-values-grid">
              <div className="elite-value-card">
                <div className="value-icon"><Target size={28} /></div>
                <h4>رؤيتنا المستقبلية</h4>
                <p>أن نصبح الخيار الأول والشريك الاستراتيجي الموثوق لكافة المشاريع الزراعية والحيوانية الضخمة في الشرق الأوسط.</p>
              </div>
              <div className="elite-value-card">
                <div className="value-icon"><ShieldCheck size={28} /></div>
                <h4>رسالتنا المهنية</h4>
                <p>توفير إمدادات زراعية وعلفية مستدامة، بأسعار تنافسية وجودة لا تضاهى، لضمان أعلى معدلات الإنتاجية لعملائنا.</p>
              </div>
              <div className="elite-value-card">
                <div className="value-icon"><Users size={28} /></div>
                <h4>قيمنا الثابتة</h4>
                <p>الشفافية التامة، الدقة في المواعيد، الجودة الصارمة، وبناء علاقات طويلة الأمد مع كافة شركائنا في النجاح.</p>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us — Light Premium */}
        <div className="why-us-section" style={{ marginTop: isHomepage ? '-3rem' : '0' }}>

          <div className="why-header">
            {settings.why_subtitle && <span className="why-badge">{settings.why_subtitle}</span>}
            <h2 className="elite-section-title">{settings.why_title || DEFAULT_SITE_SETTINGS.why_title}</h2>
            <p className="elite-section-desc">{settings.why_desc || DEFAULT_SITE_SETTINGS.why_desc}</p>
          </div>
          
          <div className="why-grid">
            {features.map((f, i) => (
              <div className="why-card" key={i}>
                <div className="wdc-border-anim"></div>
                <div className="wdc-inner">
                  <div className="wdc-top">
                    <div className="wdc-icon-ring">
                      <div className="wdc-icon-pulse"></div>
                      <div className="wdc-icon-core">
                        <f.icon size={26} />
                      </div>
                    </div>
                    <div className="wdc-stat-box">
                      <span className="wdc-stat-num">{f.stat}</span>
                      <span className="wdc-stat-label">{f.statLabel}</span>
                    </div>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="wdc-bottom-line"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .elite-about-section {
          padding: 4rem 0 0;
          background: #f8fafc;
          position: relative;
        }

        .elite-badge-soft {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ecfdf5;
          color: #059669;
          padding: 0.5rem 1.2rem;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          border: 1px solid #a7f3d0;
        }

        .elite-section-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 1.2rem;
          letter-spacing: -0.5px;
        }

        .elite-section-desc {
          font-size: 1.15rem;
          color: #64748b;
          line-height: 1.8;
          max-width: 800px;
          margin-bottom: 3rem;
        }

        .elite-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .elite-value-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          transition: transform 0.3s;
        }

        .elite-value-card:hover {
          transform: translateY(-5px);
          border-color: #10b981;
        }

        .value-icon {
          width: 60px; height: 60px;
          background: #f0fdf4;
          color: #10b981;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
        }

        .elite-value-card h4 { font-size: 1.3rem; color: #1e293b; margin-bottom: 1rem; font-weight: 800; }
        .elite-value-card p { color: #64748b; line-height: 1.7; font-size: 1rem; margin: 0; }

        /* ═══════════════════════════════════
           LIGHT PREMIUM SECTION
           ═══════════════════════════════════ */
        .why-us-section {
          position: relative;
          background: #fafbfd;
          border-radius: 0;
          margin: 0 -999px 0;
          padding: 0 999px 5rem;
          overflow: hidden;
        }

        /* Header */
        .why-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 3.5rem;
          position: relative;
          z-index: 2;
        }

        .why-badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          padding: 0.45rem 1.5rem;
          border-radius: 100px;
          font-size: 0.9rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
          letter-spacing: 0.5px;
        }

        .why-us-section .elite-section-title {
          color: #0f172a;
        }

        .why-us-section .elite-section-desc {
          color: #64748b;
        }

        /* ── Cards Grid ── */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }

        /* Card with animated border */
        .why-card {
          position: relative;
          border-radius: 22px;
          padding: 2px; /* border thickness */
          background: #e2e8f0;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s;
          cursor: default;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .why-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.12);
        }

        /* Animated gradient border */
        .wdc-border-anim {
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 23px;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(16,185,129,0.8) 15%,
            transparent 30%,
            rgba(52,211,153,0.6) 50%,
            transparent 65%,
            rgba(16,185,129,0.8) 80%,
            transparent 100%
          );
          animation: cardBorderSpin 4s linear infinite;
          opacity: 0;
          transition: opacity 0.5s;
          z-index: 0;
        }

        .why-card:hover .wdc-border-anim {
          opacity: 1;
        }

        @keyframes cardBorderSpin {
          to { transform: rotate(360deg); }
        }

        /* Inner card */
        .wdc-inner {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 20px;
          padding: 2.2rem 1.8rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .why-card:hover .wdc-inner {
          background: linear-gradient(165deg, #ffffff 0%, #f0fdf4 100%);
        }

        /* Top row: icon + stat */
        .wdc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.8rem;
        }

        /* Icon with pulse ring */
        .wdc-icon-ring {
          position: relative;
          width: 58px; height: 58px;
        }

        .wdc-icon-pulse {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          border-radius: 16px;
          border: 1.5px solid rgba(16, 185, 129, 0.4);
          animation: iconPulseRing 2.5s ease-out infinite;
        }

        @keyframes iconPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .wdc-icon-core {
          width: 58px; height: 58px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #059669;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          z-index: 1;
          transition: all 0.4s;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.08);
        }

        .why-card:hover .wdc-icon-core {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
          transform: scale(1.08) rotate(3deg);
        }

        /* Stat badge */
        .wdc-stat-box {
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .wdc-stat-num {
          font-size: 1.6rem;
          font-weight: 900;
          background: linear-gradient(135deg, #059669, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
          direction: ltr;
        }

        .wdc-stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 700;
          margin-top: 2px;
        }

        .wdc-inner h3 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.8rem;
          transition: color 0.4s;
        }

        .why-card:hover .wdc-inner h3 {
          color: #065f46;
        }

        .wdc-inner p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.8;
          margin: 0;
          flex-grow: 1;
        }

        /* Bottom accent line */
        .wdc-bottom-line {
          margin-top: 1.5rem;
          height: 3px;
          background: linear-gradient(90deg, #10b981, transparent);
          border-radius: 3px;
          width: 0;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .why-card:hover .wdc-bottom-line {
          width: 100%;
        }

        /* ═══ Responsive ═══ */
        @media (max-width: 1100px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .elite-section-title { font-size: 1.8rem; }
          .elite-about-section { padding: 2.5rem 0 0; }
          .why-us-section { padding-top: 2rem; padding-bottom: 2rem; margin-top: 1rem; }
          .why-grid { grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
          .why-card { padding: 1px; } /* border thickness */
          .wdc-inner { padding: 1rem 0.5rem; text-align: center; aspect-ratio: 1; justify-content: center; display: flex; }
          .wdc-top { flex-direction: column; align-items: center; gap: 0.2rem; margin-bottom: 0.5rem; }
          .wdc-stat-box { align-items: center; text-align: center; }
          .wdc-stat-num { font-size: 1.1rem; }
          .wdc-stat-label { font-size: 0.6rem; }
          .wdc-inner h3 { font-size: 0.85rem; margin-bottom: 0; line-height: 1.3; }
          .wdc-inner p { display: none; } /* Hide description to keep it a small square */
          .wdc-icon-ring { width: 36px; height: 36px; margin: 0 auto; }
          .wdc-icon-pulse, .wdc-icon-core { width: 36px; height: 36px; border-radius: 12px; }
          .wdc-icon-core svg { width: 16px; height: 16px; }
        }
      `}</style>
    </section>
  );
};

export default AboutUs;
