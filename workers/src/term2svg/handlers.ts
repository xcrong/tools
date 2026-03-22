import { okResponse } from '../http.js'
import { getTerm2SvgMeta, renderTerm2Svg, type Term2SvgRenderPayload } from './service.js'

export function getTerm2SvgRoutes(): Record<string, unknown> {
  return {
    info: {
      method: 'GET',
      path: '/api/term2svg',
    },
    render: {
      method: 'POST',
      path: '/api/term2svg/render',
      body: {
        content: '$ npm run dev\nready in 300ms',
        theme: 'tokyo',
        speed: 'normal',
        prompt: '~',
        width: 800,
        maxHeight: 480,
      },
    },
  }
}

export function handleTerm2SvgInfo(): Response {
  return okResponse(getTerm2SvgMeta())
}

export async function handleTerm2SvgRender(request: Request): Promise<Response> {
  const payload = await request.json() as Term2SvgRenderPayload
  return okResponse(renderTerm2Svg(payload))
}
