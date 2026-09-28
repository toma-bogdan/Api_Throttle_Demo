import { getStore } from '../storage/selectStore.js';
import { rateLimitExceeded, setLimitHeaders } from './limitResponse.js';

// token bucket
export async function fooAlgorithm(req, res, next) {
  const { capacity, fillPerSecond } = req.clientConfig.foo;
  const store = getStore();
  const key = `fooAlgorithm:${req.clientId}`;

  for (let attempt = 0; attempt < 8; attempt++) {
    const now = Date.now();
    const state = await store.get(key) || {};
    let tokens = state.tokens ?? capacity;
    let last = state.last ?? now;

    const deltaSec = (now - last) / 1000;
    tokens = Math.min(capacity, tokens + deltaSec * fillPerSecond);
    last = now;

    const allowed = tokens >= 1;
    if (allowed) tokens -= 1;

    const ttlSec = Math.ceil((capacity / fillPerSecond) * 2);
    if (!await store.set(key, { tokens, last }, ttlSec)) continue;

    if (!allowed) return rateLimitExceeded(res);

    setLimitHeaders(res, capacity, Math.floor(tokens));
    return next();
  }

  throw new Error('Could not save rate limit');
}
