import { getStoreType } from '../storage/index.js';

// fixed window algorithm
export async function barAlgorithm(req, res, next) {
  const {
    clientId,
    rateLimitConfig: { windowSeconds, capacity }
  } = req;

  const store = getStoreType();
  const key = `barAlgorithm:${clientId}`;

  const now = Date.now();
  const state = (await store.get(key)) || {};
  let count = state.count ?? 0;
  let windowStart = state.windowStart ?? now;

  if (now - windowStart >= windowSeconds * 1000) {
    count = 0;
    windowStart = now;
  }

  const remainingMs = windowSeconds * 1000 - (now - windowStart);
  const ttlSec = Math.max(1, Math.ceil(remainingMs / 1000));

  if (count < capacity) {
    count++;

    await store.set(key, { count, windowStart }, ttlSec);
    res.set('X-RateLimit-Limit', capacity);
    res.set('X-RateLimit-Remaining', capacity - count);

    return next();
  }

  await store.set(key, { count, windowStart }, ttlSec);
  return res
    .status(429)
    .set('Retry-After', ttlSec.toString())
    .json({ error: 'Rate limit exceeded' });
}
