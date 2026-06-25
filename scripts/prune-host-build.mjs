import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const isLockedMountError = (error) => error?.code === 'EBUSY' || error?.code === 'ENOTEMPTY';

const removeInsideRoot = (relativePath, options = {}) => {
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(root + path.sep)) {
    throw new Error(`Refusing to remove path outside project: ${target}`);
  }
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[prune] Removed ${relativePath}`);
  } catch (error) {
    if (options.skipLocked && isLockedMountError(error)) {
      console.warn(`[prune] Skipped locked mount: ${relativePath}`);
      return;
    }
    throw error;
  }
};

const removeNodeModulesExceptMountedCache = () => {
  const nodeModules = path.join(root, 'node_modules');
  if (!fs.existsSync(nodeModules)) return;

  for (const entry of fs.readdirSync(nodeModules)) {
    const relativePath = path.join('node_modules', entry);
    try {
      removeInsideRoot(relativePath);
    } catch (error) {
      if (entry === '.cache' && isLockedMountError(error)) {
        console.warn('[prune] Skipped locked node_modules/.cache mount.');
        continue;
      }
      throw error;
    }
  }

  try {
    removeInsideRoot('node_modules');
  } catch (error) {
    if (isLockedMountError(error)) {
      console.warn('[prune] Kept node_modules shell because a build cache mount is locked.');
      return;
    }
    throw error;
  }
};

if (!fs.existsSync(path.join(root, '.next', 'standalone', 'server.js'))) {
  throw new Error('Standalone server was not found. Run npm run build before pruning.');
}

removeNodeModulesExceptMountedCache();
removeInsideRoot(path.join('.next', 'cache'), { skipLocked: true });
removeInsideRoot('.wwebjs_cache', { skipLocked: true });
