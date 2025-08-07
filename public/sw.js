// YSK 안과의원 Service Worker - 성능 최적화 v1.2.0
const CACHE_NAME = 'ysk-eye-clinic-v1.2.0'
const API_CACHE = 'ysk-api-cache-v1.0.0'
const STATIC_CACHE = 'ysk-static-cache-v1.0.0'

// Critical Resources Only - 초기 로딩에 필수적인 자산만
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // 오프라인 페이지는 별도 생성 필요
]

// 캐시 전략별 URL 패턴
const CACHE_STRATEGIES = {
  // Stale While Revalidate - 정적 자산 (빠른 응답 + 백그라운드 업데이트)
  SWR: [
    /\/_next\/static\/.*/,
    /\.(?:js|css|svg|png|jpg|jpeg|gif|webp|avif|woff2?)$/,
    /\/images\/.*/,
    /\/icons\/.*/
  ],
  // Cache First - 폰트 및 외부 자산 (변경 빈도가 낮음)
  CACHE_FIRST: [
    /https:\/\/fonts\.googleapis\.com/,
    /https:\/\/fonts\.gstatic\.com/,
    /\.(?:woff2?|ttf|otf)$/
  ],
  // Network First - API 및 동적 콘텐츠 (실시간성 중요)
  NETWORK_FIRST: [
    /\/api\/.*/,
    /https:\/\/.*\.supabase\.co/,
    /https:\/\/api\.openai\.com/
  ]
}

// 설치 이벤트 - Critical Resources만 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v1.2.0')
  
  event.waitUntil(
    Promise.all([
      // Critical Resources 캐시
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES).catch(error => {
          console.warn('[SW] Some critical resources failed to cache:', error)
          // Critical 실패시에도 설치 진행 (점진적 개선)
          return Promise.resolve()
        })
      }),
      // 즉시 활성화
      self.skipWaiting()
    ])
  )
})

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v1.2.0')
  
  event.waitUntil(
    Promise.all([
      // 이전 버전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => 
              name.startsWith('ysk-') && 
              name !== CACHE_NAME && 
              name !== API_CACHE &&
              name !== STATIC_CACHE
            )
            .map(name => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      }),
      // 즉시 클라이언트 제어권 획득
      self.clients.claim()
    ])
  )
})

// Fetch 이벤트 - 지능형 캐싱 전략 적용
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 캐시 불가능한 요청들 스킵
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'chrome:' ||
    url.protocol === 'moz-extension:' ||
    url.pathname.startsWith('/api/auth/') // 인증 관련 요청 제외
  ) {
    return
  }

  // 캐시 전략 결정 및 실행
  const strategy = getCacheStrategy(request.url)
  
  event.respondWith(
    executeStrategy(request, strategy)
      .catch((error) => {
        console.warn('[SW] Request failed:', error)
        // 오프라인 fallback
        if (request.headers.get('Accept')?.includes('text/html')) {
          return caches.match('/') || new Response('Offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          })
        }
        return new Response('Service Unavailable', { status: 503 })
      })
  )
})

// 캐시 전략 결정 함수
function getCacheStrategy(url) {
  if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url))) {
    return 'CACHE_FIRST'
  }
  if (CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url))) {
    return 'NETWORK_FIRST'
  }
  if (CACHE_STRATEGIES.SWR.some(pattern => pattern.test(url))) {
    return 'SWR'
  }
  return 'NETWORK_ONLY'
}

// 캐시 전략 실행 함수
async function executeStrategy(request, strategy) {
  const cacheName = strategy === 'NETWORK_FIRST' ? API_CACHE : STATIC_CACHE
  
  switch (strategy) {
    case 'CACHE_FIRST':
      return await cacheFirst(request, cacheName)
      
    case 'NETWORK_FIRST':
      return await networkFirst(request, cacheName)
      
    case 'SWR':
      return await staleWhileRevalidate(request, cacheName)
      
    default:
      return await fetch(request)
  }
}

// Cache First 전략 - 폰트 등 변경되지 않는 자산
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    throw error
  }
}

// Network First 전략 - API 등 실시간성 중요
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    // 성공한 API 응답만 캐시 (짧은 시간)
    if (response.ok && response.status < 400) {
      const responseToCache = response.clone()
      cache.put(request, responseToCache)
      
      // API 캐시는 1시간 후 자동 만료
      setTimeout(() => {
        cache.delete(request)
      }, 60 * 60 * 1000)
    }
    return response
  } catch (error) {
    // 네트워크 실패시 캐시 확인
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Stale While Revalidate 전략 - 정적 자산의 최적 전략
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  // 백그라운드에서 업데이트 (사용자는 기다리지 않음)
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cached) // 네트워크 실패시 캐시 반환
  
  // 캐시된 버전이 있으면 즉시 반환, 없으면 네트워크 대기
  return cached || fetchPromise
}

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 백그라운드에서 수행할 작업
      console.log('Background sync triggered')
    )
  }
})

// 푸시 알림 처리 (향후 확장용)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body || '연수김안과의원에서 알림이 도착했습니다.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'general',
      data: data.url || '/',
      actions: [
        {
          action: 'open',
          title: '확인하기'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title || '연수김안과의원',
        options
      )
    )
  }
})

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})
