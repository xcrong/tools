import { TERMINAL_FONT_FAMILY } from './constants'
import type {
  CommandTimelineLine,
  EmptyTimelineLine,
  OutputTimelineLine,
  ScrollKeyframe,
  TerminalTimeline,
  TimelineLine,
} from './timeline'

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function getScrollOffset(scrollKeyframes: ScrollKeyframe[], timeMs: number): number {
  let offset = 0

  for (const keyframe of scrollKeyframes) {
    if (keyframe.atMs <= timeMs) {
      offset = keyframe.offsetY
      continue
    }

    break
  }

  return offset
}

function getVisibleCommandText(line: CommandTimelineLine, timeMs: number, charWidth: number) {
  if (timeMs < line.startMs) {
    return { text: '', cursorX: line.commandX, showCursor: false }
  }

  if (timeMs >= line.endMs) {
    const blinkPhase = Math.floor((timeMs - line.endMs) / 140)

    return {
      text: line.commandText,
      cursorX: line.commandX + line.commandText.length * charWidth,
      showCursor: timeMs <= line.cursorEndMs && blinkPhase % 2 === 0,
    }
  }

  const progress = Math.max(0, Math.min(1, (timeMs - line.startMs) / line.typingDurationMs))
  const visibleChars = Math.min(line.commandText.length, Math.floor(progress * line.charCount))

  return {
    text: line.commandText.slice(0, visibleChars),
    cursorX: line.commandX + visibleChars * charWidth,
    showCursor: true,
  }
}

function drawCommandLine(
  ctx: CanvasRenderingContext2D,
  line: CommandTimelineLine,
  timeline: TerminalTimeline,
  timeMs: number,
) {
  if (timeMs < line.startMs) return

  const { layout, theme } = timeline
  const { text, cursorX, showCursor } = getVisibleCommandText(line, timeMs, layout.charWidth)

  ctx.fillStyle = theme.prompt
  ctx.fillText(line.promptText, line.promptX, line.y)

  ctx.fillStyle = theme.cmd
  ctx.fillText(text, line.commandX, line.y)

  if (showCursor) {
    ctx.fillStyle = theme.cursor
    ctx.fillText('█', cursorX, line.y)
  }
}

function drawOutputLine(ctx: CanvasRenderingContext2D, line: OutputTimelineLine, timeMs: number) {
  if (timeMs < line.startMs) return

  ctx.fillStyle = line.color
  ctx.fillText(line.text, 22, line.y)
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  line: TimelineLine,
  timeline: TerminalTimeline,
  timeMs: number,
) {
  if (line.kind === 'empty') return
  if (line.kind === 'cmd') {
    drawCommandLine(ctx, line, timeline, timeMs)
    return
  }

  drawOutputLine(ctx, line, timeMs)
}

export function renderCanvasFrame(
  ctx: CanvasRenderingContext2D,
  timeline: TerminalTimeline,
  timeMs: number,
) {
  const { layout, theme } = timeline

  ctx.clearRect(0, 0, layout.width, layout.height)
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${layout.fontSize}px ${TERMINAL_FONT_FAMILY}`

  createRoundedRectPath(ctx, 0, 0, layout.width, layout.height, layout.borderRadius)
  ctx.fillStyle = theme.bg
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, layout.padTop, layout.width, layout.visibleAreaHeight)
  ctx.clip()
  ctx.translate(0, -getScrollOffset(timeline.scrollKeyframes, timeMs))

  for (const line of timeline.lines) {
    drawLine(ctx, line, timeline, timeMs)
  }

  ctx.restore()

  createRoundedRectPath(ctx, 0, 0, layout.width, layout.titleHeight, layout.borderRadius)
  ctx.fillStyle = theme.titleBar
  ctx.fill()

  ctx.fillRect(0, layout.titleHeight - 6, layout.width, 6)

  const lights = ['#ff6b6b', '#ffd93d', '#6bcb77']
  lights.forEach((color, index) => {
    ctx.beginPath()
    ctx.arc(18 + index * 20, layout.titleHeight / 2, 6, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  })

  ctx.fillStyle = theme.outDim
  ctx.font = `12px ${TERMINAL_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.fillText(`${timeline.promptLabel} — bash`, layout.width / 2, layout.titleHeight / 2 + 5)
  ctx.textAlign = 'start'
  ctx.font = `${layout.fontSize}px ${TERMINAL_FONT_FAMILY}`
}

