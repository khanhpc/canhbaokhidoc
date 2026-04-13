// public/sw.js
const CACHE_NAME = 'smarthome-cache-v1';

// Những file sẽ được tải sẵn để dùng khi mất mạng
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Cài đặt bộ nhớ đệm (Cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đã nạp bộ nhớ đệm');
        return cache.addAll(urlsToCache);
      })
  );
});

// Chặn các yêu cầu tải trang để lấy từ Cache ra (Giúp app chạy nhanh như điện)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu có trong cache thì trả về luôn, không có thì mới gọi internet
        return response || fetch(event.request);
      })
  );
});