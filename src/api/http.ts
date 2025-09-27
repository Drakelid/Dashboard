const IS_DEV = (import.meta as any).env?.DEV
const DEFAULT_PROD_API_BASE_URL = 'https://test.sambring.no'
// Prefer VITE_API_BASE_URL, otherwise fall back to VITE_API_TARGET or default Django host for direct calls
export const API_BASE_URL = IS_DEV
  ? ''
  : (((import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_TARGET) || DEFAULT_PROD_API_BASE_URL)

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  query?: Record<string, any>
  headers?: Record<string, string>
  signal?: AbortSignal
  auth?: {
    apiKey?: string
    basic?: { username: string; password: string }
  }
}

export class HttpError<T = any> extends Error {
  status: number
  data?: T
  constructor(status: number, message: string, data?: T) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

let onUnauthorized: (() => void) | undefined
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

let defaultAuth: RequestOptions['auth'] | undefined
export function setDefaultAuth(auth?: RequestOptions['auth']) {
  defaultAuth = auth
}

// Expose current default auth config (used by dev Auth Mode banner)
export function getDefaultAuthConfig(): RequestOptions['auth'] | undefined {
  return defaultAuth
}

function buildUrl(path: string, query?: Record<string, any>, routingOverride?: 'proxy' | 'direct') {
  const clean = path.startsWith('/') ? path : `/${path}`
  let url: URL
  const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : ''
  const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost'
  const routing = (((import.meta as any).env?.VITE_API_ROUTING ?? '').toString().toLowerCase())
  const forceProxyEnv = (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString().toLowerCase() === 'true') || (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString() === '1')
  const hasExplicitBase = typeof API_BASE_URL === 'string' && API_BASE_URL.trim().length > 0
  const queryParams = new URLSearchParams()
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue
      queryParams.append(k, String(v))
    }
  }
  const queryString = queryParams.toString()
  const targetPathWithQuery = queryString ? `${clean}?${queryString}` : clean

  // Decide routing behavior
  let useProxyPath: boolean
  if (routingOverride === 'proxy') useProxyPath = true
  else if (routingOverride === 'direct') useProxyPath = false
  else if (routing === 'proxy') useProxyPath = true
  else if (routing === 'direct') useProxyPath = false
  else {
    if (forceProxyEnv) useProxyPath = true
    else {
      const preferProxyHost = host.endsWith('.vercel.app') && !hasExplicitBase
      useProxyPath = preferProxyHost
    }
  }

  if (useProxyPath) {
    const proxyUrl = new URL('/api/proxy', origin)
    const target = clean.startsWith('/api/proxy') ? clean : targetPathWithQuery
    proxyUrl.searchParams.set('target', target)
    url = proxyUrl
  } else {
    const base = API_BASE_URL.replace(/\/$/, '')
    url = new URL(base + targetPathWithQuery)
  }
  return url.toString()
}

function authHeader(opts?: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {}
  const sourceAuth = opts?.auth ?? defaultAuth
  if (sourceAuth?.basic) {
    const { username, password } = sourceAuth.basic
    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`)
    return headers
  }

  const key = sourceAuth?.apiKey || (import.meta as any).env?.VITE_API_KEY
  if (key) {
    const headerName = ((import.meta as any).env?.VITE_API_KEY_HEADER as string | undefined) || 'Authorization'
    const scheme = (import.meta as any).env?.VITE_API_KEY_SCHEME as string | undefined
    const raw = (import.meta as any).env?.VITE_API_KEY_RAW as string | undefined
    const isRaw = (raw || '').toLowerCase() === 'true' || raw === '1'
    const value = isRaw
      ? key
      : (scheme ? `${scheme} ${key}` : (key.includes(' ') ? key : `Api-Key ${key}`))
    headers[headerName] = value
  }
  return headers
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null
  return null
}

export function getCsrfTokenValue(): string | null {
  const names = [
    'csrftoken',
    'csrf',
    'csrf_token',
    'XSRF-TOKEN',
    'xsrf-token',
    'XSRFToken',
    'X_CSRF_TOKEN',
    'CSRF-TOKEN',
  ]
  for (const n of names) {
    const v = getCookie(n)
    if (v) return v
  }
  return null
}

export function hasCsrfCookie(): boolean {
  return !!getCsrfTokenValue()
}

export async function primeCsrf(): Promise<void> {
  if (hasCsrfCookie()) return
  const candidates = [
    // Known working endpoints on test should set CSRF cookie via middleware
    '/api/driver/profile/',
    '/api/driver/profile',
    '/api/auth/csrf/',
    '/api/csrf/',
    '/dashboard/api/csrf/',
    '/dashboard/api/auth/csrf/',
    '/auth/csrf/',
    '/csrf/',
    '/sanctum/csrf-cookie',
    '/api/',
  ]
  for (const p of candidates) {
    try {
      const url = buildUrl(p)
      await fetch(url, { method: 'GET', credentials: 'include' })
      if (hasCsrfCookie()) return
    } catch {
      // ignore and try next
    }
  }
}

function maybeAttachCsrf(method: HttpMethod, headers: Record<string, string>) {
  // Our HttpMethod excludes HEAD/OPTIONS/TRACE, so 'unsafe' is simply any non-GET
  const unsafe = method !== 'GET'
  if (!unsafe) return
  const token = getCsrfTokenValue()
  if (!token) return
  if (!('X-CSRFToken' in headers)) headers['X-CSRFToken'] = token
  if (!('X-CSRF-Token' in headers)) headers['X-CSRF-Token'] = token
  if (!('X-XSRF-TOKEN' in headers)) headers['X-XSRF-TOKEN'] = token
  if (!('X-XSRFToken' in headers)) headers['X-XSRFToken'] = token
}

async function parseBody<T>(res: Response): Promise<T | undefined> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return (await res.json()) as T
  }
  const text = await res.text()
  return text as unknown as T
}

async function request<T>(method: HttpMethod, path: string, body?: any, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...opts.headers,
    ...authHeader(opts),
  }

  const routingPref = (((import.meta as any).env?.VITE_API_ROUTING ?? '').toString().toLowerCase())
  const forceProxyEnv = (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString().toLowerCase() === 'true') || (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString() === '1')
  const init: RequestInit = {
    method,
    // Only include credentials (cookies) when not sending Authorization (API key/basic)
    // This enables cookie-based auth locally while allowing proxy-based API key mode in prod without CORS credential issues.
    credentials: 'omit',
    signal: opts.signal,
    headers,
  }

  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // Let browser set multipart boundary
      ;(init as any).body = body
    } else {
      headers['Content-Type'] = 'application/json'
      ;(init as any).body = JSON.stringify(body)
    }
  }

  const apiKeyHeaderName = ((import.meta as any).env?.VITE_API_KEY_HEADER as string | undefined) || 'Authorization'
  const hasAuthHeader = !!headers[apiKeyHeaderName]
  if (!hasAuthHeader) {
    init.credentials = 'include'
  }

  // Ensure CSRF cookie exists for unsafe methods when NOT using Authorization, then attach header if present
  const unsafe = method !== 'GET'
  if (!hasAuthHeader) {
    if (unsafe && !hasCsrfCookie()) {
      await primeCsrf().catch(() => {})
    }
    maybeAttachCsrf(method, headers)
  }

  // If Authorization header is present, prefer direct routing automatically (Option A)
  const wantsProxyRouting = forceProxyEnv || routingPref === 'proxy'
  const wantsDirectRouting = routingPref === 'direct'
  let routingOverride: 'proxy' | 'direct' | undefined

  const shouldForceProxyForCookies = (() => {
    if (typeof window === 'undefined') return false
    if (init.credentials !== 'include') return false
    try {
      if (!API_BASE_URL) return false
      const apiHost = new URL(API_BASE_URL).hostname
      const currentHost = window.location.hostname
      return apiHost && currentHost && apiHost !== currentHost
    } catch {
      return false
    }
  })()

  if (shouldForceProxyForCookies) routingOverride = 'proxy'
  else if (wantsProxyRouting) routingOverride = 'proxy'
  else if (hasAuthHeader && !wantsProxyRouting && !forceProxyEnv) routingOverride = 'direct'
  else if (wantsDirectRouting) routingOverride = 'direct'
  else routingOverride = undefined
  const url = buildUrl(path, opts.query, routingOverride as any)

  async function doFetch(attempt: number): Promise<{ res: Response; data: any }> {
    const res = await fetch(url, init)

    // If CSRF blocked the request, try to prime CSRF and retry once for unsafe methods (only when not using Authorization)
    const unsafeRetry = method !== 'GET'
    if (!hasAuthHeader && !res.ok && res.status === 403 && unsafeRetry && attempt < 1) {
      await primeCsrf().catch(() => {})
      maybeAttachCsrf(method, headers)
      return doFetch(attempt + 1)
    }

    // Retry GET on transient 5xx once
    if (!res.ok && res.status >= 500 && res.status < 600 && method === 'GET' && attempt < 1) {
      await new Promise(r => setTimeout(r, 500))
      return doFetch(attempt + 1)
    }
    const data = await parseBody<any>(res)
    return { res, data }
  }

  const { res, data } = await doFetch(0)

  if (!res.ok) {
    // Surface proxy debug headers if present to help diagnose in production
    try {
      const upstream = res.headers.get('x-proxy-upstream-url') || res.headers.get('X-Proxy-Upstream-Url')
      const target = res.headers.get('x-proxy-target-origin') || res.headers.get('X-Proxy-Target-Origin')
      const reqMethod = res.headers.get('x-proxy-request-method') || res.headers.get('X-Proxy-Request-Method')
      if (upstream || target) {
        // eslint-disable-next-line no-console
        console.warn('[proxy]', res.status, reqMethod || method, 'path:', path, 'upstream:', upstream, 'target:', target)
      }
    } catch {}
    const msg = (data && (data.detail || data.message)) || res.statusText || 'Request failed'
    // In cookie mode, treat 401/403 as unauthorized. Also treat 404 from auth resources as unauthorized
    const isAuthResource = (
      path.includes('/driver/profile') ||
      path.includes('/driver/deliveries') ||
      path.includes('/users/me') ||
      path.endsWith('/api/profile') || path.endsWith('/api/profile/') ||
      path.includes('/auth/user')
    )
    const shouldUnauthorized = !hasAuthHeader && (res.status === 401 || res.status === 403 || (res.status === 404 && isAuthResource))
    if (shouldUnauthorized && onUnauthorized) onUnauthorized()
    throw new HttpError(res.status, msg, data)
  }

  return data as T
}

export const http = {
  request,
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: any, opts?: RequestOptions) => request<T>('POST', path, body, opts),
  put: <T>(path: string, body?: any, opts?: RequestOptions) => request<T>('PUT', path, body, opts),
  patch: <T>(path: string, body?: any, opts?: RequestOptions) => request<T>('PATCH', path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, undefined, opts),
}
