const CACHE_NAME = 'sample-pwa-v4';
const BASE_PATH = '/sample-pwa';

// 初期キャッシュ対象
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/?source=installed`,
  `${BASE_PATH}/?source=qr`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icons/icon-192.png`,
  `${BASE_PATH}/icons/icon-512.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // キャッシュがあれば返しつつ、バックグラウンドで更新
      if (cachedResponse) {
        // stale-while-revalidate: キャッシュを返しつつ更新
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {})
        );
        return cachedResponse;
      }

      // キャッシュがなければネットワークから取得してキャッシュ
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          // _next/static などのアセットをキャッシュ
          if (url.pathname.startsWith(`${BASE_PATH}/_next/`) ||
              url.pathname.startsWith(`${BASE_PATH}/icons/`) ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.css') ||
              url.pathname.endsWith('.woff2')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // オフラインでキャッシュもない場合、ナビゲーションならルートを返す
          if (request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}/`);
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
