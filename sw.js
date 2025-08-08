// Definiamo un nome e una versione per la nostra cache
const CACHE_NAME = 'diario-personale-cache-v1';

// Lista dei file fondamentali dell'app da salvare in cache (l' "App Shell")
const APP_SHELL_URLS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
  // Aggiungi qui altri file statici se ne hai, come i file dei font se li ospiti tu
];

// Evento "install": si verifica quando il service worker viene installato per la prima volta.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installazione...');
  // Aspettiamo che la cache venga aperta e che tutti i file dell'app shell siano salvati.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching dell\'App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// Evento "activate": si verifica quando il service worker viene attivato.
// Utile per pulire le vecchie cache se ne creiamo una nuova versione.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Attivazione...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Pulizia vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento "fetch": si verifica ogni volta che l'app fa una richiesta di rete (es. per un file CSS, un'immagine, etc.).
// Qui intercettiamo la richiesta e decidiamo se rispondere con la versione in cache o con una richiesta di rete.
self.addEventListener('fetch', (event) => {
  // Strategia "Cache First"
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se la risorsa è in cache, la restituiamo da lì.
      if (response) {
        // console.log('Service Worker: Risorsa trovata in cache:', event.request.url);
        return response;
      }
      // Altrimenti, facciamo la richiesta di rete.
      // console.log('Service Worker: Risorsa non in cache, fetching:', event.request.url);
      return fetch(event.request);
    })
  );
});
