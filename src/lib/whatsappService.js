import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';

import fs from 'fs';
import path from 'path';
import { getPuppeteerLaunchOptions } from './puppeteerConfig';

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
const QR_RENDER_WIDTH = readPositiveIntEnv('WHATSAPP_QR_RENDER_WIDTH', 320);
const INIT_RETRY_COOLDOWN_MS = readPositiveIntEnv('WHATSAPP_INIT_RETRY_COOLDOWN_MS', 15000);
const AUTH_TIMEOUT_MS = readPositiveIntEnv('WHATSAPP_AUTH_TIMEOUT_MS', 900000);
const RELINK_RETRY_DELAY_MS = readPositiveIntEnv('WHATSAPP_RELINK_RETRY_DELAY_MS', 5000);
const MAX_TRANSIENT_RETRIES = readNonNegativeIntEnv('WHATSAPP_MAX_TRANSIENT_RETRIES', 0);
const VERIFY_NUMBER_BEFORE_SEND = process.env.WHATSAPP_VERIFY_NUMBER_BEFORE_SEND === 'true';
const CLOCK_EMOJI = '\u{1F552}';

if (!global.whatsappState) {
  global.whatsappState = {
    client: null,
    qrCodeData: null,
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
state.reconnectTimer = state.reconnectTimer || null;
state.relinkTimer = state.relinkTimer || null;
state.isRestarting = Boolean(state.isRestarting);
state.linkingRestartPromise = state.linkingRestartPromise || null;
state.clientOperationChain = state.clientOperationChain || Promise.resolve();
state.manualLogout = Boolean(state.manualLogout);
state.nextInitializeAt = Number.isFinite(Number(state.nextInitializeAt)) ? Number(state.nextInitializeAt) : 0;
state.lastInitError = state.lastInitError || null;
state.isRequestingPairingCode = Boolean(state.isRequestingPairingCode);
state.pairingPhoneNumber = state.pairingPhoneNumber || null;
state.pairingCodeIssuedAt = Number(state.pairingCodeIssuedAt) || 0;


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

function clearQrState() {
  // QR state is no longer used, kept for compatibility if any references remain
}

function clearPairingAttemptState() {
  const state = global.whatsappState;
  state.pairingPhoneNumber = null;
  state.pairingCodeIssuedAt = 0;
}

async function waitForPairingClient(timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const state = global.whatsappState;
    if (state.status === 'CONNECTED' || state.status === 'AUTHENTICATED') {
      throw new Error('WhatsApp is already connected.');
    }
    if (state.client && state.status === 'WAITING_FOR_SCAN' && !state.isRestarting) {
      return state.client;
    }
    if (!state.client && !state.isRestarting && !state.isInitialized) {
      initializeWhatsApp({ force: true });
    }
    await sleep(500);
  }

  throw new Error('WhatsApp linking session did not become ready in time.');
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

function scheduleReconnect(delayMs = 5000) {
  const state = global.whatsappState;
  if (state.isRestarting || state.reconnectTimer) return;

  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    try {
      const waitForCooldown = state.nextInitializeAt ? state.nextInitializeAt - Date.now() : 0;
      if (waitForCooldown > 0) {
        scheduleReconnect(waitForCooldown + 250);
        return;
      }

      initializeWhatsApp();
    } catch (error) {
      console.warn('[WhatsApp] Reconnect failed:', error.message);
      scheduleReconnect(10000);
    }
  }, delayMs);

  if (typeof state.reconnectTimer.unref === 'function') {
    state.reconnectTimer.unref();
  }
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
    console.log('[WhatsApp] Cleared failed auth session. A fresh QR will be generated.');
  } catch (error) {
    console.warn('[WhatsApp] Could not clear failed auth session:', error.message);
  }
}

function scheduleFreshLinkingSession(reason, options = {}) {
  const state = global.whatsappState;
  const delayMs = Math.max(0, options.delayMs ?? RELINK_RETRY_DELAY_MS);
  const killBrowser = options.killBrowser === true;

  if (state.relinkTimer) {
    console.log(`[WhatsApp] Fresh linking session already scheduled. Reason: ${reason}`);
    return;
  }

  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  const authDir = getAuthDir();
  const clientId = getWhatsappClientId();

  state.isRestarting = true;
  state.status = 'DISCONNECTED';
  state.client = null;
  state.isInitialized = false;
  state.clientOperationChain = Promise.resolve();
  state.lastInitError = reason;
  clearQrState();

  console.warn(`[WhatsApp] Scheduling fresh QR session in ${Math.round(delayMs / 1000)}s: ${reason}`);

  state.relinkTimer = setTimeout(async () => {
    state.relinkTimer = null;

    try {
      if (killBrowser) {
        killStuckBrowserForSession(authDir, clientId);
      }
      clearAuthSession(authDir, clientId);
      await sleep(750);
    } finally {
      state.isRestarting = false;
      state.nextInitializeAt = 0;
      initializeWhatsApp({ force: true });
    }
  }, delayMs);

  if (typeof state.relinkTimer.unref === 'function') {
    state.relinkTimer.unref();
  }
}

function handleInitializationError(error) {
  const state = global.whatsappState;
  const message = getErrorMessage(error);
  const failedClient = state.client;
  console.error('WhatsApp Init Error:', message);
  state.status = 'DISCONNECTED';
  clearQrState();
  state.isInitialized = false;
  state.client = null;
  state.lastInitError = message;
  const deferClientCleanup = isAuthTimeoutMessage(message) || isTransientBrowserMessage(message);

  if (failedClient && !deferClientCleanup) {
    failedClient.destroy().catch((destroyError) => {
      console.warn('[WhatsApp] Error while destroying failed init client:', destroyError.message);
    });
  }

  if (isAuthTimeoutMessage(message)) {
    scheduleFreshLinkingSession('auth timeout while linking', {
      delayMs: RELINK_RETRY_DELAY_MS,
      killBrowser: true
    });
    return;
  }

  if (isTransientBrowserMessage(message)) {
    scheduleFreshLinkingSession(message, {
      delayMs: RELINK_RETRY_DELAY_MS,
      killBrowser: true
    });
    return;
  }

  if (message.includes('The browser is already running')) {
    const authDir = getAuthDir();
    const clientId = getWhatsappClientId();
    console.log('[Auto-Fix] Detected stuck WhatsApp browser session. Cleaning locks...');
    killStuckBrowserForSession(authDir, clientId);
    clearBrowserLock(authDir, clientId);
    state.nextInitializeAt = Date.now() + INIT_RETRY_COOLDOWN_MS;
    scheduleReconnect(INIT_RETRY_COOLDOWN_MS);
    return;
  }

  state.nextInitializeAt = Date.now() + INIT_RETRY_COOLDOWN_MS;
  scheduleReconnect(INIT_RETRY_COOLDOWN_MS);
}

export function initializeWhatsApp(options = {}) {
  const state = global.whatsappState;
  if (state.isInitialized || state.isRestarting) return;

  ensureQueueLoaded();

  const force = options.force === true;
  const now = Date.now();
  if (!force && state.nextInitializeAt && state.nextInitializeAt > now) {
    const retryInSeconds = Math.ceil((state.nextInitializeAt - now) / 1000);
    console.warn(`[WhatsApp] Initialization cooling down. Retrying in ${retryInSeconds}s.`);
    return;
  }

  state.isInitialized = true;
  state.status = state.status === 'CONNECTED' ? state.status : 'INITIALIZING';
  state.nextInitializeAt = 0;
  state.lastInitError = null;
  clearQrState();
  console.log('Initializing WhatsApp Client...');

  const authDir = getAuthDir();
  const clientId = getWhatsappClientId();
  clearBrowserLock(authDir, clientId);

  state.client = new Client({
    authStrategy: new LocalAuth({
      clientId,
      dataPath: authDir
    }),
    authTimeoutMs: AUTH_TIMEOUT_MS,
    qrMaxRetries: 0,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 0,
    puppeteer: getPuppeteerLaunchOptions()
  });

  state.client.on('qr', (qr) => {
    console.log('WhatsApp is ready for Pairing Code (QR Event Fired)');
    state.status = 'WAITING_FOR_SCAN';
    state.lastInitError = null;
  });

  state.client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    clearQrState();
    state.status = 'CONNECTED';
    state.nextInitializeAt = 0;
    state.lastInitError = null;
    clearPairingAttemptState();
    scheduleQueue();
  });

  state.client.on('authenticated', () => {
    console.log('WhatsApp AUTHENTICATED');
    state.status = 'AUTHENTICATED';
  });

  state.client.on('auth_failure', (msg) => {
    console.error('WhatsApp AUTHENTICATION FAILURE', msg);
    if (state.isRestarting) return;

    state.isRestarting = true;
    state.status = 'AUTH_FAILURE';
    clearQrState();
    state.isInitialized = false;
    const failedClient = state.client;
    state.client = null;
    state.clientOperationChain = Promise.resolve();
    clearPairingAttemptState();

    (async () => {
      try {
        if (failedClient) {
          await failedClient.destroy();
        }
      } catch (error) {
        console.warn('[WhatsApp] Error while destroying auth-failed client:', error.message);
      } finally {
        state.isRestarting = false;
        scheduleFreshLinkingSession('authentication failure', {
          delayMs: INIT_RETRY_COOLDOWN_MS,
          killBrowser: true
        });
      }
    })();
  });

  state.client.on('disconnected', (reason) => {
    console.log('WhatsApp Client disconnected:', reason);
    state.status = 'DISCONNECTED';
    clearQrState();
    state.isInitialized = false;
    state.client = null;

    if (state.manualLogout) {
      state.manualLogout = false;
      state.lastInitError = null;
      return;
    }

    if (!state.isRestarting) {
      if (isLogoutDisconnectReason(reason)) {
        scheduleFreshLinkingSession(`logout during linking: ${reason}`, {
          delayMs: RELINK_RETRY_DELAY_MS,
          killBrowser: false
        });
      } else {
        scheduleReconnect(5000);
      }
    }
  });

  if (!state.hasShutdownHooks) {
    state.hasShutdownHooks = true;
    process.on('SIGINT', async () => {
      console.log('\nShutting down WhatsApp gracefully...');
      if (state.client) {
        try {
          await state.client.destroy();
        } catch (error) {}
      }
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      if (state.client) {
        try {
          await state.client.destroy();
        } catch (error) {}
      }
      process.exit(0);
    });
    process.on('unhandledRejection', (reason) => {
      const message = getErrorMessage(reason);
      if (isAuthTimeoutMessage(message)) {
        console.warn('[WhatsApp] Captured auth timeout rejection. Restarting linking flow safely.');
        scheduleFreshLinkingSession('auth timeout rejection', {
          delayMs: RELINK_RETRY_DELAY_MS,
          killBrowser: true
        });
        return;
      }

      if (isTransientBrowserMessage(message)) {
        console.warn('[WhatsApp] Captured transient browser rejection while linking:', message);
        scheduleFreshLinkingSession(message, {
          delayMs: RELINK_RETRY_DELAY_MS,
          killBrowser: true
        });
      }
    });
  }

  state.client.initialize().catch(handleInitializationError);
}

export async function getStatus() {
  const state = global.whatsappState;
  try {
    initializeWhatsApp();
  } catch (error) {
    console.warn('[WhatsApp] Status requested while initialization failed:', error.message);
    return {
      status: state.status || 'DISCONNECTED',
      qr: null,
      qrPending: false,
      qrError: error.message,
      queuedMessages: state.messageQueue.length,
      isProcessingQueue: state.isProcessingQueue
    };
  }



  return {
    status: state.status,
    qr: null,
    qrPending: false,
    qrError: null,
    lastInitError: state.lastInitError,
    retryInSeconds: state.nextInitializeAt > Date.now()
      ? Math.ceil((state.nextInitializeAt - Date.now()) / 1000)
      : 0,
    queuedMessages: state.messageQueue.length,
    isProcessingQueue: state.isProcessingQueue
  };
}

export function getCachedStatus() {
  const state = global.whatsappState;
  ensureQueueLoaded();

  return {
    status: state.status || 'DISCONNECTED',
    qrAvailable: false,
    qrPending: false,
    qrError: null,
    lastInitError: state.lastInitError,
    retryInSeconds: state.nextInitializeAt > Date.now()
      ? Math.ceil((state.nextInitializeAt - Date.now()) / 1000)
      : 0,
    queuedMessages: state.messageQueue.length,
    isProcessingQueue: state.isProcessingQueue,
    isInitialized: state.isInitialized,
    isRestarting: state.isRestarting
  };
}

export async function logout() {
  const state = global.whatsappState;
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  state.manualLogout = true;

  if (state.client) {
    try {
      await state.client.logout();
      state.status = 'DISCONNECTED';
      clearQrState();
      state.isInitialized = false;
      state.client = null;
    } catch (error) {
      console.error('Logout Error:', error);
    }
  }

  const authDir = getAuthDir();
  const clientId = getWhatsappClientId();
  killStuckBrowserForSession(authDir, clientId);
  clearAuthSession(authDir, clientId);
  state.status = 'DISCONNECTED';
  clearQrState();
  state.isInitialized = false;
  state.client = null;
  state.isRequestingPairingCode = false;
  clearPairingAttemptState();
}

export async function requestPairingCode(phoneNumber) {
  const state = global.whatsappState;
  if (state.status === 'CONNECTED' || state.status === 'AUTHENTICATED') {
    throw new Error('WhatsApp is already connected.');
  }

  let cleanedNumber = String(phoneNumber).replace(/\D/g, '');
  if (cleanedNumber.startsWith('01') && cleanedNumber.length === 11) {
    cleanedNumber = '2' + cleanedNumber;
  }
  
  if (!cleanedNumber || cleanedNumber.length < 10) {
    throw new Error('رقم الهاتف غير صحيح، يرجى كتابة الرقم متبوعاً بمفتاح الدولة (مثال: 201012345678)');
  }

  if (state.isRequestingPairingCode) {
    throw new Error('جاري طلب الكود بالفعل، يرجى الانتظار...');
  }
  
  state.isRequestingPairingCode = true;

  try {
    // A pairing-code browser session can remain bound to the first phone number.
    // Always create a fresh session so switching numbers never reuses stale state.
    await restartLinkingSession();
    const pairingClient = await waitForPairingClient();

    const codePromise = pairingClient.requestPairingCode(cleanedNumber);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout requesting pairing code')), 60000));
    
    const code = await Promise.race([codePromise, timeoutPromise]);
    state.pairingPhoneNumber = cleanedNumber;
    state.pairingCodeIssuedAt = Date.now();
    return code;
  } catch (error) {
    console.error('[WhatsApp] Failed to request pairing code:', error);
    clearPairingAttemptState();
    throw new Error(`تعذر إنشاء كود الربط: ${getErrorMessage(error)}`);
  } finally {
    state.isRequestingPairingCode = false;
  }
}

export async function restartLinkingSession() {
  const state = global.whatsappState;
  if (state.linkingRestartPromise) {
    return state.linkingRestartPromise;
  }

  state.linkingRestartPromise = (async () => {
    ensureQueueLoaded();

    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }

    const authDir = getAuthDir();
    const clientId = getWhatsappClientId();
    const existingClient = state.client;

    state.isRestarting = true;
    state.manualLogout = false;
    state.client = null;
    state.status = 'DISCONNECTED';
    clearQrState();
    state.isInitialized = false;
    state.clientOperationChain = Promise.resolve();
    clearPairingAttemptState();

    try {
      if (existingClient) {
        await existingClient.destroy();
      }
    } catch (error) {
      console.warn('[WhatsApp] Error while restarting linking session:', error.message);
    }

    killStuckBrowserForSession(authDir, clientId);
    clearAuthSession(authDir, clientId);
    await sleep(1500);
    state.isRestarting = false;
    state.nextInitializeAt = 0;
    initializeWhatsApp({ force: true });
    return getStatus();
  })().finally(() => {
    state.linkingRestartPromise = null;
  });

  return state.linkingRestartPromise;
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
  const state = global.whatsappState;
  if (state.isRestarting) return;

  state.isRestarting = true;
  console.warn(`[WhatsApp] Restarting client after transient error: ${reason}`);

  try {
    if (state.client) {
      await state.client.destroy();
    }
  } catch (error) {
    console.warn('[WhatsApp] Error while destroying unstable client:', error.message);
  } finally {
    state.client = null;
    state.status = 'DISCONNECTED';
    state.isInitialized = false;
    state.isRestarting = false;
    state.clientOperationChain = Promise.resolve();
    scheduleReconnect(3000);
  }
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
       if (sentMessage.ack === -1) {
           console.warn(`[WhatsApp Queue] WARNING: Message was instantly rejected by WhatsApp (ACK -1). The number might require manual messaging first.`);
           throw new Error('WhatsApp rejected the message (ACK -1)');
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
    try {
      initializeWhatsApp();
    } catch (error) {
      console.warn('[WhatsApp Queue] Message will stay queued; client initialization failed:', error.message);
    }
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
