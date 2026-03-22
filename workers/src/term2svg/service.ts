import {
  DEFAULT_MAX_HEIGHT,
  DEFAULT_WIDTH,
  MAX_INPUT_LENGTH,
  SPEED,
  THEMES,
  type BuildTimelineOptions,
} from './constants.js'
import { renderSVG } from './render-svg.js'
import { buildTimeline, parseInput } from './timeline.js'

export interface Term2SvgRenderPayload {
  content?: string
  theme?: string
  speed?: string
  prompt?: string
  width?: number
  maxHeight?: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function getTerm2SvgMeta(): Record<string, unknown> {
  return {
    themes: Object.keys(THEMES),
    speeds: Object.keys(SPEED),
    limits: {
      maxInputLength: MAX_INPUT_LENGTH,
      minWidth: 320,
      maxWidth: 1600,
      minHeight: 180,
      maxHeight: 2000,
    },
  }
}

export function renderTerm2Svg(payload: Term2SvgRenderPayload): Record<string, unknown> {
  const content = typeof payload?.content === 'string' ? payload.content : ''
  if (!content.trim()) {
    throw new Error('content 不能为空')
  }

  if (content.length > MAX_INPUT_LENGTH) {
    throw new Error(`content 超过最大长度限制：${MAX_INPUT_LENGTH}`)
  }

  const themeName = typeof payload?.theme === 'string' ? payload.theme : 'tokyo'
  const speedName = typeof payload?.speed === 'string' ? payload.speed : 'normal'
  const prompt = typeof payload?.prompt === 'string' && payload.prompt.trim() ? payload.prompt : '~'
  const width = clamp(Number(payload?.width) || DEFAULT_WIDTH, 320, 1600)
  const maxHeight = clamp(Number(payload?.maxHeight) || DEFAULT_MAX_HEIGHT, 180, 2000)

  const theme = THEMES[themeName]
  if (!theme) {
    throw new Error(`不支持的 theme: ${themeName}`)
  }

  const speed = SPEED[speedName]
  if (!speed) {
    throw new Error(`不支持的 speed: ${speedName}`)
  }

  const blocks = parseInput(content)
  const timeline = buildTimeline(blocks, {
    theme,
    prompt,
    speed,
    width,
    maxHeight,
  } satisfies BuildTimelineOptions)

  if (!timeline) {
    throw new Error('无法从输入内容生成终端时间线')
  }

  return {
    svg: renderSVG(timeline),
    meta: {
      theme: themeName,
      speed: speedName,
      prompt,
      width: timeline.layout.width,
      height: timeline.layout.height,
      durationMs: timeline.durationMs,
      lineCount: timeline.lines.length,
      needsScroll: timeline.layout.needsScroll,
    },
  }
}
