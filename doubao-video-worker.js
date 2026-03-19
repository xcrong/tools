/**
 * 豆包视频 Cloudflare Worker
 *
 * 路由：
 * - POST /parse        解析分享链接，返回视频信息 + stream/download 地址
 * - GET  /stream       流式代理视频，适合 <video> 直接播放
 * - GET  /download     流式代理视频，并附带下载响应头
 * - GET  /             返回简单说明
 */

const DOUBAO_API_URL = 'https://www.doubao.com/creativity/share/get_video_share_info?' +
  new URLSearchParams({
    version_code: '20800',
    language: 'zh-CN',
    device_platform: 'web',
    aid: '497858',
    real_aid: '497858',
    pkg_type: 'release_version',
    device_id: '',
    pc_version: '2.51.7',
    region: '',
    sys_region: '',
    samantha_web: '1',
    'use-olympus-account': '1',
    web_tab_id: '',
  }).toString()

const API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090c33) XWEB/14315 Flue',
  Origin: 'https://www.doubao.com',
  'Content-Type': 'application/json',
}

const VIDEO_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Access-Control-Expose-Headers':
    'Content-Length, Content-Range, Content-Type, Accept-Ranges, Content-Disposition',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status)
}

function extractParamsFromShareUrl(shareUrl) {
  const url = new URL(shareUrl)
  const shareId = url.searchParams.get('share_id')
  const videoId = url.searchParams.get('video_id')

  if (!shareId || !videoId) {
    throw new Error('链接中缺少必要参数 share_id 或 video_id')
  }

  return { shareId, videoId }
}

function getRoute(url) {
  const pathname = url.pathname.replace(/\/+$/, '') || '/'
  return pathname
}

function buildRouteUrl(requestUrl, path, shareId, videoId, source = 'main') {
  const url = new URL(path, requestUrl)
  url.searchParams.set('share_id', shareId)
  url.searchParams.set('video_id', videoId)
  url.searchParams.set('source', source)
  return url.toString()
}

function sanitizeFilePart(value) {
  return value
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 60)
}

function buildFilename(videoInfo, videoId) {
  const nickname = sanitizeFilePart(videoInfo.user_info?.nickname || 'doubao')
  const definition = sanitizeFilePart(videoInfo.play_info?.definition || 'video')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${nickname}_${definition}_${videoId}_${timestamp}.mp4`
}

async function getVideoInfo(shareId, videoId) {
  const response = await fetch(DOUBAO_API_URL, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      share_id: shareId,
      vid: videoId,
      creation_id: '',
    }),
  })

  if (!response.ok) {
    throw new Error(`豆包 API 请求失败：${response.status}`)
  }

  const result = await response.json()

  if (result.code !== 0) {
    throw new Error(`豆包 API 错误：${result.msg || '未知错误'}`)
  }

  if (!result.data?.play_info?.main) {
    throw new Error('响应中缺少视频播放信息')
  }

  return result.data
}

function getProxyTargetUrl(videoInfo, source) {
  if (source === 'backup') {
    if (!videoInfo.play_info?.backup) {
      throw new Error('当前视频没有备用链接')
    }
    return videoInfo.play_info.backup
  }

  return videoInfo.play_info.main
}

function buildProxyRequestHeaders(request) {
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

function buildProxyResponseHeaders(upstreamHeaders, downloadFilename) {
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

async function proxyVideo(request, requestUrl, isDownload) {
  const shareId = requestUrl.searchParams.get('share_id')
  const videoId = requestUrl.searchParams.get('video_id')
  const source = requestUrl.searchParams.get('source') || 'main'

  if (!shareId || !videoId) {
    return errorResponse('缺少 share_id 或 video_id 参数', 400)
  }

  const videoInfo = await getVideoInfo(shareId, videoId)
  const candidates = source === 'backup'
    ? [videoInfo.play_info.backup]
    : [videoInfo.play_info.main, videoInfo.play_info.backup]

  let lastError = null

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

      const filename = isDownload ? buildFilename(videoInfo, videoId) : null
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

async function handleParse(request) {
  let payload

  try {
    payload = await request.json()
  } catch {
    return errorResponse('请求体必须是 JSON', 400)
  }

  const shareUrl = payload?.shareUrl
  if (!shareUrl) {
    return errorResponse('请提供分享链接', 400)
  }

  const { shareId, videoId } = extractParamsFromShareUrl(shareUrl)
  const videoInfo = await getVideoInfo(shareId, videoId)

  return jsonResponse({
    shareId,
    videoId,
    ...videoInfo,
    stream_url: buildRouteUrl(request.url, '/stream', shareId, videoId, 'main'),
    backup_stream_url: videoInfo.play_info?.backup
      ? buildRouteUrl(request.url, '/stream', shareId, videoId, 'backup')
      : null,
    download_url: buildRouteUrl(request.url, '/download', shareId, videoId, 'main'),
    backup_download_url: videoInfo.play_info?.backup
      ? buildRouteUrl(request.url, '/download', shareId, videoId, 'backup')
      : null,
  })
}

function handleIndex() {
  return jsonResponse({
    name: 'doubao-video-worker',
    routes: {
      parse: {
        method: 'POST',
        path: '/parse',
        body: { shareUrl: 'https://www.doubao.com/video-sharing?...' },
      },
      stream: {
        method: 'GET',
        path: '/stream?share_id=xxx&video_id=xxx',
      },
      download: {
        method: 'GET',
        path: '/download?share_id=xxx&video_id=xxx',
      },
    },
  })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      })
    }

    const requestUrl = new URL(request.url)
    const route = getRoute(requestUrl)

    try {
      if (route === '/' && request.method === 'GET') {
        return handleIndex()
      }

      if (route === '/parse' && request.method === 'POST') {
        return await handleParse(request)
      }

      if (route === '/stream' && (request.method === 'GET' || request.method === 'HEAD')) {
        return await proxyVideo(request, requestUrl, false)
      }

      if (route === '/download' && (request.method === 'GET' || request.method === 'HEAD')) {
        return await proxyVideo(request, requestUrl, true)
      }

      return errorResponse('路由不存在', 404)
    } catch (error) {
      console.error('豆包视频 Worker 错误:', error)
      return errorResponse(error instanceof Error ? error.message : '未知错误', 500)
    }
  },
}
