import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.warn('[standalone] Skipping asset copy because .next/standalone was not created.');
  process.exit(0);
}

const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};

copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));
copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

const waJsBundle = path.join(root, 'node_modules', '@wppconnect', 'wa-js', 'dist', 'wppconnect-wa.js');
if (fs.existsSync(waJsBundle)) {
  const waJsTarget = path.join(standaloneDir, '.wajs', 'wppconnect-wa.js');
  fs.mkdirSync(path.dirname(waJsTarget), { recursive: true });
  fs.copyFileSync(waJsBundle, waJsTarget);
}

console.log('[standalone] Copied public, static assets and the WhatsApp delivery engine into .next/standalone.');
