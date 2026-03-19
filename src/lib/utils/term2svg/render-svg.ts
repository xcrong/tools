import { TERMINAL_FONT_FAMILY } from './constants'
import type {
  CommandTimelineLine,
  OutputTimelineLine,
  TerminalTimeline,
} from './timeline'

function escXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ms(value: number): string {
  return `${(value / 1000).toFixed(3)}s`
}

function buildCommandAnimation(
  line: CommandTimelineLine,
  charWidth: number,
  clipId: string,
): { def: string; group: string } {
  const commandWidth = line.charCount * charWidth
  const keyTimes: string[] = []
  const clipValues: string[] = []
  const cursorValues: string[] = []

  for (let step = 0; step <= line.charCount; step += 1) {
    const progress = step / line.charCount
    const width = Math.round((step * commandWidth) / line.charCount)

    keyTimes.push(progress.toFixed(4))
    clipValues.push(width.toString())
    cursorValues.push((line.commandX + width).toString())
  }

  return {
    def: `
  <clipPath id="${clipId}">
    <rect x="${line.commandX}" y="${line.y - 13}" width="0" height="17">
      <animate attributeName="width"
        from="0" to="${commandWidth + 2}"
        begin="${ms(line.startMs)}" dur="${ms(line.typingDurationMs)}"
        calcMode="discrete"
        keyTimes="${keyTimes.join(';')}"
        values="${clipValues.join(';')}"
        fill="freeze"/>
    </rect>
  </clipPath>`,
    group: `
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(line.startMs)}" dur="0.001s" fill="freeze"/>
    <text x="${line.promptX}" y="${line.y}" font-size="13"
      font-family="${TERMINAL_FONT_FAMILY}"
      fill="${escXML(line.promptText ? '' : '')}${''}"></text>
    <text x="${line.promptX}" y="${line.y}" font-size="13"
      font-family="${TERMINAL_FONT_FAMILY}"
      fill="var(--prompt-color)">${escXML(line.promptText)}</text>
    <text x="${line.commandX}" y="${line.y}" font-size="13"
      font-family="${TERMINAL_FONT_FAMILY}"
      fill="var(--command-color)"
      clip-path="url(#${clipId})">${escXML(line.commandText)}</text>
    <text y="${line.y}" font-size="13"
      font-family="${TERMINAL_FONT_FAMILY}"
      fill="var(--cursor-color)">
      <animate attributeName="x"
        from="${line.commandX}" to="${line.commandX + commandWidth}"
        begin="${ms(line.startMs)}" dur="${ms(line.typingDurationMs)}"
        calcMode="discrete"
        keyTimes="${keyTimes.join(';')}"
        values="${cursorValues.join(';')}"
        fill="freeze"/>
      <animate attributeName="opacity" values="1;0;1;0;1;0;1;0;1;0;0"
        keyTimes="0;0.1;0.2;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1"
        begin="${ms(line.startMs)}" dur="${ms(line.typingDurationMs + 500)}" fill="freeze"/>
      █</text>
  </g>`,
  }
}

function renderOutputLine(line: OutputTimelineLine, padX: number): string {
  return `
  <text x="${padX}" y="${line.y}" font-size="13"
    font-family="${TERMINAL_FONT_FAMILY}"
    fill="${line.color}" opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(line.startMs)}" dur="0.001s" fill="freeze"/>
    ${escXML(line.text)}</text>`
}

export function renderSVG(timeline: TerminalTimeline): string {
  const { layout, theme } = timeline
  const defs: string[] = []
  const content: string[] = []
  const scrollValues = timeline.scrollKeyframes.map((frame) => `0 -${frame.offsetY}`)
  const scrollKeyTimes = timeline.scrollKeyframes.map((frame) =>
    (frame.atMs / timeline.durationMs).toFixed(4),
  )

  let commandIndex = 0

  for (const line of timeline.lines) {
    if (line.kind === 'cmd') {
      const animation = buildCommandAnimation(line, layout.charWidth, `clip_${commandIndex}`)
      defs.push(animation.def)
      content.push(`
  <g style="--prompt-color:${theme.prompt};--command-color:${theme.cmd};--cursor-color:${theme.cursor};">
    ${animation.group}
  </g>`)
      commandIndex += 1
      continue
    }

    if (line.kind === 'out') {
      content.push(renderOutputLine(line, layout.padX))
    }
  }

  const clipId = `contentClip_${layout.width}_${layout.height}`
  if (layout.needsScroll) {
    defs.push(`
  <clipPath id="${clipId}">
    <rect x="0" y="${layout.padTop}" width="${layout.width}" height="${layout.visibleAreaHeight}"/>
  </clipPath>`)
  }

  const scrollAnimation = layout.needsScroll
    ? `
    <animateTransform attributeName="transform" type="translate"
      from="0 0" to="0 -${timeline.scrollKeyframes[timeline.scrollKeyframes.length - 1]?.offsetY ?? 0}"
      begin="0s" dur="${ms(timeline.durationMs)}"
      calcMode="discrete"
      keyTimes="${scrollKeyTimes.join(';')}"
      values="${scrollValues.join(';')}"
      fill="freeze"/>`
    : ''

  const contentGroup = layout.needsScroll
    ? `<g clip-path="url(#${clipId})">
  <g>
    ${scrollAnimation}
${content.join('\n')}
  </g>
</g>`
    : content.join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}">
<defs>${defs.join('\n')}
</defs>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.borderRadius}" fill="${theme.bg}"/>
${contentGroup}
<rect width="${layout.width}" height="${layout.titleHeight}" rx="${layout.borderRadius}" fill="${theme.titleBar}"/>
<rect y="${layout.titleHeight - 6}" width="${layout.width}" height="6" fill="${theme.titleBar}"/>
<circle cx="18" cy="${layout.titleHeight / 2}" r="6" fill="#ff6b6b"/>
<circle cx="38" cy="${layout.titleHeight / 2}" r="6" fill="#ffd93d"/>
<circle cx="58" cy="${layout.titleHeight / 2}" r="6" fill="#6bcb77"/>
<text x="${layout.width / 2}" y="${layout.titleHeight / 2 + 5}" text-anchor="middle" fill="${theme.outDim}" font-size="12" font-family="${TERMINAL_FONT_FAMILY}">${escXML(timeline.promptLabel)} — bash</text>
</svg>`
}

