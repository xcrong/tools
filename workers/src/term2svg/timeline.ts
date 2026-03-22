import {
  TERMINAL_LAYOUT,
  type Block,
  type BuildTimelineOptions,
} from './constants.js'

export interface TerminalLayout {
  width: number
  height: number
  titleHeight: number
  padX: number
  padTop: number
  lineHeight: number
  fontSize: number
  charWidth: number
  visibleAreaHeight: number
  needsScroll: boolean
  borderRadius: number
}

export interface TimelineLineBase {
  index: number
  y: number
  startMs: number
  endMs: number
}

export interface CommandTimelineLine extends TimelineLineBase {
  kind: 'cmd'
  promptText: string
  commandText: string
  promptX: number
  commandX: number
  charCount: number
  typingDurationMs: number
  cursorEndMs: number
}

export interface OutputTimelineLine extends TimelineLineBase {
  kind: 'out'
  text: string
  color: string
  revealMode: 'fade'
}

export interface EmptyTimelineLine extends TimelineLineBase {
  kind: 'empty'
}

export type TimelineLine = CommandTimelineLine | OutputTimelineLine | EmptyTimelineLine

export interface ScrollKeyframe {
  atMs: number
  offsetY: number
}

export interface TerminalTimeline {
  layout: TerminalLayout
  durationMs: number
  promptLabel: string
  theme: BuildTimelineOptions['theme']
  lines: TimelineLine[]
  scrollKeyframes: ScrollKeyframe[]
}

export function parseInput(raw: string): Block[] {
  const lines = raw.split('\n')
  const blocks: Block[] = []

  for (const line of lines) {
    const trimmed = line.trimStart()

    if (trimmed === '') {
      blocks.push({ type: 'empty', text: '' })
      continue
    }

    if (/^(?:\$|%|#!)\s/.test(trimmed) || trimmed === '$' || trimmed === '%' || trimmed === '#!') {
      blocks.push({
        type: 'cmd',
        text: trimmed.replace(/^(?:\$|%|#!)\s*/, ''),
      })
      continue
    }

    blocks.push({ type: 'out', text: line })
  }

  return blocks
}

function classifyOut(text: string): 'dim' | 'ok' | 'err' | 'url' | 'highlight' {
  if (/error|err|fail|fatal|not found|denied|✗|✘/i.test(text)) return 'err'
  if (/✔|✓|success|done|ok|complete|ready|saved|built/i.test(text)) return 'ok'
  if (/https?:\/\//i.test(text)) return 'url'
  if (/^(Usage:|Flags:|Available Commands:|Options:|Commands:|Arguments:|Examples:)/i.test(text.trim())) {
    return 'highlight'
  }

  return 'dim'
}

export function buildTimeline(
  blocks: Block[],
  opts: BuildTimelineOptions,
): TerminalTimeline | null {
  const trimmedBlocks = [...blocks]

  while (trimmedBlocks.length > 0 && trimmedBlocks[0].type === 'empty') {
    trimmedBlocks.shift()
  }

  while (trimmedBlocks.length > 0 && trimmedBlocks[trimmedBlocks.length - 1].type === 'empty') {
    trimmedBlocks.pop()
  }

  if (trimmedBlocks.length === 0) {
    return null
  }

  const {
    fontSize,
    lineHeight,
    padX,
    padTop,
    titleHeight,
    charWidth,
    contentBottomPadding,
    initialDelayMs,
    cursorTailMs,
    outputRevealMs,
    borderRadius,
  } = TERMINAL_LAYOUT

  const contentHeight = trimmedBlocks.length * lineHeight
  const totalContentHeight = padTop + contentHeight + 32
  const viewHeight = opts.maxHeight > titleHeight + 50 ? opts.maxHeight : totalContentHeight
  const visibleAreaHeight = viewHeight - padTop
  const needsScroll = totalContentHeight > viewHeight
  const scrollOffset = needsScroll
    ? Math.round((totalContentHeight - viewHeight + contentBottomPadding) / lineHeight) * lineHeight
    : 0

  const layout: TerminalLayout = {
    width: opts.width,
    height: viewHeight,
    titleHeight,
    padX,
    padTop,
    lineHeight,
    fontSize,
    charWidth,
    visibleAreaHeight,
    needsScroll,
    borderRadius,
  }

  const colorMap: Record<string, string> = {
    dim: opts.theme.outDim,
    ok: opts.theme.outOk,
    err: opts.theme.outErr,
    url: opts.theme.outUrl,
    highlight: opts.theme.text,
  }

  let currentTime = initialDelayMs
  let index = 0
  const lines: TimelineLine[] = []
  const scrollCandidates: ScrollKeyframe[] = [{ atMs: 0, offsetY: 0 }]

  while (index < trimmedBlocks.length) {
    const block = trimmedBlocks[index]
    const y = padTop + index * lineHeight + fontSize

    if (block.type === 'empty') {
      lines.push({
        kind: 'empty',
        index,
        y,
        startMs: currentTime,
        endMs: currentTime,
      })
      index += 1
      continue
    }

    if (block.type === 'cmd') {
      const promptText = `${opts.prompt || '~'} $ `
      const promptWidth = promptText.length * charWidth
      const commandText = block.text
      const charCount = Math.max(commandText.length, 1)
      const typingDurationMs = Math.max(charCount * opts.speed.charMs, 150)
      const commandX = padX + promptWidth
      const endMs = currentTime + typingDurationMs

      lines.push({
        kind: 'cmd',
        index,
        y,
        startMs: currentTime,
        endMs,
        promptText,
        commandText,
        promptX: padX,
        commandX,
        charCount,
        typingDurationMs,
        cursorEndMs: endMs + cursorTailMs,
      })

      currentTime = endMs + opts.speed.cmdGap
      index += 1

      let outIndex = 0

      while (index < trimmedBlocks.length && trimmedBlocks[index].type === 'out') {
        const outputBlock = trimmedBlocks[index]
        const outputY = padTop + index * lineHeight + fontSize
        const startMs = currentTime + outIndex * opts.speed.outGap
        const endMsInner = startMs + outputRevealMs

        lines.push({
          kind: 'out',
          index,
          y: outputY,
          startMs,
          endMs: endMsInner,
          text: outputBlock.text,
          color: colorMap[classifyOut(outputBlock.text)] || opts.theme.outDim,
          revealMode: 'fade',
        })

        currentTime = endMsInner
        outIndex += 1
        index += 1
      }

      if (outIndex > 0) {
        currentTime += opts.speed.cmdGap * 0.4
      }

      continue
    }

    const endMs = currentTime + outputRevealMs

    lines.push({
      kind: 'out',
      index,
      y,
      startMs: currentTime,
      endMs,
      text: block.text,
      color: colorMap[classifyOut(block.text)] || opts.theme.outDim,
      revealMode: 'fade',
    })

    currentTime = endMs + opts.speed.outGap
    index += 1
  }

  const durationMs = currentTime + cursorTailMs

  if (needsScroll && scrollOffset > 0) {
    let lastScrollPos = 0

    for (const line of lines) {
      if (line.kind === 'empty') continue

      const lineTop = line.y - padTop
      const lineBottom = lineTop + fontSize
      const rawScroll = Math.max(0, lineBottom - visibleAreaHeight + contentBottomPadding)
      const neededScroll = Math.round(rawScroll / lineHeight) * lineHeight

      if (neededScroll > lastScrollPos) {
        scrollCandidates.push({
          atMs: Math.min(line.endMs, durationMs),
          offsetY: neededScroll,
        })
        lastScrollPos = neededScroll
      }
    }

    if (lastScrollPos < scrollOffset) {
      scrollCandidates.push({ atMs: durationMs, offsetY: scrollOffset })
    }
  }

  const scrollKeyframes = scrollCandidates.reduce<ScrollKeyframe[]>((acc, frame) => {
    const previous = acc[acc.length - 1]

    if (!previous || frame.atMs > previous.atMs) {
      acc.push(frame)
      return acc
    }

    if (frame.atMs === previous.atMs) {
      previous.offsetY = frame.offsetY
    }

    return acc
  }, [])

  return {
    layout,
    durationMs,
    promptLabel: opts.prompt || '~',
    theme: opts.theme,
    lines,
    scrollKeyframes,
  }
}
