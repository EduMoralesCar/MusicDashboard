"use client"

if (typeof window !== "undefined" && !window.__eumoraFetchIntercepted) {
  window.__eumoraFetchIntercepted = true

  const originalFetch = window.fetch
  window.fetch = async function (input, init) {
    let url = ""
    let requestOptions: RequestInit = init || {}

    if (typeof input === "string") {
      url = input
    } else if (input instanceof URL) {
      url = input.toString()
    } else {
      // Input is a Request object
      url = input.url
      const headersObj: Record<string, string> = {}
      input.headers.forEach((value, key) => {
        headersObj[key] = value
      })
      requestOptions = {
        method: input.method,
        body: input.body,
        headers: { ...headersObj, ...(init?.headers || {}) },
        credentials: input.credentials || init?.credentials,
        mode: input.mode,
        cache: input.cache,
        redirect: input.redirect,
        referrer: input.referrer,
        integrity: input.integrity,
        keepalive: input.keepalive,
        signal: input.signal,
        ...init
      }
    }

    // Only intercept relative requests starting with /api/
    if (url.startsWith("/api/")) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ""
      url = `${apiBaseUrl}${url}`

      const headers = new Headers(requestOptions.headers || {})
      const token = localStorage.getItem("eumora_session_token")
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      requestOptions.headers = headers
      requestOptions.credentials = "include" // ensure cookies are passed when supported
    }

    return originalFetch(url, requestOptions)
  }
}

// Support TypeScript window object declaration
declare global {
  interface Window {
    __eumoraFetchIntercepted?: boolean
  }
}

export function MobileInitializer() {
  return null
}
