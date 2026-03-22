import { API_HEADERS, DOUBAO_API_URL } from './config.js'

export interface DoubaoVideoInfo {
  user_info?: {
    nickname?: string
  }
  play_info?: {
    main?: string
    backup?: string | null
    definition?: string
  }
  [key: string]: unknown
}

interface DoubaoApiResponse {
  code: number
  msg?: string
  data?: DoubaoVideoInfo
}

export async function getVideoInfo(shareId: string, videoId: string): Promise<DoubaoVideoInfo> {
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

  const result = await response.json() as DoubaoApiResponse

  if (result.code !== 0) {
    throw new Error(`豆包 API 错误：${result.msg || '未知错误'}`)
  }

  if (!result.data?.play_info?.main) {
    throw new Error('响应中缺少视频播放信息')
  }

  return result.data
}
