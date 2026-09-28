import config from '../config/settings.js';
import memoryStore from './localMemory.js';
import redisStore from './redisStore.js';

const stores = {
  memory: memoryStore,
  redis: redisStore,
};

export function getStore() {
  return stores[config.storage];
}
