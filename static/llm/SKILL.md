# tools.xcrong.me

This skill describes the public tools website and API endpoints for `tools.xcrong.me`.

## Public entry points

- Website: `https://tools.xcrong.me`
- API base: `https://api.tools.xcrong.me`
- Raw skill file: `https://tools.xcrong.me/llm/SKILL.md`

## Available tools

### MongoDB ObjectId Converter

- UI: `https://tools.xcrong.me/mongo-objectid`
- Purpose: convert between MongoDB ObjectId values and timestamps
- Best for: interactive debugging and quick manual conversions

### Timestamp Converter

- UI: `https://tools.xcrong.me/timestamp`
- Purpose: convert Unix timestamps and human-readable date/time values
- Best for: quick checks across seconds and milliseconds

### Doubao Video Downloader

- UI: `https://tools.xcrong.me/doubao-video`
- Parse API: `POST https://api.tools.xcrong.me/api/doubao-video/parse`
- Stream API: `GET https://api.tools.xcrong.me/api/doubao-video/stream`
- Download API: `GET https://api.tools.xcrong.me/api/doubao-video/download`

Request body for parse:

```json
{
  "shareUrl": "https://www.doubao.com/video-sharing?..."
}
```

Expected parse response fields include:

- `shareId`
- `videoId`
- `videoInfo`
- `streamUrl`
- `backupStreamUrl`
- `downloadUrl`
- `backupDownloadUrl`

Use this tool only when the user provides a Doubao share URL or explicitly wants help with Doubao video links.

### term2svg

- UI: `https://tools.xcrong.me/term2svg`
- Info API: `GET https://api.tools.xcrong.me/api/term2svg`
- Render API: `POST https://api.tools.xcrong.me/api/term2svg/render`

Example render request:

```json
{
  "content": "$ npm run dev\nready in 300ms",
  "theme": "tokyo",
  "speed": "normal",
  "prompt": "~",
  "width": 800,
  "maxHeight": 480
}
```

Use `term2svg` when the user wants terminal transcripts turned into animated SVG output.

## Usage guidance

- Prefer the website UI for manual use.
- Prefer the API for automation.
- Use the API base exactly as documented above.
- Do not invent undocumented endpoints.
- If an API call fails, fall back to the corresponding website URL when possible.
