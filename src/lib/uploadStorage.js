import fs from 'fs';
import path from 'path';

const addCandidate = (candidates, dir) => {
  if (!dir) return;
  const resolved = path.resolve(dir);
  if (!candidates.includes(resolved)) candidates.push(resolved);
};

const defaultPersistentUploadDir = '/data/uploads';

export function getUploadDirCandidates() {
  const candidates = [];
  const cwd = process.cwd();
  const isStandaloneCwd = path.basename(cwd) === 'standalone' && path.basename(path.dirname(cwd)) === '.next';

  addCandidate(candidates, process.env.UPLOAD_DIR);
  addCandidate(candidates, defaultPersistentUploadDir);
  addCandidate(candidates, '/mnt/data/uploads');
  addCandidate(candidates, '/app/data/uploads');
  addCandidate(candidates, path.join(cwd, 'public', 'uploads'));
  addCandidate(candidates, path.join(cwd, '.next', 'standalone', 'public', 'uploads'));
  if (isStandaloneCwd) {
    addCandidate(candidates, path.resolve(cwd, '..', '..', 'public', 'uploads'));
  }
  addCandidate(candidates, '/app/public/uploads');
  addCandidate(candidates, '/app/.next/standalone/public/uploads');

  return candidates;
}

export function getWritableUploadsDir() {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }

  if (process.env.NODE_ENV === 'production') {
    return path.resolve(defaultPersistentUploadDir);
  }

  const candidates = getUploadDirCandidates();
  const existing = candidates.find((dir) => {
    try {
      return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch {
      return false;
    }
  });

  return existing || path.join(process.cwd(), 'public', 'uploads');
}

export function resolveUploadedFile(filename) {
  const relativeName = String(filename || '').replace(/^[/\\]+/, '');
  if (!relativeName || relativeName.includes('\0')) return null;

  for (const uploadsDir of getUploadDirCandidates()) {
    const filePath = path.resolve(uploadsDir, relativeName);
    if (filePath !== uploadsDir && !filePath.startsWith(`${uploadsDir}${path.sep}`)) {
      continue;
    }

    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return { uploadsDir, filePath };
      }
    } catch {
      // Try the next candidate path.
    }
  }

  return null;
}

export async function writeUploadedFile(filename, buffer) {
  const primaryDir = getWritableUploadsDir();
  const primaryPath = path.join(primaryDir, filename);

  await fs.promises.mkdir(primaryDir, { recursive: true });
  await fs.promises.writeFile(primaryPath, buffer);

  const mirrors = getUploadDirCandidates()
    .filter((dir) => dir !== primaryDir)
    .filter((dir) => {
      try {
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
      } catch {
        return false;
      }
    });

  await Promise.allSettled(
    mirrors.map(async (dir) => {
      const mirrorPath = path.join(dir, filename);
      await fs.promises.writeFile(mirrorPath, buffer);
    })
  );

  return primaryPath;
}
