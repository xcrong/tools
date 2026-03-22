import { handleOptions, okResponse, errorResponse } from './http.js'
import { normalizePath } from './router.js'
import {
  getDoubaoRoutes,
  handleDoubaoDownload,
  handleDoubaoParse,
  handleDoubaoStream,
} from './doubao/handlers.js'
import {
  getTerm2SvgRoutes,
  handleTerm2SvgInfo,
  handleTerm2SvgRender,
} from './term2svg/handlers.js'

function getIndexPayload(): Record<string, unknown> {
  return {
    name: 'tools-api-worker',
    routes: {
      doubaoVideo: getDoubaoRoutes(),
      term2svg: getTerm2SvgRoutes(),
    },
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    const requestUrl = new URL(request.url)
    const route = normalizePath(requestUrl)

    try {
      if (route === '/' && request.method === 'GET') {
        return okResponse(getIndexPayload())
      }

      if (route === '/api/doubao-video/parse' && request.method === 'POST') {
        return await handleDoubaoParse(request)
      }

      if (
        route === '/api/doubao-video/stream' &&
        (request.method === 'GET' || request.method === 'HEAD')
      ) {
        return await handleDoubaoStream(request, requestUrl)
      }

      if (
        route === '/api/doubao-video/download' &&
        (request.method === 'GET' || request.method === 'HEAD')
      ) {
        return await handleDoubaoDownload(request, requestUrl)
      }

      if (route === '/api/term2svg' && request.method === 'GET') {
        return handleTerm2SvgInfo()
      }

      if (route === '/api/term2svg/render' && request.method === 'POST') {
        return await handleTerm2SvgRender(request)
      }

      return errorResponse('路由不存在', 404)
    } catch (error) {
      console.error('API Worker 错误:', error)

      if (error instanceof SyntaxError) {
        return errorResponse('请求体必须是合法 JSON', 400)
      }

      return errorResponse(error instanceof Error ? error.message : '未知错误', 500)
    }
  },
}
