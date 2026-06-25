const fs = require('fs');
const path = './src/app/agri_styles.css';

const cssToAppend = `

/* ==========================================================================
   INTERACTIVE POINTED GRASS FIELD
   ========================================================================== */

.grass-field-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 25vh; /* Adjustable height for grass */
  min-height: 200px;
  z-index: 2;
  overflow: visible; /* Let grass blades sway outside container if needed */
  pointer-events: none; /* Let clicks pass through empty spaces */
  transform: translateY(100%);
  animation: slideUpGrass 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
}

.grass-field-gradient-base {
  position: absolute;
  bottom: -20px;
  left: -5%;
  width: 110%;
  height: 60px;
  background: linear-gradient(to top, #064e3b, transparent);
  z-index: 5;
  filter: blur(5px);
}

.grass-blade-interactive {
  position: absolute;
  bottom: -10px; /* Hide the flat bottom base */
  transform-origin: bottom center;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%); /* Perfect pointed grass blade */
  animation: swayGrass ease-in-out infinite alternate;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s;
  pointer-events: auto; /* Enable hover on actual blades */
  cursor: crosshair;
}

.grass-blade-interactive:hover {
  transform: rotate(var(--hover-sway)) scaleY(1.1) scaleX(1.5) !important;
  background-color: #4ade80 !important;
  z-index: 10 !important;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5); /* Slight glow on hover */
}

@keyframes swayGrass {
  0% { transform: rotate(calc(var(--sway) * -1)); }
  100% { transform: rotate(var(--sway)); }
}
`;

fs.appendFileSync(path, cssToAppend, 'utf8');
console.log('Appended interactive grass CSS');
