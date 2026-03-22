export interface ShareParams {
  shareId: string
  videoId: string
}

export function extractParamsFromShareUrl(shareUrl: string): ShareParams {
  const url = new URL(shareUrl)
  const shareId = url.searchParams.get('share_id')
  const videoId = url.searchParams.get('video_id')

  if (!shareId || !videoId) {
    throw new Error('链接中缺少必要参数 share_id 或 video_id')
  }

  return { shareId, videoId }
}

export function buildRouteUrl(
  requestUrl: string,
  path: string,
  shareId: string,
  videoId: string,
  source = 'main',
): string {
  const url = new URL(path, requestUrl)
  url.searchParams.set('share_id', shareId)
  url.searchParams.set('video_id', videoId)
  url.searchParams.set('source', source)
  return url.toString()
}

function sanitizeFilePart(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 60)
}

interface DoubaoVideoInfoForFilename {
  user_info?: {
    nickname?: string
  }
  play_info?: {
    definition?: string
  }
}

export function buildFilename(videoInfo: DoubaoVideoInfoForFilename, videoId: string): string {
  const nickname = sanitizeFilePart(videoInfo.user_info?.nickname || 'doubao')
  const definition = sanitizeFilePart(videoInfo.play_info?.definition || 'video')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${nickname}_${definition}_${videoId}_${timestamp}.mp4`
}
