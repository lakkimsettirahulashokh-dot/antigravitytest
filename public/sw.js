// ==============================================================================
// TechPath AI OS — Enterprise Service Worker (PWA Offline Engine)
// Cache Name & Version: techpath-cache-v2.5.0-prod
// ==============================================================================

const CACHE_NAME = 'techpath-cache-v2.5.0-prod';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/learn.html',
  '/study.html',
  '/flashcards.html',
  '/planner.html',
  '/offline.html',
  '/css/tailwind.output.css',
  '/css/custom.css',
  '/css/motion.css',
  '/manifest.json',
  '/favicon.ico',
  '/assets/branding/favicon.svg',
  '/assets/branding/techpath-logo-horizontal.png',
  '/assets/branding/techpath-emblem.png',
  '/js/auth.js',
  '/js/app.js',
  '/js/motion.js',
  '/js/supabase-client.js'
];

// 1. Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intelligent multi-tier caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and browser extensions
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass API and auth endpoints from static caching
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  // A. Navigation requests (HTML pages): Network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.ok) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) {
            return cachedRes;
          }
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // B. Static Assets (CSS, JS, Fonts, Images): Cache-first with background revalidation
  const isStatic = (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  );

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        }).catch(() => {
          // Silent network failure during background revalidation
        });

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // C. Default: Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      return (
        cachedRes ||
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
      );
    })
  );
});
