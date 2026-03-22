import { okResponse } from '../http.js'
import { getVideoInfo } from './api.js'
import { proxyVideo } from './proxy.js'
import { buildRouteUrl, extractParamsFromShareUrl } from './utils.js'

export function getDoubaoRoutes(): Record<string, unknown> {
  return {
    parse: {
      method: 'POST',
      path: '/api/doubao-video/parse',
      body: { shareUrl: 'https://www.doubao.com/video-sharing?...' },
    },
    stream: {
      method: 'GET',
      path: '/api/doubao-video/stream?share_id=xxx&video_id=xxx',
    },
    download: {
      method: 'GET',
      path: '/api/doubao-video/download?share_id=xxx&video_id=xxx',
    },
  }
}

export async function handleDoubaoParse(request: Request): Promise<Response> {
  const payload = await request.json() as { shareUrl?: string }
  const shareUrl = payload?.shareUrl

  if (!shareUrl) {
    throw new Error('请提供分享链接')
  }

  const { shareId, videoId } = extractParamsFromShareUrl(shareUrl)
  const videoInfo = await getVideoInfo(shareId, videoId)

  return okResponse({
    shareId,
    videoId,
    videoInfo,
    streamUrl: buildRouteUrl(request.url, '/api/doubao-video/stream', shareId, videoId, 'main'),
    backupStreamUrl: videoInfo.play_info?.backup
      ? buildRouteUrl(request.url, '/api/doubao-video/stream', shareId, videoId, 'backup')
      : null,
    downloadUrl: buildRouteUrl(
      request.url,
      '/api/doubao-video/download',
      shareId,
      videoId,
      'main',
    ),
    backupDownloadUrl: videoInfo.play_info?.backup
      ? buildRouteUrl(request.url, '/api/doubao-video/download', shareId, videoId, 'backup')
      : null,
  })
}

export async function handleDoubaoStream(request: Request, requestUrl: URL): Promise<Response> {
  return proxyVideo(request, requestUrl, false)
}

export async function handleDoubaoDownload(
  request: Request,
  requestUrl: URL,
): Promise<Response> {
  return proxyVideo(request, requestUrl, true)
}
