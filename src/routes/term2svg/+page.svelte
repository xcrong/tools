<script lang="ts">
	import { onMount } from 'svelte'
	import { i18n, translate } from '$lib/i18n/store.svelte'
	import { SPEED, THEMES } from '$lib/utils/term2svg/constants'
	import {
		canExportWebM,
		exportTimelineToWebM,
	} from '$lib/utils/term2svg/export-webm'
	import { renderSVG } from '$lib/utils/term2svg/render-svg'
	import {
		buildTimeline,
		parseInput,
		type TerminalTimeline,
	} from '$lib/utils/term2svg/timeline'

	const EXAMPLES: Record<string, string> = {
		git: `$ git status
On branch main
  modified:   src/index.js
  modified:   README.md
  new file:   src/utils.js

$ git add .
3 files staged

$ git commit -m "feat: add utils module"
✔ [main 3f2a1c9] feat: add utils module
  3 files changed, 47 insertions(+), 2 deletions(-)

$ git push origin main
Enumerating objects: 5, done.
Writing objects: 100% (5/5), 1.23 KiB, done.
✔ Branch 'main' set up to track 'origin/main'`,

		npm: `$ npm install
npm warn deprecated inflight @1.0.6
npm warn deprecated glob @7.2.3

added 312 packages in 4.2s

$ npm run build
> my-app@1.0.0 build
> vite build

vite v5.0.0 building for production...
✓ 42 modules transformed.
dist/index.html    0.46 kB
dist/assets/index-Dw3nJkAc.js   142.3 kB
✓ built in 1.24s`,

		docker: `$ docker build -t my-app:latest .
[+] Building 12.3s (8/8) FINISHED
 => [1/4] FROM node:20-alpine
 => [2/4] COPY package*.json ./
 => [3/4] RUN npm ci
 => [4/4] COPY . .
 => exporting to image

$ docker run -p 3000:3000 my-app:latest
Server listening on http://localhost:3000
Database connected ✔
Ready to accept connections`,

		python: `$ python train.py --epochs 10
Loading dataset... done (42,000 samples)
Building model...

Epoch 1/10  loss: 0.8821  acc: 0.6234
Epoch 5/10  loss: 0.3102  acc: 0.8841
Epoch 10/10 loss: 0.1847  acc: 0.9312

✔ Training complete in 38.2s
Model saved to ./checkpoints/model_final.pt`,

		ollama: `$ ollama --help
Large language model runner

Usage:
  ollama [flags]
  ollama [command]

Available Commands:
  serve       Start Ollama
  create      Create a model
  show        Show information for a model
  run         Run a model
  stop        Stop a running model
  pull        Pull a model from a registry
  push        Push a model to a registry
  signin      Sign in to ollama.com
  signout     Sign out from ollama.com
  list        List models
  ps          List running models
  cp          Copy a model
  rm          Remove a model
  launch      Launch the Ollama menu or an integration
  help        Help about any command

Flags:
  -h, --help         help for ollama
      --nowordwrap   Don't wrap words to the next line automatically
      --verbose      Show timings for response
  -v, --version      Show version information

Use "ollama [command] --help" for more information about a command.`
	}

	let inputText = $state(EXAMPLES.git)
	let theme = $state('catppuccin')
	let promptStr = $state('~')
	let speed = $state('normal')
	let svgWidth = $state(720)
	let maxHeight = $state(400)
	let lastSVG = $state('')
	let lastTimeline = $state<TerminalTimeline | null>(null)
	let previewMeta = $state('')
	let copyFeedback = $state(false)
	let replayKey = $state(0)
	let isExportingWebm = $state(false)
	let exportProgressText = $state('')
	let exportError = $state('')
	let webmSupported = $state(true)

	function formatPreviewMeta(lineCount: number, timeline: TerminalTimeline): string {
		const seconds = (timeline.durationMs / 1000).toFixed(1)
		const size = `${timeline.layout.width}×${timeline.layout.height}`

		if (i18n.locale === 'zh') {
			return `${lineCount} 行 · ${seconds}s · ${size}`
		}

		return `${lineCount} lines · ${seconds}s · ${size}`
	}

	function triggerDownload(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		link.click()

		window.setTimeout(() => URL.revokeObjectURL(url), 1000)
	}

	function loadExample(key: string) {
		inputText = EXAMPLES[key] || EXAMPLES.git
		generate()
	}

	function generate() {
		const raw = inputText.trim()
		if (!raw) {
			alert(translate('term2svg.errors.emptyInput'))
			return
		}

		exportError = ''
		const blocks = parseInput(raw)
		const timeline = buildTimeline(blocks, {
			theme: THEMES[theme] || THEMES.catppuccin,
			prompt: promptStr || '~',
			speed: SPEED[speed as keyof typeof SPEED] || SPEED.normal,
			width: svgWidth,
			maxHeight: maxHeight > 0 ? maxHeight : 0,
		})

		if (!timeline) {
			alert(translate('term2svg.errors.noContent'))
			return
		}

		lastTimeline = timeline
		lastSVG = renderSVG(timeline)
		const lineCount = timeline.lines.filter((line) => line.kind !== 'empty').length
		previewMeta = formatPreviewMeta(lineCount, timeline)
	}

	function downloadSVG() {
		if (!lastSVG) return
		triggerDownload(new Blob([lastSVG], { type: 'image/svg+xml' }), 'terminal-animation.svg')
	}

	async function downloadWebM() {
		if (!lastTimeline) return
		if (!webmSupported) {
			exportError = translate('term2svg.preview.webmUnsupported')
			return
		}

		const timeline = lastTimeline
		isExportingWebm = true
		exportError = ''
		exportProgressText = translate('term2svg.preview.exportingWebm')

		try {
			const result = await exportTimelineToWebM(timeline, {
				fps: 30,
				onProgress: (progress) => {
					exportProgressText = `${translate('term2svg.preview.exportingWebm')} ${Math.round(progress * 100)}%`
				},
			})

			triggerDownload(result.blob, result.filename)
		} catch (error) {
			console.error(error)
			exportError = translate('term2svg.preview.webmExportFailed')
		} finally {
			isExportingWebm = false
			exportProgressText = ''
		}
	}

	function copySVG() {
		if (!lastSVG) return
		navigator.clipboard.writeText(lastSVG).then(() => {
			copyFeedback = true
			setTimeout(() => (copyFeedback = false), 1500)
		})
	}

	function replaySVG() {
		replayKey++
	}

	onMount(() => {
		webmSupported = canExportWebM()
		generate()
	})
</script>

<svelte:head>
	<title>{translate("term2svg.title")} - {translate("common.title")}</title>
	<meta name="description" content={translate("term2svg.description")} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={translate("term2svg.title")} />
	<meta property="og:description" content={translate("term2svg.description")} />
	<meta property="og:image" content="https://tools.xcrong.me/og-image-term2svg.png" />
	<meta property="og:image:alt" content="term2svg - Terminal to Animated SVG Converter" />
	<meta property="og:url" content="https://tools.xcrong.me/term2svg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={translate("term2svg.title")} />
	<meta name="twitter:description" content={translate("term2svg.description")} />
	<meta name="twitter:image" content="https://tools.xcrong.me/og-image-term2svg.png" />
	<meta name="twitter:image:alt" content="term2svg - Terminal to Animated SVG Converter" />
</svelte:head>

<div class="content-container">
	<div class="page-title">{translate("term2svg.title")}</div>

	<!-- 输入面板 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-green">
				<span class="font-mono text-lg text-green font-bold">$</span>
			</div>
			<h2 class="card-title">{translate("term2svg.input.title")}</h2>
		</div>

		<textarea
			bind:value={inputText}
			placeholder={translate("term2svg.input.placeholder")}
			rows="10"
			class="tool-input resize-none"
		></textarea>

		<!-- 选项网格 -->
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 mb-4">
			<div class="space-y-1">
				<span class="data-block-label">{translate("term2svg.input.options.theme")}</span>
				<select bind:value={theme} class="tool-input text-sm py-2">
					<option value="catppuccin">Catppuccin</option>
					<option value="dracula">Dracula</option>
					<option value="tokyo">Tokyo Night</option>
					<option value="gruvbox">Gruvbox</option>
					<option value="nord">Nord</option>
					<option value="light">One Light</option>
				</select>
			</div>
			<div class="space-y-1">
				<span class="data-block-label">{translate("term2svg.input.options.prompt")}</span>
				<input type="text" bind:value={promptStr} class="tool-input text-sm py-2" />
			</div>
			<div class="space-y-1">
				<span class="data-block-label">{translate("term2svg.input.options.speed")}</span>
				<select bind:value={speed} class="tool-input text-sm py-2">
					<option value="fast">{translate("term2svg.input.speedOptions.fast")}</option>
					<option value="normal">{translate("term2svg.input.speedOptions.normal")}</option>
					<option value="slow">{translate("term2svg.input.speedOptions.slow")}</option>
				</select>
			</div>
			<div class="space-y-1">
				<span class="data-block-label">{translate("term2svg.input.options.width")}</span>
				<input type="number" bind:value={svgWidth} min="400" max="1200" class="tool-input text-sm py-2" />
			</div>
			<div class="space-y-1">
				<span class="data-block-label">{translate("term2svg.input.options.maxHeight")}</span>
				<input type="number" bind:value={maxHeight} min="0" max="800" step="50" class="tool-input text-sm py-2" placeholder={translate("term2svg.input.options.auto")} />
			</div>
		</div>

		<button class="btn-primary btn-primary-filled w-full" onclick={generate}>
			<span class="font-mono">{translate("term2svg.input.generate")}</span>
		</button>
	</div>

	<!-- 预览面板 -->
	{#if lastSVG}
		<div class="tool-card animate-fade-in">
			<div class="flex items-center justify-between mb-5">
				<div class="flex items-center">
					<div class="icon-box icon-box-pink">
						<svg class="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
					</div>
					<h2 class="card-title">{translate("term2svg.preview.title")}</h2>
				</div>
				{#if previewMeta}
					<span class="font-mono text-sm text-muted">{previewMeta}</span>
				{/if}
			</div>

			{#key replayKey}
			<div class="preview-container mb-5">
				{@html lastSVG}
			</div>
			{/key}

			<div class="flex gap-3 flex-wrap">
				<button class="btn-primary btn-primary-filled flex-1 min-w-[120px]" onclick={downloadSVG}>
					<span class="font-mono">{translate("term2svg.preview.download")}</span>
				</button>
				<button
					class="btn-primary btn-primary-filled flex-1 min-w-[120px]"
					onclick={downloadWebM}
					disabled={isExportingWebm || !webmSupported}
				>
					<span class="font-mono">
						{isExportingWebm
							? exportProgressText || translate("term2svg.preview.exportingWebm")
							: translate("term2svg.preview.downloadWebm")}
					</span>
				</button>
				<button class="btn-secondary flex-1 min-w-[120px]" onclick={copySVG}>
					<span class="font-mono">{copyFeedback ? '✓ ' + translate("common.copied").toUpperCase() : translate("term2svg.preview.copy")}</span>
				</button>
				<button class="btn-secondary flex-1 min-w-[120px]" onclick={replaySVG}>
					<span class="font-mono">{translate("term2svg.preview.replay")}</span>
				</button>
			</div>

			{#if !webmSupported || exportError}
				<p class="mt-3 font-mono text-sm" style="color: var(--neon-yellow);">
					{exportError || translate("term2svg.preview.webmUnsupported")}
				</p>
			{/if}
		</div>
	{/if}

	<!-- 示例模板 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-4">
			<div class="icon-box icon-box-purple">
				<span class="font-mono text-lg text-purple">#</span>
			</div>
			<h2 class="card-title">{translate("term2svg.examples.title")}</h2>
		</div>
		<div class="flex flex-wrap gap-2">
			<button class="btn-secondary" onclick={() => loadExample('git')}>
				<span class="font-mono text-sm">{translate("term2svg.examples.git")}</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('npm')}>
				<span class="font-mono text-sm">{translate("term2svg.examples.npm")}</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('docker')}>
				<span class="font-mono text-sm">{translate("term2svg.examples.docker")}</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('python')}>
				<span class="font-mono text-sm">{translate("term2svg.examples.python")}</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('ollama')}>
				<span class="font-mono text-sm">{translate("term2svg.examples.ollama")}</span>
			</button>
		</div>
	</div>

	<!-- 识别规则 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-4">
			<div class="icon-box" style="border-color: var(--text-muted);">
				<svg class="w-5 h-5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="card-title">{translate("term2svg.rules.title")}</h2>
		</div>
		<div class="space-y-2 text-sm text-secondary">
			<div class="data-row">
				<span class="data-label">{translate("term2svg.rules.command")}</span>
				<span class="data-value">以 <span class="text-green font-mono">$</span>、<span class="text-green font-mono">%</span>、<span class="text-green font-mono">#!</span> 开头的行，播放打字动画</span>
			</div>
			<div class="data-row">
				<span class="data-label">{translate("term2svg.rules.output")}</span>
				<span class="data-value">{translate("term2svg.rules.outputDesc")}</span>
			</div>
			<div class="data-row">
				<span class="data-label">{translate("term2svg.rules.empty")}</span>
				<span class="data-value">{translate("term2svg.rules.emptyDesc")}</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* 预览容器 */
	.preview-container {
		min-height: 200px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: auto;
	}

	.preview-container :global(svg) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}

	/* 工具类 */
	.text-green { color: var(--neon-green); }
	.text-muted { color: var(--text-muted); }
</style>
