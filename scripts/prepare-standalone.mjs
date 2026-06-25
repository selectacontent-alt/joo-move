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

console.log('[standalone] Copied public and static assets into .next/standalone.');
