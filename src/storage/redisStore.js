import { createClient, WatchError } from 'redis';
import config from '../config/settings.js';

const client = createClient({ url: config.redisUrl });
client.on('error', (err) => {
  console.error('Redis error', err);
});

let isConnected = false;
let locked = false;
const waiters = [];

function acquire() {
  if (!locked) {
    locked = true;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiters.push(resolve));
}

function release() {
  const next = waiters.shift();
  if (next) next();
  else locked = false;
}

async function ensureConnected() {
  if (!isConnected) {
    console.info('Connecting to Redis...');
    await client.connect();
    isConnected = true;
  }
}

const redisStore = {
  async get(key) {
    await acquire();
    try {
      await ensureConnected();
      await client.watch(key);
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      release();
      throw err;
    }
  },

  async set(key, value, ttlSec) {
    try {
      await ensureConnected();
      const ttl = Math.max(1, Math.ceil(ttlSec));
      await client.multi()
        .set(key, JSON.stringify(value), { EX: ttl })
        .exec();
      return true;
    } catch (err) {
      await client.unwatch();
      if (err instanceof WatchError) return false;
      throw err;
    } finally {
      release();
    }
  },
};

export default redisStore;
