import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ArrowLeft, Play, ShieldCheck, TrendingUp, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DEFAULT_SITE_SETTINGS } from '../lib/homeSettings';
import { normalizeMediaUrl } from '../lib/mediaUtils';

const CountUp = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const spanRef = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOut * end);
      
      if (spanRef.current) {
        spanRef.current.innerText = `${prefix}${currentCount.toLocaleString('ar-EG')}${suffix}`;
      }

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, prefix, suffix]);

  return <span ref={spanRef}>{prefix}0{suffix}</span>;
};

/* ════════════════════════════════════════════════════════════
   Canvas Grass — Real Spring Physics, Wind Waves, Mouse Force
   ════════════════════════════════════════════════════════════ */
const GrassField = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Hi-DPI support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Deterministic pseudo-random
    const hash = (i) => ((i * 2654435761 + 374761393) >>> 0) / 4294967296;

    // ── Generate blades ──
    const BLADE_COUNT = Math.min(Math.floor(W / 5), 200);
    const blades = [];
    for (let i = 0; i < BLADE_COUNT; i++) {
      const t = i / BLADE_COUNT;
      const r1 = hash(i), r2 = hash(i + 500), r3 = hash(i + 1000);
      const r4 = hash(i + 1500), r5 = hash(i + 2000), r6 = hash(i + 2500);

      // Natural clustering with slight randomness
      const x = t * W + (r1 - 0.5) * (W / BLADE_COUNT) * 1.5;
      const heightBase = H * 0.1 + r2 * H * 0.25; // very short grass
      const width = 2 + r3 * 5; // blade width at base

      // Depth layers (further back = darker, taller, less sway)
      const layer = r4 < 0.3 ? 0 : r4 < 0.65 ? 1 : 2;
      const layerScale = [0.6, 0.8, 1.0][layer];
      const layerBright = [0.45, 0.7, 1.0][layer];

      // Natural green palette
      const hue = 105 + r5 * 35;          // 105–140
      const sat = 45 + r5 * 35;           // 45–80%
      const lightBase = 18 + r6 * 18;     // 18–36%
      const lightTip = lightBase + 12 + r3 * 10;

      blades.push({
        x,
        height: heightBase * layerScale,
        width: width * layerScale,
        baseColor: `hsl(${hue},${sat}%,${lightBase * layerBright}%)`,
        tipColor: `hsl(${hue + 8},${sat + 8}%,${lightTip * layerBright}%)`,
        angle: 0,
        velocity: 0,
        windPhase: r1 * Math.PI * 2,
        stiffness: 0.015 + r2 * 0.025,       // how fast it returns
        damping: 0.88 + r3 * 0.07,            // how quickly oscillation dies
        curvature: 0.3 + r4 * 0.5,            // how much it curves vs straight bend
        layer,
      });
    }

    // Sort back-to-front
    blades.sort((a, b) => a.layer - b.layer);

    // ── Animation loop ──
    let time = 0;
    let lastTs = performance.now();

    const frame = (ts) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05); // cap delta
      lastTs = ts;
      time += dt * 0.3; // Slowed down grass wind movement

      ctx.clearRect(0, 0, W, H);

      const mouse = mouseRef.current;

      for (let i = 0; i < blades.length; i++) {
        const b = blades[i];

        // ── Wind: multi-frequency sine for organic feel ──
        const windMain = Math.sin(time * 1.2 + b.windPhase + b.x * 0.005) * 0.25;
        const windGust = Math.sin(time * 2.8 + b.windPhase * 1.5 + b.x * 0.01) * 0.08;
        const wind = windMain + windGust;

        // ── Mouse force: radial push with smooth falloff ──
        let mouseForce = 0;
        if (mouse.active) {
          const dx = mouse.x - b.x;
          const dy = mouse.y - H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 250; // wider reach
          if (dist < radius) {
            const strength = Math.pow(1 - dist / radius, 1.5); // smoother falloff
            mouseForce = Math.sign(dx) * strength * -3.5; // much stronger push
          }
        }

        // ── Spring physics ──
        const target = wind + mouseForce;
        const force = (target - b.angle) * b.stiffness;
        b.velocity += force;
        b.velocity *= b.damping;
        b.angle += b.velocity;
        b.angle = Math.max(-1.4, Math.min(1.4, b.angle));

        // ── Draw blade as tapered bezier curve ──
        const baseX = b.x;
        const baseY = H;
        const h = b.height;
        const ang = b.angle;
        const curve = b.curvature;

        // Control points for a natural curve
        const cp1x = baseX + Math.sin(ang * 0.3) * h * 0.35;
        const cp1y = baseY - h * 0.35;
        const cp2x = baseX + Math.sin(ang * 0.7) * h * 0.7;
        const cp2y = baseY - h * 0.7;
        const tipX = baseX + Math.sin(ang) * h;
        const tipY = baseY - Math.cos(ang * 0.3) * h;

        // Blade width tapers from base to tip
        const halfW = b.width / 2;

        // Gradient
        const grad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
        grad.addColorStop(0, b.baseColor);
        grad.addColorStop(0.6, b.tipColor);
        grad.addColorStop(1, b.tipColor);

        // Left edge
        ctx.beginPath();
        ctx.moveTo(baseX - halfW, baseY);
        ctx.bezierCurveTo(
          cp1x - halfW * 0.7, cp1y,
          cp2x - halfW * 0.3, cp2y,
          tipX, tipY
        );
        // Right edge (back down)
        ctx.bezierCurveTo(
          cp2x + halfW * 0.3, cp2y,
          cp1x + halfW * 0.7, cp1y,
          baseX + halfW, baseY
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();

    const handleResize = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      init();
    };
    window.addEventListener('resize', handleResize);

    const canvas = canvasRef.current;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };

    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-grass-canvas"
      style={{
        position: 'absolute',
        left: 0,
        width: '100%',
        zIndex: 5,
        pointerEvents: 'auto',
      }}
    />
  );
};

/* ════════════════════════════════════════════════════
   Hero Section
   ════════════════════════════════════════════════════ */
const Hero = ({ setCurrentPage }) => {
  const { t } = useLanguage();
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

  const heroImage = normalizeMediaUrl(settings.hero_image || DEFAULT_SITE_SETTINGS.hero_image);
  const heroTitle = settings.hero_title || DEFAULT_SITE_SETTINGS.hero_title;
  const heroDesc = settings.hero_desc || DEFAULT_SITE_SETTINGS.hero_desc;

  return (
    <>
      <style>{`
        .elite-hero-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background-color: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -120px;
          margin-bottom: 25px; /* Reserve space for the floating stats bar */
        }

        .hero-grass-canvas {
          bottom: 90px;
          height: 18%;
        }

        .elite-hero-bg-wrapper {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .elite-hero-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform: translateZ(0);
          will-change: transform;
          animation: slowZoom 25s ease-in-out infinite alternate;
        }

        .elite-hero-bg-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center 45%;
          opacity: 0.86;
          filter: saturate(1.12) contrast(1.05);
        }

        @keyframes slowZoom {
          0%   { transform: scale(1.0) translateZ(0); }
          100% { transform: scale(1.06) translateZ(0); }
        }

        .elite-overlay {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(
            180deg,
            rgba(2,6,23,0.18) 0%,
            rgba(2,6,23,0.48) 48%,
            rgba(2,6,23,0.88) 100%
          );
          z-index: 1;
        }

        .elite-content-wrapper {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .elite-title {
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 900;
          color: white;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          white-space: nowrap;
          text-shadow: 0 8px 25px rgba(0,0,0,0.5);
        }

        .elite-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          color: #d1fae5;
          background: rgba(16, 185, 129, 0.16);
          border: 1px solid rgba(167, 243, 208, 0.26);
          border-radius: 999px;
          padding: 0.55rem 1.15rem;
          margin-bottom: 1.25rem;
          font-size: 0.95rem;
          font-weight: 800;
          backdrop-filter: blur(14px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
        }

        .elite-gradient-text {
          background: linear-gradient(135deg, #34d399, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          padding: 0 15px 15px 15px;
          margin-bottom: -15px;
        }

        .elite-desc {
          font-size: 1.2rem;
          color: #cbd5e1;
          max-width: 800px;
          line-height: 1.8;
          margin-bottom: 3rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.7);
        }

        .elite-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .elite-btn-primary {
          background: #10b981;
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          display: flex; align-items: center; gap: 0.8rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(16,185,129,0.3);
        }
        .elite-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(16,185,129,0.4);
          background: #059669;
        }

        /* ── Premium Stats Bar ── */
        .elite-stats-bar {
          position: absolute;
          bottom: 0; left: 0; width: 100%;
          background: rgba(2, 6, 23, 0.5);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          z-index: 6;
          padding: 0;
          transform: translateY(25px); /* Move it down out of the hero, but slightly less than before */
        }

        .stats-grid {
          max-width: 1400px;
          margin: 0 auto; 
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .elite-stat-item {
          display: flex; 
          align-items: center;
          justify-content: center; 
          gap: 1.2rem;
          padding: 2rem 1.5rem;
          position: relative;
          transition: all 0.3s;
        }

        .elite-stat-item:hover {
          background: rgba(255,255,255,0.02);
        }

        /* Subtle dividers between items */
        .elite-stat-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 0; top: 25%; height: 50%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
        }

        .stat-icon-wrapper {
          width: 55px; height: 55px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.05) 100%);
          border: 1px solid rgba(52, 211, 153, 0.2);
          color: #34d399;
          display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
          box-shadow: 0 0 20px rgba(16,185,129,0.1);
        }

        .stat-icon-wrapper svg {
          width: 26px; height: 26px;
        }

        .stat-info { text-align: right; }
        .stat-info h4 { 
          font-size: 2.2rem; 
          font-weight: 900; 
          margin: 0 0 0.2rem; 
          background: linear-gradient(to right, #ffffff, #a7f3d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
          direction: ltr; /* Ensure numbers and +/% align properly */
          display: inline-block;
        }
        .stat-info p  { 
          color: #94a3b8; 
          font-size: 0.95rem; 
          margin: 0; 
          font-weight: 600; 
          letter-spacing: 0.2px;
        }

        @media (max-width: 1024px) {
          .elite-title { font-size: 3rem; }
          .stats-grid  { grid-template-columns: repeat(2,1fr); }
          .elite-stat-item:nth-child(2)::after { display: none; } /* Remove divider for grid wrap */
        }

        @media (max-width: 768px) {
          .elite-hero-bg-wrapper {
            top: -50px;
            height: calc(100% + 100px);
          }
          .elite-overlay {
            background: linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.8));
            height: 100%;
          }
          .elite-hero-container { 
            flex-direction: column; 
            min-height: auto; 
            padding-top: 120px; 
            margin-top: -120px;
          }
          .elite-content-wrapper { padding-top: 120px; padding-bottom: 300px; flex: 1; justify-content: center; display: flex; flex-direction: column; align-items: center; }
          .elite-title { font-size: 2rem; white-space: normal; }
          .elite-actions { flex-direction: column; width: 100%; align-items: center; gap: 0.5rem; margin-top: 1rem; }
          .elite-btn-primary { width: auto; min-width: 240px; padding: 1rem 1.5rem; font-size: 0.9rem; justify-content: center; }
          .elite-hero-container { margin-bottom: 100px !important; }
          .hero-grass-canvas { bottom: -5px; height: 150px; }
          .elite-overlay {
            background: linear-gradient(180deg, rgba(2,6,23,0.72) 0%, rgba(2,6,23,0.8) 50%, rgba(2,6,23,0.95) 100%);
          }
          .elite-stats-bar { position: absolute; background: #020617; padding: 0; border-top: none; width: 100%; bottom: 0; transform: translateY(100%); margin-top: 0; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid rgba(255,255,255,0.05); }
          .elite-stat-item { 
            padding: 1.2rem 0.2rem; 
            justify-content: center; 
            align-items: center;
            border-bottom: none; 
            flex-direction: column; 
            text-align: center; 
            gap: 0.5rem;
          }
          .elite-stat-item:not(:last-child) { border-left: 1px solid rgba(255,255,255,0.05); }
          .elite-stat-item::after { display: none; }
          .stat-icon-wrapper { width: 34px; height: 34px; margin: 0 auto; }
          .stat-icon-wrapper svg { width: 16px; height: 16px; }
          .stat-info { text-align: center; width: 100%; }
          .stat-info h4 { font-size: 1rem; margin-bottom: 0.1rem; }
          .stat-info p { font-size: 0.65rem; line-height: 1.2; }
        }
      `}</style>

      <div className="elite-hero-container">
        <div className="elite-hero-bg-wrapper">
          <div className="elite-hero-bg">
            <img
              src={heroImage}
              alt=""
              className="elite-hero-bg-img"
              onError={(event) => {
                const fallback = normalizeMediaUrl(DEFAULT_SITE_SETTINGS.hero_image);
                if (event.currentTarget.src.endsWith(fallback)) return;
                event.currentTarget.src = fallback;
              }}
            />
          </div>
          <div className="elite-overlay"></div>
          <GrassField />
        </div>

        <div className="elite-content-wrapper">
          <h1 className="elite-title" dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p className="elite-desc" dangerouslySetInnerHTML={{ __html: heroDesc }} />
          <div className="elite-actions">
            <button
              className="elite-btn-primary"
              onClick={() => { if (setCurrentPage) { setCurrentPage('booking'); window.scrollTo(0,0); } }}
            >
              {t('hero.elitePrimaryCta')} <ArrowLeft size={20} />
            </button>
          </div>
        </div>
          <div className="elite-stats-bar">
          <div className="stats-grid">
            <div className="elite-stat-item">
              <div className="stat-icon-wrapper"><Award size={24} /></div>
              <div className="stat-info"><h4><CountUp end={15} prefix="+" duration={2000} /></h4><p>{settings.ticker_text_1 || t('hero.eliteStatYears')}</p></div>
            </div>
            <div className="elite-stat-item">
              <div className="stat-icon-wrapper"><TrendingUp size={24} /></div>
              <div className="stat-info"><h4><CountUp end={50000} prefix="+" duration={2500} /></h4><p>{settings.ticker_text_2 || t('hero.eliteStatTons')}</p></div>
            </div>
            <div className="elite-stat-item">
              <div className="stat-icon-wrapper"><ShieldCheck size={24} /></div>
              <div className="stat-info"><h4><CountUp end={100} suffix="%" duration={2200} /></h4><p>{settings.ticker_text_3 || t('hero.eliteStatQuality')}</p></div>
            </div>
            <div className="elite-stat-item">
              <div className="stat-icon-wrapper"><ArrowLeft size={24} /></div>
              <div className="stat-info"><h4><CountUp end={500} prefix="+" duration={2300} /></h4><p>{settings.ticker_text_4 || t('hero.eliteStatClients')}</p></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
