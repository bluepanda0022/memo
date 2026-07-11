const CACHE_NAME = 'memo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// 설치 단계: 에셋 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 활성화 단계: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 페치 단계: 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // GET 요청만 처리
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((response) => {
      // 캐시에 있으면 반환
      if (response) {
        return response;
      }
      
      // 캐시 없으면 네트워크 요청
      return fetch(request).then((response) => {
        // 네트워크 요청 실패하면 오프라인 페이지 반환
        if (!response || response.status !== 200) {
          return response;
        }
        
        // 성공한 응답 캐시에 저장
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return response;
      }).catch(() => {
        // 네트워크 실패 시 캐시된 버전 반환
        return caches.match(request);
      });
    })
  );
});

// 백그라운드 동기 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    // 주기적 동기화 로직
    event.waitUntil(
      Promise.resolve()
    );
  }
});
