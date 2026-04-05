/**
 * Cliente HTTP centralizado para todas las peticiones
 */

export interface HttpResponse<T = unknown> {
  ok: boolean
  status: number
  data?: T
  error?: string
}

/**
 * Realiza una petición GET
 */
export async function httpGet<T = unknown>(url: string): Promise<HttpResponse<T>> {
  try {
    const response = await fetch(url)
    const data = response.ok ? await response.json() : undefined

    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      error: !response.ok ? `HTTP ${response.status}` : undefined
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

/**
 * Realiza una petición POST
 */
export async function httpPost<T = unknown>(
  url: string,
  body: FormData | Record<string, unknown>
): Promise<HttpResponse<T>> {
  try {
    const headers: HeadersInit = {}
    let bodyToSend: BodyInit

    if (body instanceof FormData) {
      bodyToSend = body
    } else {
      headers['Content-Type'] = 'application/json'
      bodyToSend = JSON.stringify(body)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyToSend
    })

    let data: T | undefined
    try {
      data = (await response.json()) as T
    } catch {
      // Si la respuesta no es JSON válido, es normal
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: !response.ok ? `HTTP ${response.status}` : undefined
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

/**
 * Realiza una petición PUT
 */
export async function httpPut<T = unknown>(
  url: string,
  body: Record<string, unknown>
): Promise<HttpResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    let data: T | undefined
    try {
      data = (await response.json()) as T
    } catch {
      // Si la respuesta no es JSON válido, es normal
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: !response.ok ? `HTTP ${response.status}` : undefined
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}
