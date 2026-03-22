import { CORS_HEADERS, errorResponse } from '../http.js'
import { VIDEO_USER_AGENT } from './config.js'
import { getVideoInfo, type DoubaoVideoInfo } from './api.js'
import { buildFilename } from './utils.js'

function buildProxyRequestHeaders(request: Request): Headers {
  const headers = new Headers({
    'User-Agent': VIDEO_USER_AGENT,
    Referer: 'https://www.doubao.com/',
    Origin: 'https://www.doubao.com',
  })

  const range = request.headers.get('Range')
  if (range) {
    headers.set('Range', range)
  }

  return headers
}

function buildProxyResponseHeaders(
  upstreamHeaders: Headers,
  downloadFilename: string | null,
): Headers {
  const headers = new Headers(CORS_HEADERS)
  const passThroughHeaders = [
    'accept-ranges',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'last-modified',
    'cache-control',
  ]

  for (const headerName of passThroughHeaders) {
    const value = upstreamHeaders.get(headerName)
    if (value) {
      headers.set(headerName, value)
    }
  }

  if (!headers.get('content-type')) {
    headers.set('content-type', 'video/mp4')
  }

  if (downloadFilename) {
    headers.set(
      'Content-Disposition',
      `attachment; filename="${downloadFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`,
    )
  }

  return headers
}

export async function proxyVideo(
  request: Request,
  requestUrl: URL,
  isDownload: boolean,
): Promise<Response> {
  const shareId = requestUrl.searchParams.get('share_id')
  const videoId = requestUrl.searchParams.get('video_id')
  const source = requestUrl.searchParams.get('source') || 'main'

  if (!shareId || !videoId) {
    return errorResponse('缺少 share_id 或 video_id 参数', 400)
  }

  const videoInfo = await getVideoInfo(shareId, videoId)
  const candidates =
    source === 'backup'
      ? [videoInfo.play_info.backup]
      : [videoInfo.play_info.main, videoInfo.play_info.backup]

  let lastError: unknown = null

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    try {
      const upstream = await fetch(candidate, {
        method: request.method,
        headers: buildProxyRequestHeaders(request),
      })

      if (!upstream.ok && upstream.status !== 206) {
        throw new Error(`视频源响应异常：${upstream.status}`)
      }

      const filename = isDownload ? buildFilename(videoInfo as DoubaoVideoInfo, videoId) : null
      const headers = buildProxyResponseHeaders(upstream.headers, filename)

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('视频代理失败')
}
