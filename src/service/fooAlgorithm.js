import { getStoreType } from '../storage/index.js';

// this is a token bucket algorithm
export default async function fooAlgorithm(req, res, next) {
  const { clientId, rateLimitConfig: { fillPerSecond, capacity } } = req;
  const store = getStoreType();
  const key = `fooAlgorithm:${clientId}`;

  const now = Date.now();
  const state = await store.get(key) || {};
  let tokens = state.tokens ?? capacity;
  let last = state.last ?? now;

  const deltaSec = (now - last) / 1000;
  tokens = Math.min(capacity, tokens + deltaSec * fillPerSecond);
  last = now;

  const ttlSec = Math.ceil((capacity / fillPerSecond) * 2);

  if (tokens >= 1) {
    tokens -= 1;
    await store.set(key, { tokens, last }, ttlSec);
    res.set('X-RateLimit-Remaining', Math.floor(tokens));
    res.set('X-RateLimit-Limit', capacity);
    return next();
  }

  await store.set(key, { tokens, last }, ttlSec);
  return res.status(429)
    .json({ error: 'Rate limit exceeded' });
}
