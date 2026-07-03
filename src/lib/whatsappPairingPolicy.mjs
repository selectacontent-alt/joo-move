export const PAIRING_CODE_TTL_MS = 180000;
export const PAIRING_BLOCK_DURATIONS_MS = [
  30 * 60 * 1000,
  2 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000
];

export function getPairingErrorDetails(error) {
  const name = String(error?.name || '').trim();
  const message = String(error?.message || error || '').trim();
  const combined = [name, message].filter(Boolean).join(': ');
  return {
    name,
    message,
    combined: combined || 'Unknown phone pairing error'
  };
}

export function createPairingBlock(previousFailureCount, error, now = Date.now()) {
  const failureCount = Math.max(0, Number(previousFailureCount) || 0) + 1;
  const durationIndex = Math.min(failureCount - 1, PAIRING_BLOCK_DURATIONS_MS.length - 1);
  const durationMs = PAIRING_BLOCK_DURATIONS_MS[durationIndex];
  const details = getPairingErrorDetails(error);
  return {
    failureCount,
    blockedUntil: now + durationMs,
    failedAt: now,
    lastError: details.combined.slice(0, 500)
  };
}

export function getPairingRetryAfterSeconds(blockedUntil, now = Date.now()) {
  return Math.max(0, Math.ceil((Number(blockedUntil) - now) / 1000));
}

export function isPairingBlocked(blockedUntil, now = Date.now()) {
  return getPairingRetryAfterSeconds(blockedUntil, now) > 0;
}

export function isPairingCodeFresh(issuedAt, now = Date.now()) {
  const issuedAtNumber = Number(issuedAt) || 0;
  return issuedAtNumber > 0 && now < issuedAtNumber + PAIRING_CODE_TTL_MS;
}

export function createSafePairingRequest(requestPairingCode, onFailure) {
  return (...args) => Promise.resolve()
    .then(() => requestPairingCode(...args))
    .catch((error) => {
      onFailure(error);
      return null;
    });
}
