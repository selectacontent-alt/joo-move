import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const removeInsideRoot = (relativePath) => {
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(root + path.sep)) {
    throw new Error(`Refusing to remove path outside project: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`[prune] Removed ${relativePath}`);
};

if (!fs.existsSync(path.join(root, '.next', 'standalone', 'server.js'))) {
  throw new Error('Standalone server was not found. Run npm run build before pruning.');
}

removeInsideRoot('node_modules');
removeInsideRoot(path.join('.next', 'cache'));
removeInsideRoot('.wwebjs_cache');
