const staticCacheName = 'site-static-v2';
const dynamicCacheName = 'site-dynamic-v2';
const assets = [
  '/',
  '/public/index.html',
  '/public/pages/Research.html',
  '/public/pages/Brainstorming.html',
  '/public/pages/Define.html',
  '/public/pages/DigDeeper.html',
  '/public/pages/Info.html',
  '/public/pages/Interesting.html',
  '/public/pages/Poster.html',
  '/public/pages/Prototype.html',
  '/public/pages/Storyboard.html',
  '/public/pages/Synthesize.html',
  '/public/pages/Test.html',
  '/public/pages/Test2.html',


  '/public/js/app.js',
  '/public/js/ui.js',
  '/public/js/materialize.min.js',
  '/public/css/styles.css',
  '/public/css/materialize.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 40);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/pages/fallback.html');
        } 
      })
    );
  }
});

// document.cookie = "lastPosition=" + cookieValue + "; max-age=60*60*24*3; path=/public/pages/Research.html; domain=domain=myhome.me";
