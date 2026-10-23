import { API_BASE_URL } from '../utils/constants'

export class ApiError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: HeadersInit
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('http') ? path : `${normalizedBase}/${path.replace(/^\/+/, '')}`
  const url = new URL(normalizedPath)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, params, headers, ...requestInit } = options

  const requestHeaders = new Headers(headers ?? {})
  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('content-type') ?? ''
    const rawText = await response.text()
    const payload = rawText && contentType.includes('application/json') ? JSON.parse(rawText) : rawText || undefined

    if (!response.ok) {
      throw new ApiError(
        response.statusText || 'The request could not be completed.',
        response.status,
        payload,
      )
    }

    return payload as T
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request was cancelled.', 499)
    }

    if (error instanceof ApiError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'An unexpected API error occurred.'
    throw new ApiError(message, undefined, error)
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'body'>) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  del: <T>(path: string, options?: Omit<ApiRequestOptions, 'body'>) => apiRequest<T>(path, { ...options, method: 'DELETE' }),
}
