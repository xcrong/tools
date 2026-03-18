<script lang="ts">
	import { onMount } from "svelte";
	import { translate } from "$lib/i18n/store.svelte";

	// 主题配置
	const THEMES: Record<string, ThemeConfig> = {
		catppuccin: {
			bg: '#1e1e2e', titleBar: '#313244', text: '#cdd6f4',
			prompt: '#a6e3a1', cmd: '#cdd6f4', comment: '#6c7086',
			outDim: '#7f849c', outOk: '#a6e3a1', outErr: '#f38ba8', outUrl: '#89b4fa',
			cursor: '#f5c2e7'
		},
		dracula: {
			bg: '#282a36', titleBar: '#383a59', text: '#f8f8f2',
			prompt: '#50fa7b', cmd: '#f8f8f2', comment: '#6272a4',
			outDim: '#6272a4', outOk: '#50fa7b', outErr: '#ff5555', outUrl: '#8be9fd',
			cursor: '#ff79c6'
		},
		tokyo: {
			bg: '#1a1b26', titleBar: '#24283b', text: '#c0caf5',
			prompt: '#9ece6a', cmd: '#c0caf5', comment: '#565f89',
			outDim: '#565f89', outOk: '#9ece6a', outErr: '#f7768e', outUrl: '#7aa2f7',
			cursor: '#bb9af7'
		},
		gruvbox: {
			bg: '#282828', titleBar: '#3c3836', text: '#ebdbb2',
			prompt: '#b8bb26', cmd: '#ebdbb2', comment: '#928374',
			outDim: '#928374', outOk: '#b8bb26', outErr: '#fb4934', outUrl: '#83a598',
			cursor: '#fabd2f'
		},
		nord: {
			bg: '#2e3440', titleBar: '#3b4252', text: '#d8dee9',
			prompt: '#a3be8c', cmd: '#d8dee9', comment: '#4c566a',
			outDim: '#4c566a', outOk: '#a3be8c', outErr: '#bf616a', outUrl: '#88c0d0',
			cursor: '#ebcb8b'
		},
		light: {
			bg: '#fafafa', titleBar: '#e5e5e5', text: '#383a42',
			prompt: '#50a14f', cmd: '#383a42', comment: '#a0a1a7',
			outDim: '#a0a1a7', outOk: '#50a14f', outErr: '#e45649', outUrl: '#4078f2',
			cursor: '#986801'
		}
	};

	interface ThemeConfig {
		bg: string;
		titleBar: string;
		text: string;
		prompt: string;
		cmd: string;
		comment: string;
		outDim: string;
		outOk: string;
		outErr: string;
		outUrl: string;
		cursor: string;
	}

	interface Block {
		type: 'cmd' | 'out' | 'empty';
		text: string;
	}

	// 示例数据
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
	};

	const SPEED = {
		fast: { charMs: 28, cmdGap: 400, outGap: 80 },
		normal: { charMs: 48, cmdGap: 700, outGap: 120 },
		slow: { charMs: 80, cmdGap: 1100, outGap: 200 }
	};

	// 状态
	let inputText = $state(EXAMPLES.git);
	let theme = $state('catppuccin');
	let promptStr = $state('~');
	let speed = $state('normal');
	let svgWidth = $state(720);
	let maxHeight = $state(400); // 0 = auto
	let lastSVG = $state('');
	let previewMeta = $state('');
	let copyFeedback = $state(false);
	let replayKey = $state(0); // 用于强制重新渲染 SVG

	function loadExample(key: string) {
		inputText = EXAMPLES[key];
		// 自动触发生成
		generate();
	}

	function parseInput(raw: string): Block[] {
		const lines = raw.split('\n');
		const blocks: Block[] = [];
		for (const line of lines) {
			const trimmed = line.trimStart();
			if (trimmed === '') {
				blocks.push({ type: 'empty', text: '' });
			} else if (/^[$%#!]\s/.test(trimmed) || trimmed === '$' || trimmed === '%') {
				const cmd = trimmed.replace(/^[$%#!]\s*/, '');
				blocks.push({ type: 'cmd', text: cmd });
			} else {
				blocks.push({ type: 'out', text: line });
			}
		}
		return blocks;
	}

	function classifyOut(text: string): 'dim' | 'ok' | 'err' | 'url' | 'highlight' {
		if (/error|err|fail|fatal|not found|denied|✗|✘/i.test(text)) return 'err';
		if (/✔|✓|success|done|ok|complete|ready|saved|built/i.test(text)) return 'ok';
		if (/https?:\/\//i.test(text)) return 'url';
		// 高亮显示标题类文本
		if (/^(Usage:|Flags:|Available Commands:|Options:|Commands:|Arguments:|Examples:)/i.test(text.trim())) return 'highlight';
		return 'dim';
	}

	function ms(n: number): string {
		return (n / 1000).toFixed(3) + 's';
	}

	function escXML(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function generate() {
		const raw = inputText.trim();
		if (!raw) {
			alert(translate("term2svg.errors.emptyInput"));
			return;
		}

		const blocks = parseInput(raw);
		const opts = {
			theme: THEMES[theme] || THEMES.catppuccin,
			prompt: promptStr || '~',
			speed: SPEED[speed as keyof typeof SPEED] || SPEED.normal,
			width: svgWidth,
			maxHeight: maxHeight > 0 ? maxHeight : 0
		};

		const svg = buildSVG(blocks, opts);
		if (!svg) {
			alert(translate("term2svg.errors.noContent"));
			return;
		}

		lastSVG = svg;
		const lineCount = blocks.filter(b => b.type !== 'empty').length;
		previewMeta = `${lineCount} lines`;
	}

	function buildSVG(blocks: Block[], opts: { theme: ThemeConfig; prompt: string; speed: { charMs: number; cmdGap: number; outGap: number }; width: number; maxHeight: number }): string | null {
		const theme = opts.theme;
		const spd = opts.speed;
		const W = opts.width;
		const FONT_SIZE = 13;
		const LINE_H = 22;
		const PAD_X = 22;
		const PAD_TOP = 58;
		const TITLE_H = 38;
		const CHAR_W = FONT_SIZE * 0.605;

		// 移除首尾空行，但保留中间空行
		while (blocks.length && blocks[0].type === 'empty') blocks.shift();
		while (blocks.length && blocks[blocks.length - 1].type === 'empty') blocks.pop();
		if (!blocks.length) return null;

		// 计算内容总高度（包括空行）
		const contentHeight = blocks.length * LINE_H;
		const totalContentH = PAD_TOP + contentHeight + 32;

		// 确定可视区域高度（使用 maxHeight 或自动）
		const VIEW_H = opts.maxHeight > TITLE_H + 50 ? opts.maxHeight : totalContentH;
		const H = VIEW_H;

		// 可视区域高度（从 PAD_TOP 开始）
		const visibleAreaH = VIEW_H - PAD_TOP;

		// 底部边距，让最后一行距离底部一定距离
		const BOTTOM_PADDING = FONT_SIZE + 10;

		// 是否需要滚动
		const needsScroll = totalContentH > VIEW_H;
		// 修正：减去底部边距，让最后一行距离底部一定距离
		const scrollOffset = needsScroll ? Math.round((totalContentH - VIEW_H + BOTTOM_PADDING) / LINE_H) * LINE_H : 0;

		let t = 300;
		let idCounter = 0;
		const defs: string[] = [];
		const svgEls: string[] = [];

		// 记录每行完成显示的时间点（用于同步滚动）
		const lineTimings: { lineIndex: number; completeTime: number; y: number }[] = [];

		const colorMap: Record<string, string> = {
			dim: theme.outDim,
			ok: theme.outOk,
			err: theme.outErr,
			url: theme.outUrl,
			highlight: theme.text  // 使用默认文本颜色高亮
		};

		let i = 0;
		while (i < blocks.length) {
			const b = blocks[i];
			const y = PAD_TOP + i * LINE_H + FONT_SIZE;

			if (b.type === 'empty') { i++; continue; }

			if (b.type === 'cmd') {
				const id = `e${idCounter++}`;
				const promptTx = opts.prompt + ' $ ';
				const promptW = promptTx.length * CHAR_W;
				const cmdTx = b.text;
				const charCount = Math.max(cmdTx.length, 1);
				const cmdW = charCount * CHAR_W;
				const typeDur = Math.max(charCount * spd.charMs, 150);
				const lineX = PAD_X + promptW;

				const keyTimes: string[] = [];
				const values: string[] = [];
				for (let k = 0; k <= charCount; k++) {
					keyTimes.push((k / charCount).toFixed(4));
					values.push(Math.round(k * cmdW / charCount).toString());
				}

				defs.push(`
  <clipPath id="clip_${id}">
    <rect x="${lineX}" y="${y - FONT_SIZE}" width="0" height="${FONT_SIZE + 4}">
      <animate attributeName="width"
        from="0" to="${cmdW + 2}"
        begin="${ms(t)}" dur="${ms(typeDur)}"
        calcMode="discrete"
        keyTimes="${keyTimes.join(';')}"
        values="${values.join(';')}"
        fill="freeze"/>
    </rect>
  </clipPath>`);

				const cursorValues: string[] = [];
				for (let k = 0; k <= charCount; k++) {
					cursorValues.push((lineX + Math.round(k * cmdW / charCount)).toString());
				}

				svgEls.push(`
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(t)}" dur="0.001s" fill="freeze"/>
    <text x="${PAD_X}" y="${y}" font-size="${FONT_SIZE}"
      font-family="'JetBrains Mono','Courier New',monospace"
      fill="${theme.prompt}">${escXML(promptTx)}</text>
    <text x="${lineX}" y="${y}" font-size="${FONT_SIZE}"
      font-family="'JetBrains Mono','Courier New',monospace"
      fill="${theme.cmd}"
      clip-path="url(#clip_${id})">${escXML(cmdTx)}</text>
    <text y="${y}" font-size="${FONT_SIZE}"
      font-family="'JetBrains Mono','Courier New',monospace"
      fill="${theme.cursor}">
      <animate attributeName="x"
        from="${lineX}" to="${lineX + cmdW}"
        begin="${ms(t)}" dur="${ms(typeDur)}"
        calcMode="discrete"
        keyTimes="${keyTimes.join(';')}"
        values="${cursorValues.join(';')}"
        fill="freeze"/>
      <animate attributeName="opacity" values="1;0;1;0;1;0;1;0;1;0;0"
        keyTimes="0;0.1;0.2;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1"
        begin="${ms(t)}" dur="${ms(typeDur + 500)}" fill="freeze"/>
      █</text>
  </g>`);

				const cmdCompleteTime = t + typeDur;
				lineTimings.push({ lineIndex: i, completeTime: cmdCompleteTime, y });
				t = cmdCompleteTime + spd.cmdGap;
				i++;

				let outIdx = 0;
				while (i < blocks.length && blocks[i].type === 'out') {
					const ob = blocks[i];
					const oy = PAD_TOP + i * LINE_H + FONT_SIZE;
					const col = colorMap[classifyOut(ob.text)] || theme.outDim;
					const delay = t + outIdx * spd.outGap;
					const outCompleteTime = delay + 80;

					svgEls.push(`
  <text x="${PAD_X}" y="${oy}" font-size="${FONT_SIZE}"
    font-family="'JetBrains Mono','Courier New',monospace"
    fill="${col}" opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(delay)}" dur="0.001s" fill="freeze"/>
    ${escXML(ob.text)}</text>`);

					lineTimings.push({ lineIndex: i, completeTime: outCompleteTime, y: oy });
					t = outCompleteTime;
					outIdx++;
					i++;
				}
				if (outIdx > 0) t += spd.cmdGap * 0.4;

			} else if (b.type === 'out') {
				const col = colorMap[classifyOut(b.text)] || theme.outDim;
				const outCompleteTime = t + 80;
				svgEls.push(`
  <text x="${PAD_X}" y="${y}" font-size="${FONT_SIZE}"
    font-family="'JetBrains Mono','Courier New',monospace"
    fill="${col}" opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(t)}" dur="0.001s" fill="freeze"/>
    ${escXML(b.text)}</text>`);
				lineTimings.push({ lineIndex: i, completeTime: outCompleteTime, y });
				t = outCompleteTime + spd.outGap;
				i++;
			} else {
				i++;
			}
		}

		// 添加内容裁剪区域（用于滚动时裁剪超出部分）
		const clipId = `contentClip${Date.now()}`;
		if (needsScroll) {
			// 裁剪区域从 PAD_TOP 开始，确保与内容起始位置一致
			defs.push(`  <clipPath id="${clipId}">
    <rect x="0" y="${PAD_TOP}" width="${W}" height="${visibleAreaH}"/>
  </clipPath>`);
		}

		// 计算滚动动画参数 - 与内容生成同步
		let scrollAnim = '';
		if (needsScroll && scrollOffset > 0) {
			const scrollKeyTimes: string[] = ['0'];
			const scrollValues: string[] = ['0'];

			// 为每个需要滚动的行添加关键帧
			let lastScrollPos = 0;

			for (const timing of lineTimings) {
				const lineTop = timing.y - PAD_TOP;
				const lineBottom = lineTop + FONT_SIZE;

				// 计算需要滚动多少才能让这行可见（考虑底部边距）
				// 使用 LINE_H 的整数倍确保对齐
				const rawScroll = Math.max(0, lineBottom - visibleAreaH + BOTTOM_PADDING);
				const neededScroll = Math.round(rawScroll / LINE_H) * LINE_H;

				if (neededScroll > lastScrollPos) {
					// 归一化时间（相对于总时长）
					const normalizedTime = timing.completeTime / (t + 500);
					scrollKeyTimes.push(normalizedTime.toFixed(4));
					scrollValues.push(neededScroll.toString());
					lastScrollPos = neededScroll;
				}
			}

			// 确保最终滚动到正确位置
			if (lastScrollPos < scrollOffset) {
				const normalizedTime = (t + 500) / (t + 500);
				scrollKeyTimes.push(normalizedTime.toFixed(4));
				scrollValues.push(scrollOffset.toString());
			}

			// 去重并保持时间递增
			const uniqueKeyTimes: string[] = [];
			const uniqueValues: string[] = [];
			let lastTime = -1;
			for (let j = 0; j < scrollKeyTimes.length; j++) {
				const timeVal = parseFloat(scrollKeyTimes[j]);
				if (timeVal > lastTime) {
					uniqueKeyTimes.push(scrollKeyTimes[j]);
					// 垂直向上滚动：x=0, y=-scrollValue
					uniqueValues.push(`0 -${scrollValues[j]}`);
					lastTime = timeVal;
				} else if (timeVal === lastTime && j === scrollKeyTimes.length - 1) {
					// 最后一个时间点使用最大滚动值
					uniqueValues[uniqueValues.length - 1] = `0 -${scrollValues[j]}`;
				}
			}

			scrollAnim = `  <animateTransform attributeName="transform" type="translate"
    from="0 0" to="0 -${scrollOffset}"
    begin="0s" dur="${ms(t + 500)}"
    calcMode="discrete"
    keyTimes="${uniqueKeyTimes.join(';')}"
    values="${uniqueValues.join(';')}"
    fill="freeze"/>`;
		}

		// 包装内容：外层应用裁剪，内层应用滚动变换
		const contentGroup = needsScroll
			? `<g clip-path="url(#${clipId})">
  <g>
    ${scrollAnim}
${svgEls.join('\n')}
  </g>
</g>`
			: svgEls.join('\n');

		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
${defs.join('\n')}
</defs>
<rect width="${W}" height="${H}" rx="12" fill="${theme.bg}"/>
${contentGroup}
<rect width="${W}" height="${TITLE_H}" rx="12" fill="${theme.titleBar}"/>
<rect y="${TITLE_H - 6}" width="${W}" height="6" fill="${theme.titleBar}"/>
<circle cx="18" cy="${TITLE_H / 2}" r="6" fill="#ff6b6b"/>
<circle cx="38" cy="${TITLE_H / 2}" r="6" fill="#ffd93d"/>
<circle cx="58" cy="${TITLE_H / 2}" r="6" fill="#6bcb77"/>
<text x="${W / 2}" y="${TITLE_H / 2 + 5}" text-anchor="middle" fill="${theme.outDim}" font-size="12" font-family="'JetBrains Mono','Courier New',monospace">${escXML(opts.prompt)} — bash</text>
</svg>`;
	}

	function downloadSVG() {
		if (!lastSVG) return;
		const blob = new Blob([lastSVG], { type: 'image/svg+xml' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'terminal-animation.svg';
		a.click();
	}

	function copySVG() {
		if (!lastSVG) return;
		navigator.clipboard.writeText(lastSVG).then(() => {
			copyFeedback = true;
			setTimeout(() => copyFeedback = false, 1500);
		});
	}

	function replaySVG() {
		replayKey++;
	}

	onMount(() => {
		generate();
	});
</script>

<svelte:head>
	<title>{translate("term2svg.title")} - {translate("common.title")}</title>
	<meta name="description" content={translate("term2svg.description")} />
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
				<button class="btn-secondary flex-1 min-w-[120px]" onclick={copySVG}>
					<span class="font-mono">{copyFeedback ? '✓ ' + translate("common.copied").toUpperCase() : translate("term2svg.preview.copy")}</span>
				</button>
				<button class="btn-secondary flex-1 min-w-[120px]" onclick={replaySVG}>
					<span class="font-mono">{translate("term2svg.preview.replay")}</span>
				</button>
			</div>
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