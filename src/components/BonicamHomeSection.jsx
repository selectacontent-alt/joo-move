import React from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Leaf,
  LineChart,
  Sprout,
  Sun,
  Truck,
  Users,
  Wheat,
} from 'lucide-react';

const benefits = [
  { icon: Wheat, label: 'إنتاج غزير' },
  { icon: LineChart, label: 'حشات متكررة' },
  { icon: Leaf, label: 'قيمة غذائية ممتازة' },
  { icon: Users, label: 'مناسب للأبقار والجاموس والأغنام والماعز' },
];

const performance = [
  'نمو سريع',
  'إنتاجية عالية',
  'إقبال كبير من المواشي',
  'يتحمل درجات الحرارة المرتفعة',
];

const services = [
  { icon: BadgeCheck, title: 'متابعة هندسية قبل الزراعة' },
  { icon: Sprout, title: 'دعم وإرشاد بعد الزراعة' },
  { icon: Truck, title: 'توصيل لكل المحافظات' },
  { icon: LineChart, title: 'شتلات قوية وإنتاج مضمون' },
];

const irrigationTips = [
  'يفضل تكون الريّة مباشرة بعد الزراعة.',
  'المحافظة على رطوبة التربة خلال الأيام الأولى.',
  'تجنب التغريق الزائد حتى لا تتأثر الجذور.',
  'المتابعة الجيدة في البداية تعني نمو أسرع وإنتاج أعلى فيما بعد.',
];

const BonicamHomeSection = ({ setCurrentPage }) => {
  const goToBooking = () => {
    if (setCurrentPage) setCurrentPage('booking');
    window.scrollTo(0, 0);
  };

  return (
    <section className="bonicam-home-section" dir="rtl" aria-label="مميزات البونيكام البرازيلي">
      <div className="bonicam-grain" aria-hidden="true" />
      <div className="bonicam-field-lines" aria-hidden="true" />

      <div className="bonicam-container">
        <div className="bonicam-hero-card scroll-reveal">
          <div className="bonicam-copy">
            <span className="bonicam-eyebrow">
              <Sprout size={18} />
              علف أخضر عالي الإنتاجية
            </span>
            <h2>
              البونيكام البرازيلي من أفضل
              <span> محاصيل الأعلاف الخضراء</span>
            </h2>
            <p>
              اختيار عملي للمزارع والمربي الباحث عن علف قوي، سريع النمو، متكرر الحشات،
              وقيمة غذائية ممتازة تناسب الأبقار والجاموس والأغنام والماعز.
            </p>

            <div className="bonicam-performance-strip" aria-label="مؤشرات الأداء">
              {performance.map((item) => (
                <span key={item}>
                  <BadgeCheck size={16} />
                  {item}
                </span>
              ))}
            </div>

            <button type="button" className="bonicam-cta" onClick={goToBooking}>
              احجز شتلات البونيكام
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="bonicam-visual" aria-hidden="true">
            <div className="bonicam-sun"><Sun size={34} /></div>
            <div className="bonicam-leaf-stack">
              <Leaf className="bonicam-leaf bonicam-leaf-a" size={138} />
              <Leaf className="bonicam-leaf bonicam-leaf-b" size={110} />
              <Wheat className="bonicam-wheat" size={128} />
            </div>
            <div className="bonicam-yield-badge">
              <strong>+ إنتاج</strong>
              <span>حشات متكررة وجودة ثابتة</span>
            </div>
          </div>
        </div>

        <div className="bonicam-benefits-grid scroll-reveal">
          {benefits.map((benefit) => (
            <article className="bonicam-benefit-card" key={benefit.label}>
              <div className="bonicam-card-icon">
                <benefit.icon size={24} />
              </div>
              <h3>{benefit.label}</h3>
            </article>
          ))}
        </div>

        <div className="bonicam-lower-grid">
          <div className="bonicam-services-panel scroll-reveal">
            <div className="bonicam-panel-heading">
              <span>خدمة الرحاب</span>
              <h3>من قبل الزراعة لحد بداية الإنتاج</h3>
            </div>
            <div className="bonicam-services-grid">
              {services.map((service) => (
                <article className="bonicam-service-item" key={service.title}>
                  <service.icon size={22} />
                  <strong>{service.title}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="bonicam-irrigation-panel scroll-reveal">
            <div className="bonicam-panel-heading">
              <span>أول أيام الزراعة</span>
              <h3>رعاية البداية تصنع الفرق</h3>
            </div>
            <ol className="bonicam-irrigation-list">
              {irrigationTips.map((tip, index) => (
                <li key={tip}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{tip}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        .bonicam-home-section {
          position: relative;
          overflow: hidden;
          padding: 7rem 0 5rem;
          margin-top: 0;
          background:
            radial-gradient(circle at 15% 18%, rgba(181, 217, 65, 0.24), transparent 26%),
            radial-gradient(circle at 85% 12%, rgba(52, 211, 153, 0.18), transparent 24%),
            linear-gradient(180deg, #f3f8ed 0%, #e9f4df 46%, #f8fafc 100%);
        }

        .bonicam-grain {
          position: absolute;
          inset: 0;
          opacity: 0.28;
          background-image:
            linear-gradient(rgba(20, 90, 36, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 90, 36, 0.05) 1px, transparent 1px);
          background-size: 34px 34px;
          pointer-events: none;
        }

        .bonicam-field-lines {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: -15%;
          height: 48%;
          background: repeating-linear-gradient(
            84deg,
            transparent 0 18px,
            rgba(20, 90, 36, 0.08) 19px 21px
          );
          transform: perspective(600px) rotateX(58deg);
          transform-origin: bottom;
          pointer-events: none;
          opacity: 0.5;
        }

        .bonicam-container {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .bonicam-hero-card {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          align-items: center;
          gap: 2rem;
          padding: 3rem;
          border: 1px solid rgba(20, 90, 36, 0.16);
          border-radius: 28px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(236, 253, 245, 0.74) 100%);
          box-shadow: 0 30px 90px rgba(20, 90, 36, 0.14);
          backdrop-filter: blur(14px);
          overflow: hidden;
        }

        .bonicam-hero-card::before {
          content: '';
          position: absolute;
          inset: auto -10% -35% -10%;
          height: 55%;
          background: radial-gradient(ellipse at center, rgba(20, 90, 36, 0.18), transparent 68%);
          pointer-events: none;
        }

        .bonicam-copy,
        .bonicam-visual {
          position: relative;
          z-index: 1;
        }

        .bonicam-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 1.2rem;
          padding: 0.52rem 1rem;
          border: 1px solid rgba(20, 90, 36, 0.18);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: #145a24;
          font-size: 0.88rem;
          font-weight: 900;
        }

        .bonicam-copy h2 {
          max-width: 780px;
          margin: 0 0 1rem;
          color: #102017;
          font-size: clamp(2.25rem, 5vw, 4.15rem);
          font-weight: 950;
          line-height: 1.12;
          letter-spacing: 0;
        }

        .bonicam-copy h2 span {
          display: block;
          color: #17803b;
        }

        .bonicam-copy p {
          max-width: 700px;
          margin: 0 0 1.6rem;
          color: #435848;
          font-size: 1.08rem;
          font-weight: 700;
          line-height: 1.9;
        }

        .bonicam-performance-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .bonicam-performance-strip span {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          min-height: 38px;
          padding: 0.55rem 0.9rem;
          border: 1px solid rgba(20, 90, 36, 0.14);
          border-radius: 999px;
          background: #ffffff;
          color: #166534;
          font-size: 0.9rem;
          font-weight: 900;
          box-shadow: 0 8px 24px rgba(20, 90, 36, 0.07);
        }

        .bonicam-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          min-height: 52px;
          padding: 0.95rem 1.8rem;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, #145a24 0%, #239447 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 16px 38px rgba(20, 90, 36, 0.28);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .bonicam-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 48px rgba(20, 90, 36, 0.34);
        }

        .bonicam-visual {
          min-height: 360px;
          border-radius: 26px;
          background:
            radial-gradient(circle at 50% 24%, rgba(251, 191, 36, 0.18), transparent 22%),
            linear-gradient(180deg, #145a24 0%, #0b3d24 100%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(20, 90, 36, 0.18);
          overflow: hidden;
        }

        .bonicam-visual::before {
          content: '';
          position: absolute;
          left: -18%;
          right: -18%;
          bottom: -8%;
          height: 45%;
          background: repeating-linear-gradient(
            88deg,
            rgba(167, 243, 208, 0.2) 0 4px,
            transparent 5px 18px
          );
          transform: perspective(500px) rotateX(58deg);
          transform-origin: bottom;
        }

        .bonicam-sun {
          position: absolute;
          top: 24px;
          left: 24px;
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(254, 240, 138, 0.16);
          color: #fde68a;
          box-shadow: 0 0 40px rgba(253, 230, 138, 0.22);
        }

        .bonicam-leaf-stack {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
        }

        .bonicam-leaf,
        .bonicam-wheat {
          position: absolute;
          color: rgba(167, 243, 208, 0.88);
          filter: drop-shadow(0 18px 32px rgba(0,0,0,0.22));
        }

        .bonicam-leaf-a {
          transform: translate(22px, -18px) rotate(-22deg);
        }

        .bonicam-leaf-b {
          color: rgba(181, 217, 65, 0.78);
          transform: translate(-54px, 28px) rotate(28deg);
        }

        .bonicam-wheat {
          color: rgba(255,255,255,0.82);
          transform: translate(34px, 82px) rotate(-10deg);
        }

        .bonicam-yield-badge {
          position: absolute;
          right: 1.25rem;
          bottom: 1.25rem;
          width: min(260px, calc(100% - 2.5rem));
          padding: 1rem 1.15rem;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 18px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          color: #fff;
        }

        .bonicam-yield-badge strong,
        .bonicam-yield-badge span {
          display: block;
        }

        .bonicam-yield-badge strong {
          font-size: 1.25rem;
          font-weight: 950;
        }

        .bonicam-yield-badge span {
          color: rgba(236, 253, 245, 0.82);
          font-size: 0.88rem;
          font-weight: 800;
          margin-top: 0.25rem;
        }

        .bonicam-benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin: 1.25rem 0;
        }

        .bonicam-benefit-card {
          min-height: 148px;
          padding: 1.2rem;
          border: 1px solid rgba(20, 90, 36, 0.12);
          border-radius: 20px;
          background: rgba(255,255,255,0.84);
          box-shadow: 0 16px 42px rgba(20, 90, 36, 0.08);
        }

        .bonicam-card-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin-bottom: 1rem;
          border-radius: 15px;
          background: #ecfdf5;
          color: #17803b;
        }

        .bonicam-benefit-card h3 {
          margin: 0;
          color: #13251b;
          font-size: 1rem;
          font-weight: 950;
          line-height: 1.55;
        }

        .bonicam-lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .bonicam-services-panel,
        .bonicam-irrigation-panel {
          padding: 1.6rem;
          border: 1px solid rgba(20, 90, 36, 0.12);
          border-radius: 24px;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 18px 48px rgba(20, 90, 36, 0.08);
        }

        .bonicam-panel-heading {
          margin-bottom: 1.2rem;
        }

        .bonicam-panel-heading span {
          display: block;
          margin-bottom: 0.35rem;
          color: #17803b;
          font-size: 0.82rem;
          font-weight: 950;
        }

        .bonicam-panel-heading h3 {
          margin: 0;
          color: #13251b;
          font-size: 1.35rem;
          font-weight: 950;
        }

        .bonicam-services-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .bonicam-service-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: 72px;
          padding: 0.9rem;
          border-radius: 16px;
          background: #f6fbf0;
          color: #145a24;
        }

        .bonicam-service-item strong {
          font-size: 0.92rem;
          font-weight: 950;
          line-height: 1.45;
        }

        .bonicam-irrigation-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .bonicam-irrigation-list li {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          align-items: center;
          gap: 0.8rem;
          min-height: 62px;
          padding: 0.8rem;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e7efe0;
        }

        .bonicam-irrigation-list span {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #145a24;
          color: #fff;
          font-weight: 950;
          direction: ltr;
        }

        .bonicam-irrigation-list p {
          margin: 0;
          color: #405145;
          font-size: 0.92rem;
          font-weight: 850;
          line-height: 1.55;
        }

        @media (max-width: 980px) {
          .bonicam-hero-card {
            grid-template-columns: 1fr;
          }

          .bonicam-visual {
            min-height: 300px;
          }

          .bonicam-benefits-grid,
          .bonicam-lower-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .bonicam-home-section {
            padding: 4rem 0 3.25rem;
          }

          .bonicam-container {
            padding: 0 1rem;
          }

          .bonicam-hero-card {
            gap: 1.25rem;
            padding: 1.2rem;
            border-radius: 22px;
          }

          .bonicam-copy h2 {
            font-size: clamp(1.9rem, 9vw, 2.45rem);
          }

          .bonicam-copy p {
            font-size: 0.95rem;
            line-height: 1.75;
          }

          .bonicam-performance-strip {
            gap: 0.5rem;
          }

          .bonicam-performance-strip span {
            font-size: 0.78rem;
            padding: 0.48rem 0.68rem;
          }

          .bonicam-cta {
            width: 100%;
          }

          .bonicam-visual {
            min-height: 250px;
            border-radius: 20px;
          }

          .bonicam-benefits-grid,
          .bonicam-lower-grid,
          .bonicam-services-grid {
            grid-template-columns: 1fr;
          }

          .bonicam-benefit-card {
            min-height: 112px;
          }

          .bonicam-services-panel,
          .bonicam-irrigation-panel {
            padding: 1.1rem;
            border-radius: 20px;
          }

          .bonicam-irrigation-list li {
            grid-template-columns: 38px minmax(0, 1fr);
            gap: 0.65rem;
          }

          .bonicam-irrigation-list span {
            width: 36px;
            height: 36px;
            font-size: 0.82rem;
          }
        }
      `}</style>
    </section>
  );
};

export default BonicamHomeSection;
