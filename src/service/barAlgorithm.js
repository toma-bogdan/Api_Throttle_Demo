import { getStore } from '../storage/selectStore.js';
import { rateLimitExceeded, setLimitHeaders } from './limitResponse.js';

// fixed window
export async function barAlgorithm(req, res, next) {
  const { capacity, windowSeconds } = req.clientConfig.bar;
  const store = getStore();
  const key = `barAlgorithm:${req.clientId}`;

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

  const allowed = count < capacity;
  if (allowed) count++;

  await store.set(key, { count, windowStart }, ttlSec);

  if (!allowed) return rateLimitExceeded(res, ttlSec);

  setLimitHeaders(res, capacity, capacity - count);
  return next();
}
