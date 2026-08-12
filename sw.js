/* Colombia Responde — Service Worker
   Estrategia:
   - Shell (index.html, manifest, iconos): cache-first. La app abre sin señal.
   - datos.json: network-first con respaldo en caché. Si hay señal trae lo último;
     si no, muestra lo último guardado y la app avisa "sin conexión".
   Desarrollada por Vibras Positivas HM — Derechos de Autor Reservados
*/
const VERSION = 'cr-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './og-image.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // datos.json y replicas.json: siempre red primero, con copia de respaldo
  if (url.pathname.endsWith('datos.json') || url.pathname.endsWith('replicas.json')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Navegación: si no hay red, devuelve el shell
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Resto: caché primero
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copia = res.clone();
        caches.open(VERSION).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => hit || new Response('', {status:504, statusText:'Sin conexion'})))
  );
});
