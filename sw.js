/* Afix service worker: keeps the app shell on the phone so it opens fast and offline.
   Bump VERSION whenever app files change, so phones pick up the new version. */
const VERSION = 'afix-v3';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/config.js', 'js/util.js', 'js/install.js', 'js/domain.js', 'js/sample.js', 'js/store.js', 'js/reminders.js',
  'js/views.js', 'js/forms.js', 'js/account.js', 'js/transfer.js', 'js/app.js',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png', 'assets/icons/favicon.png',
  'assets/sample/aria.jpg', 'assets/sample/luna.jpg', 'assets/sample/mira.jpg', 'assets/sample/bruno.jpg', 'assets/sample/nova.jpg',
  'assets/sample/pup1.jpg', 'assets/sample/pup2.jpg', 'assets/sample/pup3.jpg', 'assets/sample/hero.jpg'
];
const CDN = ['https://cdn.jsdelivr.net/', 'https://cdnjs.cloudflare.com/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Account data, photos and login always go to the network (never cached here).
  if (url.hostname.endsWith('supabase.co')) return;

  // Pages: try the network first so updates show up; fall back to the saved copy offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // App files, fonts and libraries: serve the saved copy, refresh it in the background.
  if (url.origin === location.origin || CDN.some(p => req.url.startsWith(p))) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
