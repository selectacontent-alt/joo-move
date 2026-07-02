import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';

import fs from 'fs';
import path from 'path';
import { getPuppeteerLaunchOptions, resolveChromiumExecutablePath } from './puppeteerConfig';

const DEFAULT_AUTH_FOLDER = '.wwebjs_auth';
const DEFAULT_QUEUE_FOLDER = '.wwebjs_queue';
const QUEUE_FILE_NAME = 'messages.json';
const DEFAULT_CLIENT_ID = 'al-rehab-client';

const QUEUE_MIN_DELAY_MS = readPositiveIntEnv('WHATSAPP_QUEUE_MIN_DELAY_MS', 5000);
const QUEUE_MAX_DELAY_MS = Math.max(
  QUEUE_MIN_DELAY_MS,
  readPositiveIntEnv('WHATSAPP_QUEUE_MAX_DELAY_MS', 10000)
);
const SEND_TASK_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_SEND_TASK_TIMEOUT_MS', 30000);
const NUMBER_LOOKUP_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_NUMBER_LOOKUP_TIMEOUT_MS', 4000);
const NUMBER_VALIDATION_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_NUMBER_VALIDATION_TIMEOUT_MS', 3000);
const AUTH_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_AUTH_TIMEOUT_MS', 900000);
const RELINK_RETRY_DELAY_MS = readPositiveIntEnv('WHATSAPP_RELINK_RETRY_DELAY_MS', 5000);
const CLIENT_DESTROY_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_CLIENT_DESTROY_TIMEOUT_MS', 15000);
const PAIRING_CODE_INTERVAL_MS = readPositiveIntEnv('WHATSAPP_PAIRING_CODE_INTERVAL_MS', 180000);
const MAX_LIFECYCLE_TRANSIENT_RETRIES = 1;
const MAX_TRANSIENT_RETRIES = readNonNegativeIntEnv('WHATSAPP_MAX_TRANSIENT_RETRIES', 0);
const VERIFY_NUMBER_BEFORE_SEND = true;
const CLOCK_EMOJI = '\u{1F552}';

if (!global.whatsappState) {
  global.whatsappState = {
    client: null,
    status: 'DISCONNECTED',
    isInitialized: false
  };
}

const state = global.whatsappState;
state.messageQueue = Array.isArray(state.messageQueue) ? state.messageQueue : [];
state.isProcessingQueue = Boolean(state.isProcessingQueue);
state.queueLoaded = Boolean(state.queueLoaded);
state.queueTimer = state.queueTimer || null;
state.queueTimerDueAt = state.queueTimerDueAt || 0;
state.isRestarting = Boolean(state.isRestarting);
state.clientOperationChain = state.clientOperationChain || Promise.resolve();
state.manualLogout = Boolean(state.manualLogout);
state.nextInitializeAt = Number.isFinite(Number(state.nextInitializeAt)) ? Number(state.nextInitializeAt) : 0;
state.lastInitError = state.lastInitError || null;
state.isRequestingPairingCode = Boolean(state.isRequestingPairingCode);
state.pairingPhoneNumber = state.pairingPhoneNumber || null;
state.pairingCode = state.pairingCode || null;
state.pairingCodeIssuedAt = Number(state.pairingCodeIssuedAt) || 0;
state.lifecycleChain = state.lifecycleChain || Promise.resolve();
state.lifecycleGeneration = Number(state.lifecycleGeneration) || 0;
state.lifecyclePhase = state.lifecyclePhase || 'IDLE';
state.retryTimer = state.retryTimer || null;
state.transientRestartCount = Number(state.transientRestartCount) || 0;
state.browserExecutablePath = state.browserExecutablePath || null;


function readPositiveIntEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readNonNegativeIntEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error) {
  return error?.message || String(error || '');
}

function getWhatsappClientId() {
  const rawClientId = String(process.env.WHATSAPP_CLIENT_ID || DEFAULT_CLIENT_ID).trim();
  const safeClientId = rawClientId
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  const clientId = safeClientId || DEFAULT_CLIENT_ID;

  if (rawClientId !== clientId) {
    console.warn(`[WhatsApp] Sanitized WHATSAPP_CLIENT_ID to "${clientId}". Only letters, numbers, underscores and hyphens are allowed.`);
  }

  return clientId;
}

function isAuthTimeoutMessage(message) {
  return /auth timeout/i.test(String(message || ''));
}

function isLogoutDisconnectReason(reason) {
  return /LOGOUT|UNPAIRED|UNPAIRED_IDLE/i.test(String(reason || ''));
}

function isTransientBrowserMessage(message) {
  return /Execution context was destroyed|Target closed|Session closed|Protocol error/i.test(String(message || ''));
}

function getDataBaseDir() {
  return process.env.WHATSAPP_DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
}

function ensureWritableDir(preferredDir, fallbackDir, label) {
  const candidates = [...new Set([preferredDir, fallbackDir].filter(Boolean))];

  for (const candidate of candidates) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK);
      return candidate;
    } catch (error) {
      console.warn(`[WhatsApp] ${label} directory is not writable: ${candidate}`, error.message);
    }
  }

  throw new Error(`No writable ${label} directory was found.`);
}

function getAuthDir() {
  const preferred = process.env.WHATSAPP_AUTH_DIR || path.join(getDataBaseDir(), DEFAULT_AUTH_FOLDER);
  const fallback = path.join(process.cwd(), DEFAULT_AUTH_FOLDER);
  return ensureWritableDir(preferred, fallback, 'auth');
}

function getQueueFilePath() {
  const preferred = process.env.WHATSAPP_QUEUE_DIR || path.join(getDataBaseDir(), DEFAULT_QUEUE_FOLDER);
  const fallback = path.join(process.cwd(), DEFAULT_QUEUE_FOLDER);
  const queueDir = ensureWritableDir(preferred, fallback, 'queue');
  return path.join(queueDir, QUEUE_FILE_NAME);
}

function normalizeInvoicePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const orderId = payload.orderId ?? payload.id;
  if (!orderId) {
    return null;
  }

  return {
    orderId,
    customerName: String(payload.customerName || ''),
    customerPhone: String(payload.customerPhone || ''),
    total: payload.total ?? 0,
    products: Array.isArray(payload.products) ? payload.products : [],
    notes: payload.notes ? String(payload.notes) : '',
    customerAddress: payload.customerAddress ? String(payload.customerAddress) : ''
  };
}

function normalizePersistedTask(task) {
  if (!task || typeof task !== 'object' || !task.number || !task.message) {
    return null;
  }

  const now = Date.now();
  return {
    id: task.id || createTaskId(),
    number: String(task.number),
    message: String(task.message),
    mediaUrl: task.mediaUrl || null,
    dedupeKey: task.dedupeKey ? String(task.dedupeKey) : null,
    invoicePayload: normalizeInvoicePayload(task.invoicePayload),
    attempts: Number.isFinite(Number(task.attempts)) ? Number(task.attempts) : 0,
    createdAt: Number.isFinite(Number(task.createdAt)) ? Number(task.createdAt) : now,
    availableAt: Number.isFinite(Number(task.availableAt)) ? Number(task.availableAt) : now
  };
}

function serializeTask(task) {
  return {
    id: task.id,
    number: task.number,
    message: task.message,
    mediaUrl: task.mediaUrl || null,
    dedupeKey: task.dedupeKey || null,
    invoicePayload: normalizeInvoicePayload(task.invoicePayload),
    attempts: task.attempts || 0,
    createdAt: task.createdAt,
    availableAt: task.availableAt || Date.now()
  };
}

function ensureQueueLoaded() {
  const state = global.whatsappState;
  if (state.queueLoaded) return;

  state.queueFilePath = getQueueFilePath();

  try {
    if (fs.existsSync(state.queueFilePath)) {
      const persisted = JSON.parse(fs.readFileSync(state.queueFilePath, 'utf8'));
      const tasks = Array.isArray(persisted) ? persisted : [];
      const existingIds = new Set(state.messageQueue.map((task) => task.id));
      const restoredTasks = tasks
        .map(normalizePersistedTask)
        .filter((task) => task && !existingIds.has(task.id));

      state.messageQueue.push(...restoredTasks);

      if (restoredTasks.length > 0) {
        console.log(`[WhatsApp Queue] Restored ${restoredTasks.length} queued message(s) from disk.`);
      }
    }
  } catch (error) {
    console.error('[WhatsApp Queue] Failed to load persisted queue:', error);
  }

  state.queueLoaded = true;
}

function persistQueue() {
  const state = global.whatsappState;
  ensureQueueLoaded();

  try {
    const payload = JSON.stringify(state.messageQueue.map(serializeTask), null, 2);
    const tmpPath = `${state.queueFilePath}.tmp`;
    fs.writeFileSync(tmpPath, payload);
    fs.renameSync(tmpPath, state.queueFilePath);
  } catch (error) {
    console.error('[WhatsApp Queue] Failed to persist queue:', error);
  }
}

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildMessageWithTimestamp(message) {
  if (String(message || '').includes(CLOCK_EMOJI)) {
    return message;
  }

  if (String(message || '').includes('🕒')) {
    return message;
  }

  const now = new Date();
  const dateString = now.toLocaleDateString('ar-EG');
  const timeString = now.toLocaleTimeString('ar-EG', {
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });

  return `${message}\n\n\u{1F552} ${dateString} - ${timeString}`;
}

function clearPairingAttemptState() {
  const state = global.whatsappState;
  state.pairingPhoneNumber = null;
  state.pairingCode = null;
  state.pairingCodeIssuedAt = 0;
}

function scheduleQueue(delayMs = 0) {
  const state = global.whatsappState;
  const normalizedDelay = Math.max(0, delayMs);
  const dueAt = Date.now() + normalizedDelay;

  if (state.queueTimer && state.queueTimerDueAt <= dueAt) {
    return;
  }

  if (state.queueTimer) {
    clearTimeout(state.queueTimer);
  }

  state.queueTimerDueAt = dueAt;
  state.queueTimer = setTimeout(() => {
    state.queueTimer = null;
    state.queueTimerDueAt = 0;
    processQueue().catch((error) => {
      console.error('[WhatsApp Queue] Processor crashed:', error);
      scheduleQueue(5000);
    });
  }, normalizedDelay);
}

function clearBrowserLock(authDir, clientId) {
  const sessionDir = path.join(authDir, `session-${clientId}`);
  if (!fs.existsSync(sessionDir)) return;

  try {
    const lockFiles = fs.readdirSync(sessionDir).filter((name) => name.startsWith('Singleton'));
    for (const fileName of lockFiles) {
      fs.rmSync(path.join(sessionDir, fileName), { force: true, recursive: true, maxRetries: 5, retryDelay: 300 });
    }

    if (lockFiles.length > 0) {
      console.log(`Cleared ${lockFiles.length} WhatsApp browser lock file(s).`);
    }
  } catch (error) {
    console.warn('Could not delete WhatsApp browser lock files. If error persists, kill the stuck Chrome/Chromium process.');
  }
}

function killStuckBrowserForSession(authDir, clientId) {
  const sessionDir = path.resolve(authDir, `session-${clientId}`);
  try {
    if (process.platform === 'win32') {
      const safeClientId = String(clientId).replace(/'/g, '');
      require('child_process').execSync(
        `wmic process where "name='chrome.exe' and commandline like '%session-${safeClientId}%'" call terminate`,
        { stdio: 'ignore' }
      );
    } else {
      require('child_process').execFileSync('pkill', ['-9', '-f', sessionDir], { stdio: 'ignore' });
    }
    console.log('[WhatsApp] Stopped stuck browser process for auth session.');
  } catch (error) {
    if (error.status !== 1) {
      console.warn('[WhatsApp] Could not stop stuck browser process:', error.message);
    }
  }
}

function clearAuthSession(authDir, clientId) {
  const authRoot = path.resolve(authDir);
  const sessionDir = path.resolve(authRoot, `session-${clientId}`);

  if (!sessionDir.startsWith(`${authRoot}${path.sep}`)) {
    console.warn('[WhatsApp] Refusing to clear auth session outside auth root.');
    return;
  }

  try {
    fs.rmSync(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    console.log('[WhatsApp] Cleared local authentication session.');
  } catch (error) {
    console.warn('[WhatsApp] Could not clear failed auth session:', error.message);
  }
}

function hasStoredAuthSession() {
  const sessionDir = path.join(getAuthDir(), `session-${getWhatsappClientId()}`);
  try {
    return fs.existsSync(sessionDir) && fs.readdirSync(sessionDir).length > 0;
  } catch {
    return false;
  }
}

function maskPhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  if (digits.length < 6) return digits;
  return `${digits.slice(0, 3)}***${digits.slice(-4)}`;
}

function clearLifecycleTimer() {
  if (state.retryTimer) {
    clearTimeout(state.retryTimer);
    state.retryTimer = null;
  }
  state.nextInitializeAt = 0;
}

function runLifecycleOperation(label, operation) {
  const run = state.lifecycleChain.then(
    () => operation(),
    () => operation()
  );
  state.lifecycleChain = run.catch((error) => {
    console.error(`[WhatsApp Lifecycle] ${label} failed:`, getErrorMessage(error));
  });
  return run;
}

function isCurrentClient(client, generation) {
  return state.client === client && state.lifecycleGeneration === generation;
}

async function destroyClientLocked({ logout = false, killOnTimeout = true } = {}) {
  const client = state.client;
  const authDir = getAuthDir();
  const clientId = getWhatsappClientId();

  state.lifecycleGeneration += 1;
  state.client = null;
  state.isInitialized = false;
  state.clientOperationChain = Promise.resolve();

  if (!client) return;

  let timedOut = false;
  let shutdownTimer;
  try {
    await Promise.race([
      (async () => {
        if (logout) {
          try {
            await client.logout();
          } catch (error) {
            console.warn('[WhatsApp] Logout request failed; continuing with browser shutdown:', getErrorMessage(error));
          }
        }
        await client.destroy();
      })(),
      new Promise((_, reject) => {
        shutdownTimer = setTimeout(() => {
        timedOut = true;
        reject(new Error(`WhatsApp client shutdown timed out after ${CLIENT_DESTROY_TIMEOUT_MS}ms`));
        }, CLIENT_DESTROY_TIMEOUT_MS);
      })
    ]);
  } catch (error) {
    console.warn('[WhatsApp] Graceful client shutdown failed:', getErrorMessage(error));
    if (killOnTimeout && timedOut) {
      killStuckBrowserForSession(authDir, clientId);
      clearBrowserLock(authDir, clientId);
    }
  } finally {
    if (shutdownTimer) clearTimeout(shutdownTimer);
  }
}

function scheduleLifecycleRetryLocked(reason) {
  if (state.retryTimer || state.transientRestartCount >= MAX_LIFECYCLE_TRANSIENT_RETRIES) {
    state.status = 'ERROR';
    state.lifecyclePhase = 'ERROR';
    return;
  }

  state.transientRestartCount += 1;
  const delayMs = RELINK_RETRY_DELAY_MS * state.transientRestartCount;
  const pairingPhone = state.pairingPhoneNumber;
  state.status = 'RETRY_WAIT';
  state.lifecyclePhase = 'RETRY_WAIT';
  state.nextInitializeAt = Date.now() + delayMs;
  console.warn(`[WhatsApp] Retrying the same session in ${Math.round(delayMs / 1000)}s: ${reason}`);

  state.retryTimer = setTimeout(() => {
    state.retryTimer = null;
    state.nextInitializeAt = 0;
    runLifecycleOperation('transient retry', async () => {
      if (state.client) return;
      await startWhatsAppClientLocked({ pairingPhone });
    }).catch(() => {});
  }, delayMs);
  if (typeof state.retryTimer.unref === 'function') state.retryTimer.unref();
}

function handleClientFailure(error, client, generation) {
  const message = getErrorMessage(error);
  if (!isCurrentClient(client, generation)) return;

  console.error('WhatsApp Init Error:', message);
  runLifecycleOperation('client failure', async () => {
    if (!isCurrentClient(client, generation)) return;
    state.lastInitError = message;
    await destroyClientLocked();
    if (isTransientBrowserMessage(message) || isAuthTimeoutMessage(message)) {
      scheduleLifecycleRetryLocked(message);
    } else {
      state.status = 'ERROR';
      state.lifecyclePhase = 'ERROR';
    }
  }).catch(() => {});
}

async function startWhatsAppClientLocked({ pairingPhone = null } = {}) {
  ensureQueueLoaded();
  if (state.client || state.isInitialized) return;
  if (!pairingPhone && !hasStoredAuthSession()) {
    state.status = 'DISCONNECTED';
    state.lifecyclePhase = 'IDLE';
    return;
  }

  clearLifecycleTimer();
  const authDir = getAuthDir();
  const clientId = getWhatsappClientId();
  clearBrowserLock(authDir, clientId);

  let puppeteerOptions;
  try {
    puppeteerOptions = getPuppeteerLaunchOptions();
    state.browserExecutablePath = puppeteerOptions.executablePath;
  } catch (error) {
    state.status = 'ERROR';
    state.lifecyclePhase = 'BROWSER_MISSING';
    state.lastInitError = getErrorMessage(error);
    throw error;
  }

  const generation = state.lifecycleGeneration + 1;
  state.lifecycleGeneration = generation;
  state.isInitialized = true;
  state.isRestarting = false;
  state.status = 'INITIALIZING';
  state.lifecyclePhase = pairingPhone ? 'STARTING_PAIRING' : 'RESTORING_SESSION';
  state.lastInitError = null;
  state.pairingCode = null;
  state.pairingCodeIssuedAt = 0;

  console.log(`[WhatsApp Lifecycle ${generation}] Initializing ${pairingPhone ? 'phone pairing' : 'stored session'}...`);
  const client = new Client({
    authStrategy: new LocalAuth({ clientId, dataPath: authDir }),
    authTimeoutMs: AUTH_TIMEOUT_MS,
    qrMaxRetries: 0,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 0,
    ...(pairingPhone ? {
      pairWithPhoneNumber: {
        phoneNumber: pairingPhone,
        showNotification: true,
        intervalMs: PAIRING_CODE_INTERVAL_MS
      }
    } : {}),
    puppeteer: puppeteerOptions
  });
  state.client = client;

  client.on('code', (code) => {
    if (!isCurrentClient(client, generation)) return;
    state.status = 'PAIRING';
    state.lifecyclePhase = 'CODE_READY';
    state.pairingCode = String(code || '').trim();
    state.pairingCodeIssuedAt = Date.now();
    state.lastInitError = null;
    console.log(`[WhatsApp Lifecycle ${generation}] Pairing code generated.`);
  });

  client.on('qr', () => {
    if (!isCurrentClient(client, generation)) return;
    const error = new Error('Stored WhatsApp session requires relinking with a phone code.');
    state.status = 'AUTH_FAILURE';
    state.lifecyclePhase = 'RELINK_REQUIRED';
    state.lastInitError = error.message;
    runLifecycleOperation('reject QR fallback', async () => {
      if (isCurrentClient(client, generation)) await destroyClientLocked();
    }).catch(() => {});
  });

  client.on('authenticated', () => {
    if (!isCurrentClient(client, generation)) return;
    console.log(`[WhatsApp Lifecycle ${generation}] Authenticated.`);
    state.status = 'AUTHENTICATED';
    state.lifecyclePhase = 'AUTHENTICATED';
    state.lastInitError = null;
  });

  client.on('ready', () => {
    if (!isCurrentClient(client, generation)) return;
    console.log(`[WhatsApp Lifecycle ${generation}] Client ready.`);
    state.status = 'CONNECTED';
    state.lifecyclePhase = 'CONNECTED';
    state.lastInitError = null;
    state.transientRestartCount = 0;
    clearPairingAttemptState();
    scheduleQueue();
  });

  client.on('auth_failure', (message) => {
    if (!isCurrentClient(client, generation)) return;
    console.error(`[WhatsApp Lifecycle ${generation}] Authentication failure:`, message);
    runLifecycleOperation('authentication failure', async () => {
      if (!isCurrentClient(client, generation)) return;
      state.status = 'AUTH_FAILURE';
      state.lifecyclePhase = 'AUTH_FAILURE';
      state.lastInitError = String(message || 'WhatsApp authentication failed');
      await destroyClientLocked();
      clearAuthSession(authDir, clientId);
      clearPairingAttemptState();
    }).catch(() => {});
  });

  client.on('disconnected', (reason) => {
    if (!isCurrentClient(client, generation)) return;
    console.warn(`[WhatsApp Lifecycle ${generation}] Disconnected: ${reason}`);
    runLifecycleOperation('disconnect', async () => {
      if (!isCurrentClient(client, generation)) return;
      if (state.manualLogout || isLogoutDisconnectReason(reason)) {
        await destroyClientLocked({ killOnTimeout: false });
        state.manualLogout = false;
        state.status = 'DISCONNECTED';
        state.lifecyclePhase = 'IDLE';
        if (isLogoutDisconnectReason(reason)) clearAuthSession(authDir, clientId);
        clearPairingAttemptState();
        return;
      }

      state.lastInitError = `WhatsApp disconnected: ${reason}`;
      await destroyClientLocked();
      scheduleLifecycleRetryLocked(state.lastInitError);
    }).catch(() => {});
  });

  client.initialize().catch((error) => handleClientFailure(error, client, generation));
}

function registerShutdownHooks() {
  if (state.hasShutdownHooks) return;
  state.hasShutdownHooks = true;
  const shutdown = async (signal) => {
    console.log('\nShutting down WhatsApp gracefully...');
    clearLifecycleTimer();
    try {
      await destroyClientLocked({ killOnTimeout: true });
    } catch {}
    process.exit(signal === 'SIGINT' ? 130 : 0);
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

export function initializeWhatsApp(options = {}) {
  registerShutdownHooks();
  return runLifecycleOperation('initialize', async () => {
    if (state.client || state.isInitialized) return getCachedStatus();
    const pairingPhone = options.pairingPhone || state.pairingPhoneNumber || null;
    await startWhatsAppClientLocked({ pairingPhone });
    return getCachedStatus();
  });
}

export async function getStatus() {
  if (!state.client && !state.isInitialized && hasStoredAuthSession() && !state.pairingPhoneNumber) {
    try {
      await initializeWhatsApp();
    } catch (error) {
      console.warn('[WhatsApp] Stored session could not be started:', getErrorMessage(error));
    }
  }
  return getCachedStatus();
}

export function getCachedStatus() {
  const state = global.whatsappState;
  ensureQueueLoaded();
  const executablePath = state.browserExecutablePath || resolveChromiumExecutablePath() || null;

  return {
    status: state.status || 'DISCONNECTED',
    phase: state.lifecyclePhase || 'IDLE',
    lastInitError: state.lastInitError,
    retryInSeconds: state.nextInitializeAt > Date.now()
      ? Math.ceil((state.nextInitializeAt - Date.now()) / 1000)
      : 0,
    queuedMessages: state.messageQueue.length,
    isProcessingQueue: state.isProcessingQueue,
    isInitialized: state.isInitialized,
    isRestarting: Boolean(state.retryTimer) || state.isRestarting,
    pairing: {
      code: state.pairingCode || null,
      phoneMasked: maskPhoneNumber(state.pairingPhoneNumber),
      issuedAt: state.pairingCodeIssuedAt || null
    },
    browser: {
      ready: Boolean(executablePath),
      executablePath
    }
  };
}

export async function logout() {
  return runLifecycleOperation('logout', async () => {
    clearLifecycleTimer();
    state.manualLogout = true;
    await destroyClientLocked({ logout: true });
    clearAuthSession(getAuthDir(), getWhatsappClientId());
    state.manualLogout = false;
    state.status = 'DISCONNECTED';
    state.lifecyclePhase = 'IDLE';
    state.lastInitError = null;
    state.transientRestartCount = 0;
    state.isRequestingPairingCode = false;
    clearPairingAttemptState();
    return getCachedStatus();
  });
}

export async function requestPairingCode(phoneNumber) {
  if (state.status === 'CONNECTED' || state.status === 'AUTHENTICATED') {
    const error = new Error('WhatsApp is already connected.');
    error.statusCode = 409;
    throw error;
  }

  const cleanedNumber = formatEgyptianNumber(phoneNumber);
  if (!cleanedNumber || cleanedNumber.length < 10) {
    const error = new Error('رقم الهاتف غير صحيح، اكتب الرقم بمفتاح الدولة مثل 201012345678.');
    error.statusCode = 400;
    throw error;
  }

  return runLifecycleOperation('phone pairing', async () => {
    if (['CONNECTED', 'AUTHENTICATED'].includes(state.status)) {
      const error = new Error('WhatsApp is already connected.');
      error.statusCode = 409;
      throw error;
    }

    const sameAttempt = state.pairingPhoneNumber === cleanedNumber
      && state.client
      && ['INITIALIZING', 'PAIRING'].includes(state.status);
    if (sameAttempt) return getCachedStatus();

    state.isRequestingPairingCode = true;
    clearLifecycleTimer();
    await destroyClientLocked();

    const switchingNumber = Boolean(state.pairingPhoneNumber && state.pairingPhoneNumber !== cleanedNumber);
    if (switchingNumber || hasStoredAuthSession()) {
      clearAuthSession(getAuthDir(), getWhatsappClientId());
    }

    state.pairingPhoneNumber = cleanedNumber;
    state.pairingCode = null;
    state.pairingCodeIssuedAt = 0;
    state.transientRestartCount = 0;
    state.status = 'INITIALIZING';
    state.lifecyclePhase = 'STARTING_PAIRING';
    try {
      await startWhatsAppClientLocked({ pairingPhone: cleanedNumber });
      return getCachedStatus();
    } finally {
      state.isRequestingPairingCode = false;
    }
  });
}

export async function restartLinkingSession() {
  return runLifecycleOperation('restart', async () => {
    ensureQueueLoaded();
    clearLifecycleTimer();
    state.isRestarting = true;
    try {
      const pairingPhone = state.pairingPhoneNumber;
      await destroyClientLocked();
      state.transientRestartCount = 0;
      state.lastInitError = null;
      if (pairingPhone || hasStoredAuthSession()) {
        await startWhatsAppClientLocked({ pairingPhone });
      } else {
        state.status = 'DISCONNECTED';
        state.lifecyclePhase = 'IDLE';
      }
      return getCachedStatus();
    } finally {
      state.isRestarting = false;
    }
  });
}

function formatEgyptianNumber(number) {
  let formatted = String(number || '').replace(/\D/g, '');
  if (formatted.startsWith('01')) {
    formatted = `2${formatted}`;
  } else if (/^1[0125]\d{8}$/.test(formatted)) {
    formatted = `20${formatted}`;
  }
  return formatted;
}

function withTimeout(factory, timeoutMs, label, options = {}) {
  let timer;
  return Promise.race([
    factory(),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`${label} timed out after ${timeoutMs}ms`);
        error.isTransient = true;
        if (options.skipClientRestart) {
          error.skipClientRestart = true;
        }
        reject(error);
      }, timeoutMs);
    })
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function runClientOperation(operation) {
  const state = global.whatsappState;
  const run = state.clientOperationChain.then(operation, operation);
  state.clientOperationChain = run.catch(() => {});
  return run;
}

export async function isRegistered(number) {
  const state = global.whatsappState;
  if (!state.client || state.status !== 'CONNECTED') return null;

  ensureQueueLoaded();
  if (state.isProcessingQueue || state.messageQueue.length > 0) {
    return null;
  }

  try {
    return await runClientOperation(async () => {
      const formatted = formatEgyptianNumber(number);
      const numberId = await withTimeout(
        () => state.client.getNumberId(formatted),
        NUMBER_VALIDATION_TIMEOUT_MS,
        'WhatsApp number validation'
      );
      return numberId ? true : false;
    });
  } catch (error) {
    console.warn('[WhatsApp] Number validation skipped because the client is busy or unstable:', error.message);
    return null;
  }
}

function getNextDueDelay() {
  const state = global.whatsappState;
  if (state.messageQueue.length === 0) return 0;

  const now = Date.now();
  const nextDue = Math.min(...state.messageQueue.map((task) => task.availableAt || now));
  return Math.max(0, nextDue - now);
}

function getQueueDelay() {
  return Math.floor(Math.random() * (QUEUE_MAX_DELAY_MS - QUEUE_MIN_DELAY_MS + 1)) + QUEUE_MIN_DELAY_MS;
}

function isTransientError(error) {
  if (error?.isPermanent) return false;
  if (error?.isTransient) return true;

  const message = `${error?.name || ''} ${error?.message || error || ''}`;
  return /ProtocolError|Protocol error|timed out|Execution context was destroyed|Target closed|Session closed|Navigation|browser has disconnected|not opened|disconnected/i.test(message);
}

function shouldRestartWhatsAppClient(error) {
  if (error?.skipClientRestart) return false;

  const message = `${error?.name || ''} ${error?.message || error || ''}`;
  if (/number lookup|number validation/i.test(message)) return false;

  return /ProtocolError|Protocol error|Execution context was destroyed|Target closed|Session closed|browser has disconnected|not opened|disconnected/i.test(message);
}

function hasRetryBudget(task) {
  return MAX_TRANSIENT_RETRIES === 0 || (task.attempts || 0) < MAX_TRANSIENT_RETRIES;
}

function getRetryDelayMs(attempts) {
  const baseDelay = Math.min(300000, 5000 * 2 ** Math.min(attempts, 6));
  const jitter = Math.floor(Math.random() * 5000);
  return baseDelay + jitter;
}

async function restartWhatsAppClient(reason) {
  console.warn(`[WhatsApp] Restarting client after transient error: ${reason}`);
  await restartLinkingSession();
}

async function processQueue() {
  const state = global.whatsappState;
  ensureQueueLoaded();

  if (state.isProcessingQueue) {
    console.log(`[WhatsApp Queue] Processor already running. Queue length: ${state.messageQueue.length}`);
    return;
  }

  if (state.messageQueue.length === 0) return;

  state.isProcessingQueue = true;
  console.log(`[WhatsApp Queue] Processor started. Queue length: ${state.messageQueue.length}`);

  try {
    while (state.messageQueue.length > 0) {
      if (!state.client || state.status !== 'CONNECTED') {
        console.log(`[WhatsApp Queue] Paused. Client status: ${state.status}. Remaining in queue: ${state.messageQueue.length}`);
        break;
      }

      const now = Date.now();
      const taskIndex = state.messageQueue.findIndex((task) => !task.availableAt || task.availableAt <= now);

      if (taskIndex === -1) {
        scheduleQueue(getNextDueDelay());
        break;
      }

      const [task] = state.messageQueue.splice(taskIndex, 1);
      persistQueue();

      try {
        console.log(`[WhatsApp Queue] Processing task ${task.id} for ${task.number}. Attempt ${task.attempts + 1}`);
        const result = await withTimeout(
          () => executeSendMessage(task),
          SEND_TASK_TIMEOUT_MS,
          `WhatsApp send task ${task.id}`
        );
        task.resolve?.(result);
      } catch (error) {
        task.attempts = (task.attempts || 0) + 1;

        if (isTransientError(error) && hasRetryBudget(task)) {
          const retryDelay = getRetryDelayMs(task.attempts);
          task.availableAt = Date.now() + retryDelay;
          state.messageQueue.push(task);
          persistQueue();
          console.error(`[WhatsApp Queue] Send failed for ${task.number}. Retrying attempt ${task.attempts} in ${Math.round(retryDelay / 1000)}s:`, error.message);
          if (shouldRestartWhatsAppClient(error)) {
            await restartWhatsAppClient(error.message);
          }
        } else {
          console.error(`[WhatsApp Queue] Send failed permanently for ${task.number}:`, error);
          task.reject?.(error);
        }
      }

      if (state.messageQueue.length > 0) {
        const delayMs = getQueueDelay();
        console.log(`[WhatsApp Queue] Waiting ${delayMs / 1000} seconds before the next message. Remaining: ${state.messageQueue.length}`);
        await sleep(delayMs);
      }
    }
  } finally {
    state.isProcessingQueue = false;

    if (state.messageQueue.length > 0) {
      if (state.status === 'CONNECTED') {
        scheduleQueue(getNextDueDelay());
      }
    }
  }
}

async function resolveTaskMediaUrl(task) {
  if (task.mediaUrl) {
    return task.mediaUrl;
  }

  const invoicePayload = normalizeInvoicePayload(task.invoicePayload);
  if (!invoicePayload) {
    return null;
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    if (fs.existsSync(uploadsDir) && invoicePayload.orderId) {
      const existingInvoice = fs
        .readdirSync(uploadsDir)
        .filter((fileName) => {
           const prefix = `invoice_${invoicePayload.orderId}_`;
           return fileName.startsWith(prefix) && fileName.endsWith('.png') && fileName !== 'invoice_undefined_.png';
        })
        .sort()
        .pop();

      if (existingInvoice) {
        task.mediaUrl = path.join(uploadsDir, existingInvoice);
        task.invoicePayload = null;
        return task.mediaUrl;
      }
    }
  } catch (error) {
    console.warn(`[WhatsApp Queue] Could not reuse invoice media for task ${task.id}:`, error.message);
  }

  console.log(`[WhatsApp Queue] Generating invoice media for task ${task.id}...`);
  const { generateInvoiceImage } = await import('./invoiceGenerator');
  const relativePath = await generateInvoiceImage(
    invoicePayload.orderId,
    invoicePayload.customerName,
    invoicePayload.customerPhone,
    invoicePayload.total,
    invoicePayload.products,
    invoicePayload.notes,
    invoicePayload.customerAddress
  );

  if (!relativePath) {
    const error = new Error(`Invoice media generation failed for task ${task.id}`);
    error.isTransient = true;
    throw error;
  }

  task.mediaUrl = path.join(process.cwd(), 'public', relativePath);
  task.invoicePayload = null;
  return task.mediaUrl;
}

async function executeSendMessage(task) {
  const state = global.whatsappState;

  return runClientOperation(async () => {
    const mediaUrl = await resolveTaskMediaUrl(task);
    const formatted = formatEgyptianNumber(task.number);
    let chatId = `${formatted}@c.us`;

    if (VERIFY_NUMBER_BEFORE_SEND) {
      console.log(`[WhatsApp Queue] Resolving WhatsApp number ${task.number} -> ${formatted}...`);
      const numberId = await withTimeout(
        () => state.client.getNumberId(formatted),
        NUMBER_LOOKUP_TIMEOUT_MS,
        `WhatsApp number lookup for task ${task.id}`,
        { skipClientRestart: true }
      );

      if (!numberId) {
        const error = new Error(`WhatsApp number is not registered or cannot be resolved: ${task.number} -> ${formatted}`);
        error.isPermanent = true;
        throw error;
      }

      chatId = numberId._serialized || chatId;
    } else {
      console.log(`[WhatsApp Queue] Sending directly to ${chatId}; number lookup is disabled for faster delivery.`);
    }

    console.log(`[WhatsApp Queue] Sending to ${chatId}${mediaUrl ? ' with media' : ''}...`);

    try {
      // Warm up the connection to prevent silent E2EE failures (ACK -1)
      const contact = await state.client.getContactById(chatId);
      const chat = await contact.getChat();
      await chat.sendStateTyping();
      await new Promise(resolve => setTimeout(resolve, 1500));
      await chat.clearState();
    } catch (warmupError) {
      console.log('[WhatsApp Queue] Warmup skipped (contact might be new):', warmupError.message);
    }

    let sentMessage;
    if (mediaUrl) {
      let media;
      if (mediaUrl.startsWith('http')) {
        media = await MessageMedia.fromUrl(mediaUrl);
      } else if (fs.existsSync(mediaUrl)) {
        media = MessageMedia.fromFilePath(mediaUrl);
      } else {
        media = await MessageMedia.fromUrl(mediaUrl);
      }

      sentMessage = await state.client.sendMessage(chatId, media, { caption: task.message });
    } else {
      sentMessage = await state.client.sendMessage(chatId, task.message);
    }

    if (sentMessage && sentMessage.id) {
       console.log(`[WhatsApp Queue] Sent successfully to ${chatId} (ID: ${sentMessage.id._serialized})`);
       
       // Handle WhatsApp Pairing Code bug (LID misrouting or ACK -1)
       const isLid = String(sentMessage.id._serialized).includes('@lid');
       if (sentMessage.ack === -1 || isLid) {
           try {
             const result = await state.client.pupPage.evaluate(async () => {
               // 1. Click "New Chat" button
               const newChatSelectors = [
                 'span[data-icon="new-chat-outline"]',
                 'span[data-icon="chat"]',
                 'div[title="New chat"]',
                 'div[title="دردشة جديدة"]'
               ];
               let btn = null;
               for (const sel of newChatSelectors) {
                 btn = document.querySelector(sel);
                 if (btn) break;
               }
               if (!btn) return 'NEW_CHAT_BTN_NOT_FOUND';
               btn.parentElement.click();
               return 'CLICKED_NEW_CHAT';
             });
             
             if (result !== 'CLICKED_NEW_CHAT') {
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: ${result}`);
                 return true;
             }
             
             await new Promise(r => setTimeout(r, 1500));
             
             const searchBoxReady = await state.client.pupPage.evaluate(() => {
                const searchBoxes = Array.from(document.querySelectorAll('div[contenteditable="true"], p[contenteditable="true"]'));
                let box = searchBoxes[0];
                if (document.activeElement && document.activeElement.isContentEditable) {
                    box = document.activeElement;
                }
                if (!box) return false;
                box.id = 'wa-custom-search-box';
                return true;
             });
             
             if (!searchBoxReady) {
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: SEARCH_BOX_NOT_FOUND`);
                 return true;
             }
             
             await state.client.pupPage.type('#wa-custom-search-box', formatted, { delay: 50 });
             
             await new Promise(r => setTimeout(r, 3000));
             
             const contactClicked = await state.client.pupPage.evaluate(() => {
                const contactNodes = Array.from(document.querySelectorAll('div[role="listitem"]'));
                if (contactNodes.length === 0) return false;
                contactNodes[0].click();
                return true;
             });
             
             if (!contactClicked) {
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: CONTACT_NOT_FOUND`);
                 // Press Escape to close the drawer if not found
                 await state.client.pupPage.keyboard.press('Escape');
                 return true;
             }
             
             await new Promise(r => setTimeout(r, 1500));
             
             const msgBoxReady = await state.client.pupPage.evaluate(() => {
                const msgBoxes = Array.from(document.querySelectorAll('div[contenteditable="true"], p[contenteditable="true"]'));
                const msgBox = msgBoxes[msgBoxes.length - 1];
                if (!msgBox) return false;
                msgBox.id = 'wa-custom-msg-box';
                return true;
             });
             
             if (!msgBoxReady) {
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: MSG_BOX_NOT_FOUND`);
                 return true;
             }
             
             await state.client.pupPage.type('#wa-custom-msg-box', task.message, { delay: 20 });
             
             await new Promise(r => setTimeout(r, 500));
             
             const sent = await state.client.pupPage.evaluate(() => {
                 const sendBtn = document.querySelector('span[data-icon="send"]');
                 if (sendBtn) {
                     sendBtn.parentElement.click();
                     return 'SUCCESS';
                 }
                 return 'SEND_BTN_NOT_FOUND';
             });
             
             if (sent === 'SEND_BTN_NOT_FOUND') {
                 await state.client.pupPage.keyboard.press('Enter');
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: SUCCESS_VIA_ENTER`);
             } else {
                 console.log(`[WhatsApp Queue] Silent UI Fallback result: SUCCESS`);
             }
             
           } catch(e) {
             console.log(`[WhatsApp Queue] Silent UI Fallback encountered error: ${e.message}`);
           }
       }
    } else {
       console.log(`[WhatsApp Queue] Sent successfully to ${chatId}`);
    }

    return true;
  });
}

function enqueueMessage(number, message, mediaUrl = null, waitForDelivery = false, options = {}) {
  const startClient = options.startClient ?? waitForDelivery;
  const invoicePayload = normalizeInvoicePayload(options.invoicePayload);
  const dedupeKey = options.dedupeKey ? String(options.dedupeKey) : null;

  ensureQueueLoaded();

  if (startClient) {
    initializeWhatsApp().catch((error) => {
      console.warn('[WhatsApp Queue] Message will stay queued; client initialization failed:', error.message);
    });
  }

  const task = {
    id: createTaskId(),
    number,
    message: buildMessageWithTimestamp(message),
    mediaUrl,
    dedupeKey,
    invoicePayload,
    attempts: 0,
    createdAt: Date.now(),
    availableAt: Date.now()
  };

  const resultPromise = waitForDelivery
    ? new Promise((resolve, reject) => {
        task.resolve = resolve;
        task.reject = reject;
      })
    : Promise.resolve({ queued: true, id: task.id });

  if (dedupeKey) {
    const before = state.messageQueue.length;
    state.messageQueue = state.messageQueue.filter((queuedTask) => queuedTask.dedupeKey !== dedupeKey);
    const removed = before - state.messageQueue.length;
    if (removed > 0) {
      console.log(`[WhatsApp Queue] Replaced ${removed} queued message(s) with dedupe key: ${dedupeKey}`);
    }
  }

  state.messageQueue.push(task);
  persistQueue();
  console.log(`[WhatsApp Queue] Added message to queue. Total in queue: ${state.messageQueue.length}`);

  if (startClient || state.status === 'CONNECTED') {
    scheduleQueue();
  } else {
    console.log('[WhatsApp Queue] Stored message until WhatsApp is connected from the admin panel.');
  }

  return resultPromise;
}

export async function queueMessage(number, message, mediaUrl = null, options = {}) {
  return enqueueMessage(number, message, mediaUrl, false, options);
}

export async function queueInvoiceMessage(number, message, invoicePayload) {
  return enqueueMessage(number, message, null, false, { invoicePayload });
}

export async function sendMessage(number, message, mediaUrl = null) {
  return enqueueMessage(number, message, mediaUrl, true);
}
