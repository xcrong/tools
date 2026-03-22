export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
  'Access-Control-Expose-Headers':
    'Content-Length, Content-Range, Content-Type, Accept-Ranges, Content-Disposition',
} as const

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

export function errorResponse(message: string, status = 500, details: unknown = null): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        message,
        details,
      },
    },
    status,
  )
}

export function okResponse(data: unknown, status = 200): Response {
  return jsonResponse({
    ok: true,
    data,
  }, status)
}

export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}
