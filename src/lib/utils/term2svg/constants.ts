export interface ThemeConfig {
  bg: string
  titleBar: string
  text: string
  prompt: string
  cmd: string
  comment: string
  outDim: string
  outOk: string
  outErr: string
  outUrl: string
  cursor: string
}

export interface SpeedConfig {
  charMs: number
  cmdGap: number
  outGap: number
}

export interface Block {
  type: 'cmd' | 'out' | 'empty'
  text: string
}

export interface BuildTimelineOptions {
  theme: ThemeConfig
  prompt: string
  speed: SpeedConfig
  width: number
  maxHeight: number
}

export const THEMES: Record<string, ThemeConfig> = {
  catppuccin: {
    bg: '#1e1e2e',
    titleBar: '#313244',
    text: '#cdd6f4',
    prompt: '#a6e3a1',
    cmd: '#cdd6f4',
    comment: '#6c7086',
    outDim: '#7f849c',
    outOk: '#a6e3a1',
    outErr: '#f38ba8',
    outUrl: '#89b4fa',
    cursor: '#f5c2e7',
  },
  dracula: {
    bg: '#282a36',
    titleBar: '#383a59',
    text: '#f8f8f2',
    prompt: '#50fa7b',
    cmd: '#f8f8f2',
    comment: '#6272a4',
    outDim: '#6272a4',
    outOk: '#50fa7b',
    outErr: '#ff5555',
    outUrl: '#8be9fd',
    cursor: '#ff79c6',
  },
  tokyo: {
    bg: '#1a1b26',
    titleBar: '#24283b',
    text: '#c0caf5',
    prompt: '#9ece6a',
    cmd: '#c0caf5',
    comment: '#565f89',
    outDim: '#565f89',
    outOk: '#9ece6a',
    outErr: '#f7768e',
    outUrl: '#7aa2f7',
    cursor: '#bb9af7',
  },
  gruvbox: {
    bg: '#282828',
    titleBar: '#3c3836',
    text: '#ebdbb2',
    prompt: '#b8bb26',
    cmd: '#ebdbb2',
    comment: '#928374',
    outDim: '#928374',
    outOk: '#b8bb26',
    outErr: '#fb4934',
    outUrl: '#83a598',
    cursor: '#fabd2f',
  },
  nord: {
    bg: '#2e3440',
    titleBar: '#3b4252',
    text: '#d8dee9',
    prompt: '#a3be8c',
    cmd: '#d8dee9',
    comment: '#4c566a',
    outDim: '#4c566a',
    outOk: '#a3be8c',
    outErr: '#bf616a',
    outUrl: '#88c0d0',
    cursor: '#ebcb8b',
  },
  light: {
    bg: '#fafafa',
    titleBar: '#e5e5e5',
    text: '#383a42',
    prompt: '#50a14f',
    cmd: '#383a42',
    comment: '#a0a1a7',
    outDim: '#a0a1a7',
    outOk: '#50a14f',
    outErr: '#e45649',
    outUrl: '#4078f2',
    cursor: '#986801',
  },
}

export const SPEED = {
  fast: { charMs: 28, cmdGap: 400, outGap: 80 },
  normal: { charMs: 48, cmdGap: 700, outGap: 120 },
  slow: { charMs: 80, cmdGap: 1100, outGap: 200 },
} satisfies Record<string, SpeedConfig>

export const TERMINAL_LAYOUT = {
  fontSize: 13,
  lineHeight: 22,
  padX: 22,
  padTop: 58,
  titleHeight: 38,
  charWidth: 13 * 0.605,
  contentBottomPadding: 13 + 10,
  initialDelayMs: 300,
  cursorTailMs: 500,
  outputRevealMs: 80,
  borderRadius: 12,
} as const

export const TERMINAL_FONT_FAMILY = "'JetBrains Mono','Courier New',monospace"

