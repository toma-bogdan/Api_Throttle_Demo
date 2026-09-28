const map = new Map();

const memoryStore = {
  async get(key) {
    return map.get(key) ?? null;
  },
  async set(key, value) {
    map.set(key, value);
  },
  async reset(key) {
    map.delete(key);
  }
};

export default memoryStore;
