<script lang="ts">
	import { onMount } from "svelte";

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
Model saved to ./checkpoints/model_final.pt`
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
	let lastSVG = $state('');
	let previewMeta = $state('');
	let copyFeedback = $state(false);

	function loadExample(key: string) {
		inputText = EXAMPLES[key];
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

	function classifyOut(text: string): 'dim' | 'ok' | 'err' | 'url' {
		if (/error|err|fail|fatal|not found|denied|✗|✘/i.test(text)) return 'err';
		if (/✔|✓|success|done|ok|complete|ready|saved|built/i.test(text)) return 'ok';
		if (/https?:\/\//i.test(text)) return 'url';
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
			alert('请先粘贴终端文本！');
			return;
		}

		const blocks = parseInput(raw);
		const opts = {
			theme: THEMES[theme] || THEMES.catppuccin,
			prompt: promptStr || '~',
			speed: SPEED[speed as keyof typeof SPEED] || SPEED.normal,
			width: svgWidth
		};

		const svg = buildSVG(blocks, opts);
		if (!svg) {
			alert('没有识别到有效内容，请检查格式。');
			return;
		}

		lastSVG = svg;
		const lineCount = blocks.filter(b => b.type !== 'empty').length;
		previewMeta = `${lineCount} lines`;
	}

	function buildSVG(blocks: Block[], opts: { theme: ThemeConfig; prompt: string; speed: { charMs: number; cmdGap: number; outGap: number }; width: number }): string | null {
		const theme = opts.theme;
		const spd = opts.speed;
		const W = opts.width;
		const FONT_SIZE = 13;
		const LINE_H = 22;
		const PAD_X = 22;
		const PAD_TOP = 58;
		const TITLE_H = 38;
		const CHAR_W = FONT_SIZE * 0.605;

		while (blocks.length && blocks[0].type === 'empty') blocks.shift();
		while (blocks.length && blocks[blocks.length - 1].type === 'empty') blocks.pop();
		if (!blocks.length) return null;

		const H = PAD_TOP + blocks.length * LINE_H + 32;

		let t = 300;
		let idCounter = 0;
		const defs: string[] = [];
		const svgEls: string[] = [];

		const colorMap: Record<string, string> = {
			dim: theme.outDim,
			ok: theme.outOk,
			err: theme.outErr,
			url: theme.outUrl
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

				t += typeDur + spd.cmdGap;
				i++;

				let outIdx = 0;
				while (i < blocks.length && blocks[i].type === 'out') {
					const ob = blocks[i];
					const oy = PAD_TOP + i * LINE_H + FONT_SIZE;
					const col = colorMap[classifyOut(ob.text)] || theme.outDim;
					const delay = t + outIdx * spd.outGap;

					svgEls.push(`
  <text x="${PAD_X}" y="${oy}" font-size="${FONT_SIZE}"
    font-family="'JetBrains Mono','Courier New',monospace"
    fill="${col}" opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(delay)}" dur="0.001s" fill="freeze"/>
    ${escXML(ob.text)}</text>`);

					t = delay + 80;
					outIdx++;
					i++;
				}
				if (outIdx > 0) t += spd.cmdGap * 0.4;

			} else if (b.type === 'out') {
				const col = colorMap[classifyOut(b.text)] || theme.outDim;
				svgEls.push(`
  <text x="${PAD_X}" y="${y}" font-size="${FONT_SIZE}"
    font-family="'JetBrains Mono','Courier New',monospace"
    fill="${col}" opacity="0">
    <animate attributeName="opacity" from="0" to="1"
      begin="${ms(t)}" dur="0.001s" fill="freeze"/>
    ${escXML(b.text)}</text>`);
				t += spd.outGap;
				i++;
			} else {
				i++;
			}
		}

		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
${defs.join('\n')}
</defs>
<rect width="${W}" height="${H}" rx="12" fill="${theme.bg}"/>
<rect width="${W}" height="${TITLE_H}" rx="12" fill="${theme.titleBar}"/>
<rect y="${TITLE_H - 6}" width="${W}" height="6" fill="${theme.titleBar}"/>
<circle cx="18" cy="${TITLE_H / 2}" r="6" fill="#ff6b6b"/>
<circle cx="38" cy="${TITLE_H / 2}" r="6" fill="#ffd93d"/>
<circle cx="58" cy="${TITLE_H / 2}" r="6" fill="#6bcb77"/>
<text x="${W / 2}" y="${TITLE_H / 2 + 5}" text-anchor="middle" fill="${theme.outDim}" font-size="12" font-family="'JetBrains Mono','Courier New',monospace">${escXML(opts.prompt)} — bash</text>
${svgEls.join('\n')}
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

	onMount(() => {
		generate();
	});
</script>

<svelte:head>
	<title>term2svg // 终端动画生成器 - 开发工具集合</title>
	<meta name="description" content="将终端文本转换为动画 SVG，支持多种主题" />
</svelte:head>

<div class="content-container">
	<div class="page-title">term2svg // 终端动画生成器</div>

	<!-- 输入面板 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-green">
				<span class="font-mono text-lg text-green font-bold">$</span>
			</div>
			<h2 class="card-title">终端输入 // INPUT</h2>
		</div>

		<textarea
			bind:value={inputText}
			placeholder="直接粘贴你的终端内容，例如：

$ git status
On branch main
  modified: src/index.js

$ git add .
$ git commit -m &quot;fix: update styles&quot;
[main 3f2a1c9] fix: update styles

提示：以 $ 或 % 或 # 开头的行会被识别为命令，其他行为输出。"
			rows="10"
			class="tool-input resize-none"
		></textarea>

		<!-- 选项网格 -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-4">
			<div class="space-y-1">
				<span class="data-block-label">主题</span>
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
				<span class="data-block-label">提示符</span>
				<input type="text" bind:value={promptStr} class="tool-input text-sm py-2" />
			</div>
			<div class="space-y-1">
				<span class="data-block-label">速度</span>
				<select bind:value={speed} class="tool-input text-sm py-2">
					<option value="fast">快速</option>
					<option value="normal">正常</option>
					<option value="slow">慢速</option>
				</select>
			</div>
			<div class="space-y-1">
				<span class="data-block-label">宽度</span>
				<input type="number" bind:value={svgWidth} min="400" max="1200" class="tool-input text-sm py-2" />
			</div>
		</div>

		<button class="btn-primary btn-primary-filled w-full" onclick={generate}>
			<span class="font-mono">GENERATE SVG</span>
		</button>
	</div>

	<!-- 示例模板 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-4">
			<div class="icon-box icon-box-purple">
				<span class="font-mono text-lg text-purple">#</span>
			</div>
			<h2 class="card-title">示例模板 // EXAMPLES</h2>
		</div>
		<div class="flex flex-wrap gap-2">
			<button class="btn-secondary" onclick={() => loadExample('git')}>
				<span class="font-mono text-sm">git 工作流</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('npm')}>
				<span class="font-mono text-sm">npm install</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('docker')}>
				<span class="font-mono text-sm">docker build</span>
			</button>
			<button class="btn-secondary" onclick={() => loadExample('python')}>
				<span class="font-mono text-sm">python 脚本</span>
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
			<h2 class="card-title">识别规则 // RULES</h2>
		</div>
		<div class="space-y-2 text-sm text-secondary">
			<div class="data-row">
				<span class="data-label">命令行:</span>
				<span class="data-value">以 <span class="text-green font-mono">$</span>、<span class="text-green font-mono">%</span>、<span class="text-green font-mono">#!</span> 开头的行，播放打字动画</span>
			</div>
			<div class="data-row">
				<span class="data-label">输出:</span>
				<span class="data-value">其他行作为命令输出，执行后渐显出现</span>
			</div>
			<div class="data-row">
				<span class="data-label">空行:</span>
				<span class="data-value">保留为间距</span>
			</div>
		</div>
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
					<h2 class="card-title">预览 // PREVIEW</h2>
				</div>
				{#if previewMeta}
					<span class="font-mono text-sm text-muted">{previewMeta}</span>
				{/if}
			</div>

			<div class="preview-container mb-5">
				{@html lastSVG}
			</div>

			<div class="flex gap-3">
				<button class="btn-primary btn-primary-filled flex-1" onclick={downloadSVG}>
					<span class="font-mono">↓ DOWNLOAD</span>
				</button>
				<button class="btn-secondary flex-1" onclick={copySVG}>
					<span class="font-mono">{copyFeedback ? '✓ COPIED' : 'COPY SVG'}</span>
				</button>
			</div>
		</div>
	{/if}
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