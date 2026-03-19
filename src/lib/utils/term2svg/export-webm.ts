import { renderCanvasFrame } from './render-canvas'
import type { TerminalTimeline } from './timeline'

export interface ExportWebMOptions {
  fps?: number
  scale?: number
  mimeType?: string
  bitrate?: number
  onProgress?: (progress: number) => void
}

export interface ExportWebMResult {
  blob: Blob
  filename: string
  mimeType: string
}

const WEBM_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function getSupportedWebMMimeType(preferredMimeType?: string): string | null {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return null
  }

  const candidates = preferredMimeType
    ? [preferredMimeType, ...WEBM_MIME_TYPES.filter((item) => item !== preferredMimeType)]
    : WEBM_MIME_TYPES

  for (const mimeType of candidates) {
    if (!MediaRecorder.isTypeSupported || MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }

  return null
}

export function canExportWebM(): boolean {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    return false
  }

  const canvas = document.createElement('canvas')
  return typeof canvas.captureStream === 'function' && getSupportedWebMMimeType() !== null
}

export async function exportTimelineToWebM(
  timeline: TerminalTimeline,
  options: ExportWebMOptions = {},
): Promise<ExportWebMResult> {
  if (typeof document === 'undefined') {
    throw new Error('WebM export is only available in the browser')
  }

  const mimeType = getSupportedWebMMimeType(options.mimeType)
  if (!mimeType) {
    throw new Error('WebM export is not supported in this browser')
  }

  const fps = options.fps ?? 30
  const scale = Math.max(1, options.scale ?? 2)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(timeline.layout.width * scale)
  canvas.height = Math.round(timeline.layout.height * scale)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Unable to create canvas context')
  }

  context.setTransform(scale, 0, 0, scale, 0, 0)
  const stream = canvas.captureStream(fps)
  const chunks: BlobPart[] = []

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.bitrate ?? 12_000_000,
  })

  const resultPromise = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onerror = () => {
      reject(new Error('Failed to export WebM'))
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      if (blob.size === 0) {
        reject(new Error('Recorded WebM blob is empty'))
        return
      }

      resolve(blob)
    }
  })

  recorder.start()

  const frameDurationMs = 1000 / fps
  const totalDurationMs = timeline.durationMs + 300
  const totalFrames = Math.max(1, Math.ceil(totalDurationMs / frameDurationMs))

  for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex += 1) {
    const timeMs = Math.min(frameIndex * frameDurationMs, totalDurationMs)
    renderCanvasFrame(context, timeline, timeMs)
    options.onProgress?.(Math.min(1, timeMs / totalDurationMs))

    if (frameIndex < totalFrames) {
      await sleep(frameDurationMs)
    }
  }

  options.onProgress?.(1)
  await sleep(frameDurationMs)
  recorder.stop()

  try {
    const blob = await resultPromise
    return {
      blob,
      filename: 'terminal-animation.webm',
      mimeType,
    }
  } finally {
    stream.getTracks().forEach((track) => track.stop())
  }
}
