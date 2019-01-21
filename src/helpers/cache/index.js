// Borrowed from -great- gatsby
import Cache from './cache';

const caches = new Map();
const getCache = (name) => {
  let cache = caches.get(name);
  if (!cache) {
    cache = new Cache({ name }).init();
    caches.set(name, cache);
  }
  return cache;
};

export default getCache;
