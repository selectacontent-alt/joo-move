import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PAIRING_BLOCK_DURATIONS_MS,
  PAIRING_CODE_TTL_MS,
  createPairingBlock,
  createSafePairingRequest,
  getPairingRetryAfterSeconds,
  isPairingBlocked,
  isPairingCodeFresh
} from '../src/lib/whatsappPairingPolicy.mjs';

test('pairing failures use 30 minutes, 2 hours, then 24 hours', () => {
  const now = 1000000;
  const first = createPairingBlock(0, { name: 't', message: 't' }, now);
  const second = createPairingBlock(first.failureCount, new Error('429 rate-overlimit'), now);
  const third = createPairingBlock(second.failureCount, new Error('rejected'), now);
  const fourth = createPairingBlock(third.failureCount, new Error('rejected again'), now);

  assert.equal(first.blockedUntil, now + PAIRING_BLOCK_DURATIONS_MS[0]);
  assert.equal(second.blockedUntil, now + PAIRING_BLOCK_DURATIONS_MS[1]);
  assert.equal(third.blockedUntil, now + PAIRING_BLOCK_DURATIONS_MS[2]);
  assert.equal(fourth.blockedUntil, now + PAIRING_BLOCK_DURATIONS_MS[2]);
  assert.match(first.lastError, /t: t/);
});

test('blocked state and retry countdown expire deterministically', () => {
  assert.equal(isPairingBlocked(61000, 1000), true);
  assert.equal(getPairingRetryAfterSeconds(61000, 1000), 60);
  assert.equal(isPairingBlocked(1000, 1000), false);
});

test('pairing codes expire after the library default three minutes', () => {
  const issuedAt = 5000;
  assert.equal(isPairingCodeFresh(issuedAt, issuedAt + PAIRING_CODE_TTL_MS - 1), true);
  assert.equal(isPairingCodeFresh(issuedAt, issuedAt + PAIRING_CODE_TTL_MS), false);
});

test('safe request absorbs a minified pairing rejection without unhandled rejection', async () => {
  const failures = [];
  let unhandled = null;
  const listener = (error) => { unhandled = error; };
  process.once('unhandledRejection', listener);

  const safeRequest = createSafePairingRequest(
    async () => { throw Object.assign(new Error('t'), { name: 't' }); },
    (error) => failures.push(error)
  );
  safeRequest('201000000000');
  await new Promise((resolve) => setImmediate(resolve));
  process.removeListener('unhandledRejection', listener);

  assert.equal(unhandled, null);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].message, 't');
});
