export type NaverMapInstance = {
  setCenter: (position: unknown) => void
  setSize: (size: unknown) => void
}

export type NaverMaps = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMapInstance
    LatLng: new (latitude: number, longitude: number) => unknown
    Size: new (width: number, height: number) => unknown
    Marker: new (options: Record<string, unknown>) => { setMap: (map: unknown) => void }
    Event: { addListener: (target: unknown, event: string, listener: () => void) => void }
  }
}

declare global {
  interface Window {
    naver?: NaverMaps
    navermap_authFailure?: () => void
  }
}

let naverMapsPromise: Promise<NaverMaps> | null = null

export const useNaverMaps = () => {
  const loadNaverMaps = (clientId: string) => {
    if (window.naver?.maps) return Promise.resolve(window.naver)
    if (naverMapsPromise) return naverMapsPromise

    naverMapsPromise = new Promise<NaverMaps>((resolve, reject) => {
      if (!document.head) {
        reject(new Error('Document head is unavailable for NAVER Maps'))
        return
      }

      window.navermap_authFailure = () => reject(new Error('NAVER Maps authentication failed. Check Client ID and allowed Web Service URLs.'))
      const settleLoaded = () => window.naver?.maps ? resolve(window.naver) : reject(new Error('NAVER Maps loaded without its maps SDK'))
      const existing = document.querySelector<HTMLScriptElement>('script[data-locorea-naver-maps], script[src*="oapi.map.naver.com/openapi/v3/maps.js"]')

      if (existing) {
        if (existing.dataset.locoreaNaverMapsLoaded === 'true') settleLoaded()
        else {
          existing.addEventListener('load', settleLoaded, { once: true })
          existing.addEventListener('error', () => reject(new Error('NAVER Maps failed to load')), { once: true })
        }
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.dataset.locoreaNaverMaps = 'true'
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&language=en`
      script.onload = () => {
        script.dataset.locoreaNaverMapsLoaded = 'true'
        settleLoaded()
      }
      script.onerror = () => reject(new Error('NAVER Maps failed to load'))
      document.head.appendChild(script)
    }).catch((error: unknown) => {
      naverMapsPromise = null
      throw error
    })

    return naverMapsPromise
  }

  return { loadNaverMaps }
}
