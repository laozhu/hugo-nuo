var cacheName = 'hugo-nuo-v1';
var filesToCache = [
  './favicon.ico',
  './manifest.json',
  './styles/main.min.css',
  './scripts/index.min.js',
  './images/avatar.png',
  './images/grey-prism.svg',
  './images/qrcode.jpg',
  './icons/icon-16x16.png',
  './icons/icon-32x32.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css?family=Lobster',
  'https://fonts.gstatic.com/s/lobster/v20/neILzCirqoswsqX9zoKmM4MwWJU.woff2',
  'https://at.alicdn.com/t/font_174169_qmgvd10zwbf.woff',
  'https://cdn.jsdelivr.net/npm/smooth-scroll@15.0.0/dist/smooth-scroll.min.js',
  'https://cdn.jsdelivr.net/npm/medium-zoom@1.0.2/dist/medium-zoom.min.js',
  'https://cdn.jsdelivr.net/npm/video.js@7.3.0/dist/video-js.min.css',
  'https://cdn.jsdelivr.net/npm/video.js@7.3.0/dist/video.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
  'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/config/TeX-AMS-MML_HTMLorMML.js?V=2.7.5'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;
      var request = event.request.clone();
      return fetch(request).then(function (httpResponse) {
        if (!httpResponse || httpResponse.status !== 200) return httpResponse;
        // Update caches
        var responseClone = httpResponse.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return httpResponse;
      });
    })
  );
});


