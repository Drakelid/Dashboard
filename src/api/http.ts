const IS_DEV = (import.meta as any).env?.DEV
export const API_BASE_URL = IS_DEV ? '' : ((import.meta as any).env?.VITE_API_BASE_URL || '')

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

function buildUrl(path: string, query?: Record<string, any>) {
  const clean = path.startsWith('/') ? path : `/${path}`
  let url: URL
  // On Vercel (host ends with .vercel.app), prefer same-origin so rewrites in vercel.json apply and avoid CORS entirely.
  const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : ''
  const forceRelative = host.endsWith('.vercel.app') || (((import.meta as any).env?.VITE_FORCE_RELATIVE_API ?? '').toString().toLowerCase() === 'true')
  const forceProxyPath = (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString().toLowerCase() === 'true') || (((import.meta as any).env?.VITE_FORCE_PROXY_PATH ?? '').toString() === '1')
  if (!API_BASE_URL || forceRelative) {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost'
    // By default rely on rewrites; but allow forcing direct function path via env toggle.
    const pathToUse = (forceProxyPath && !clean.startsWith('/api/proxy')) ? `/api/proxy${clean}` : clean
    url = new URL(pathToUse, origin)
  } else {
    const base = API_BASE_URL.replace(/\/$/, '')
    url = new URL(base + clean)
  }
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue
      url.searchParams.append(k, String(v))
    }
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
    '/api/auth/csrf/',
    '/api/csrf/',
    '/dashboard/api/csrf/',
    '/dashboard/api/auth/csrf/',
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

  const url = buildUrl(path, opts.query)

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
