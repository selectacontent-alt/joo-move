const CACHE_TTL = 90_000;

const getCache = () => {
  if (typeof window === 'undefined') return null;
  if (!window.__alRehabPrefetchCache) window.__alRehabPrefetchCache = new Map();
  return window.__alRehabPrefetchCache;
};

export const fetchJsonCached = (url, options = {}) => {
  const isCacheable = !options.method || options.method === 'GET';
  const cache = getCache();
  const cached = isCacheable ? cache?.get(url) : null;

  if (cached && Date.now() - cached.createdAt < CACHE_TTL) return cached.promise;

  const promise = fetch(url, options).then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `Request failed: ${response.status}`);
    return data;
  });

  if (isCacheable && cache) {
    cache.set(url, { createdAt: Date.now(), promise });
    promise.catch(() => cache.delete(url));
  }

  return promise;
};

export const prefetchJson = (url) => fetchJsonCached(url).catch(() => null);
