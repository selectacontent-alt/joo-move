const fs = require('fs');
const path = './src/app/agri_styles.css';

const cssToAppend = `

/* ==========================================================================
   IMMERSIVE HERO ANIMATION (Grass & Sky)
   ========================================================================== */

.immersive-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #051408; /* Dark base before sky loads */
}

/* Sky layer */
.hero-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  opacity: 0;
  animation: fadeInSky 1.5s ease-in-out 0.8s forwards;
  z-index: 1;
}

.hero-sky::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%);
}

/* Grass layer (Geometric Professional Design) */
.hero-grass-geo {
  position: absolute;
  bottom: -5vh;
  left: -5%;
  width: 110%;
  height: 35vh;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(21, 128, 61, 0.95));
  clip-path: polygon(0 25%, 100% 0, 100% 100%, 0 100%);
  transform: translateY(100%);
  animation: slideUpGrass 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
  z-index: 2;
  box-shadow: inset 0 10px 30px rgba(0,0,0,0.3);
}

.hero-grass-geo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 5vh;
}

.hero-title-main {
  font-size: clamp(2.5rem, 6vw, 5.5rem);
  font-weight: 900;
  margin: 0;
  opacity: 0;
  transform: translateY(40px);
  animation: fadeUpText 1s ease-out 1.8s forwards;
  text-shadow: 0 5px 25px rgba(0,0,0,0.6);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-subtitle-main {
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 600;
  margin: 0;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeUpText 1s ease-out 2.5s forwards;
  color: #f1f5f9;
  text-shadow: 0 3px 15px rgba(0,0,0,0.6);
}

.hero-btn-wrapper {
  margin-top: 2rem;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeUpText 1s ease-out 3.2s forwards;
}

.hero-btn-explore {
  background: var(--primary-color);
  color: white;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-size: 1.3rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(22, 101, 52, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.hero-btn-explore:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(22, 101, 52, 0.7);
  background: #166534;
  border-color: rgba(255,255,255,0.2);
}

@keyframes slideUpGrass {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}

@keyframes fadeInSky {
  0% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fadeUpText {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

fs.appendFileSync(path, cssToAppend, 'utf8');
console.log('Appended immersive hero CSS');
