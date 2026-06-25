import fs from 'fs';
import path from 'path';

const CHROMIUM_COMMANDS = process.platform === 'win32'
  ? ['chrome.exe', 'msedge.exe']
  : ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'];

const COMMON_CHROMIUM_PATHS = process.platform === 'win32'
  ? [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ]
  : [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable'
    ];

let cachedExecutablePath;
let hasResolvedExecutablePath = false;

function readPositiveIntEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function findExecutableOnPath(command) {
  const pathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);

  for (const entry of pathEntries) {
    const candidate = path.join(entry, command);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function resolveChromiumExecutablePath() {
  if (hasResolvedExecutablePath) {
    return cachedExecutablePath;
  }

  hasResolvedExecutablePath = true;

  const configuredPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (configuredPath && fs.existsSync(configuredPath)) {
    cachedExecutablePath = configuredPath;
    return cachedExecutablePath;
  }

  if (configuredPath) {
    console.warn(`PUPPETEER_EXECUTABLE_PATH does not exist: ${configuredPath}. Searching for Chromium on PATH.`);
  }

  for (const command of CHROMIUM_COMMANDS) {
    const executablePath = findExecutableOnPath(command);
    if (executablePath) {
      cachedExecutablePath = executablePath;
      return cachedExecutablePath;
    }
  }

  cachedExecutablePath = COMMON_CHROMIUM_PATHS.find((candidate) => fs.existsSync(candidate));
  return cachedExecutablePath;
}


export function getPuppeteerLaunchOptions(extraArgs = []) {
  const executablePath = resolveChromiumExecutablePath();
  const protocolTimeout = readPositiveIntEnv('PUPPETEER_PROTOCOL_TIMEOUT_MS', 900000);
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--disable-extensions',
    '--disable-software-rasterizer',
    '--mute-audio',
    '--disable-background-networking',
    ...extraArgs
  ];

  return {
    headless: true,
    protocolTimeout,
    timeout: protocolTimeout,
    ...(executablePath ? { executablePath } : {}),
    args: [...new Set(args)]
  };
}
