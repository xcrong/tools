<script lang="ts">
	import { translate } from "$lib/i18n/store.svelte";
	
	const siteUrl = 'https://tools.xcrong.me';
	const ogImage = '/og-image.png';
</script>

<svelte:head>
	<title>{translate("common.title")}</title>
	<meta name="description" content={translate("common.description")} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={translate("common.title")} />
	<meta property="og:description" content={translate("common.description")} />
	<meta property="og:image" content={`${siteUrl}${ogImage}`} />
	<meta property="og:image:alt" content="Developer Tools - Cyber Terminal Style" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={translate("common.title")} />
	<meta name="twitter:description" content={translate("common.description")} />
	<meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
	<meta name="twitter:image:alt" content="Developer Tools - Cyber Terminal Style" />
</svelte:head>

<div class="content-container grid-bg">
	<!-- 终端风格标题区域 -->
	<div class="hero-section mb-12">
		<div class="terminal-window">
			<div class="terminal-header">
				<div class="terminal-dots">
					<span class="dot dot-red"></span>
					<span class="dot dot-yellow"></span>
					<span class="dot dot-green"></span>
				</div>
				<div class="terminal-title">tools.xcrong.me</div>
			</div>
			<div class="terminal-body">
				<div class="terminal-line">
					<span class="terminal-prompt">$</span>
					<span class="terminal-command">{translate("home.terminal.whoami")}</span>
				</div>
				<div class="terminal-output">
					<span class="text-glow-cyan font-display text-2xl md:text-3xl">tools.xcrong.me</span>
				</div>
				<div class="terminal-line mt-4">
					<span class="terminal-prompt">$</span>
					<span class="terminal-command">{translate("home.terminal.catDescription")}</span>
				</div>
				<div class="terminal-output text-secondary">
					{translate("home.terminal.description")}
				</div>
				<div class="terminal-line mt-4">
					<span class="terminal-prompt">$</span>
					<span class="terminal-cursor">_</span>
				</div>
			</div>
		</div>
	</div>

	<!-- 工具卡片网格 -->
	<div class="tools-grid">
		<!-- MongoDB ObjectId -->
		<a href="/mongo-objectid" class="tool-card tool-card-cyan group">
			<div class="card-glow"></div>
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-cyan">
					<svg class="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
				</div>
				<h2 class="card-title">{translate("home.tools.mongoObjectId.title")}</h2>
			</div>
			<p class="text-sm leading-relaxed mb-6 text-secondary">
				{translate("home.tools.mongoObjectId.description")}
			</p>
			<div class="flex items-center justify-between">
				<div class="tool-tags">
					<span class="tag">#{translate("home.tools.mongoObjectId.tags.0")}</span>
					<span class="tag">#{translate("home.tools.mongoObjectId.tags.1")}</span>
				</div>
				<div class="enter-btn">
					<span>{translate("common.execute")}</span>
					<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
		</a>

		<!-- 时间戳转换 -->
		<a href="/timestamp" class="tool-card tool-card-green group">
			<div class="card-glow"></div>
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-green">
					<svg class="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h2 class="card-title">{translate("home.tools.timestamp.title")}</h2>
			</div>
			<p class="text-sm leading-relaxed mb-6 text-secondary">
				{translate("home.tools.timestamp.description")}
			</p>
			<div class="flex items-center justify-between">
				<div class="tool-tags">
					<span class="tag">#{translate("home.tools.timestamp.tags.0")}</span>
					<span class="tag">#{translate("home.tools.timestamp.tags.1")}</span>
				</div>
				<div class="enter-btn text-green">
					<span>{translate("common.execute")}</span>
					<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
		</a>

		<!-- 豆包视频下载 -->
		<a href="/doubao-video" class="tool-card tool-card-pink group">
			<div class="card-glow"></div>
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-pink">
					<svg class="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				</div>
				<h2 class="card-title">{translate("home.tools.doubaoVideo.title")}</h2>
			</div>
			<p class="text-sm leading-relaxed mb-6 text-secondary">
				{translate("home.tools.doubaoVideo.description")}
			</p>
			<div class="flex items-center justify-between">
				<div class="tool-tags">
					<span class="tag">#{translate("home.tools.doubaoVideo.tags.0")}</span>
					<span class="tag">#{translate("home.tools.doubaoVideo.tags.1")}</span>
				</div>
				<div class="enter-btn text-pink">
					<span>{translate("common.execute")}</span>
					<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
		</a>

		<!-- term2svg -->
		<a href="/term2svg" class="tool-card tool-card-purple group">
			<div class="card-glow"></div>
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-purple">
					<span class="font-mono text-lg text-purple">$</span>
				</div>
				<h2 class="card-title">{translate("home.tools.term2svg.title")}</h2>
			</div>
			<p class="text-sm leading-relaxed mb-6 text-secondary">
				{translate("home.tools.term2svg.description")}
			</p>
			<div class="flex items-center justify-between">
				<div class="tool-tags">
					<span class="tag">#{translate("home.tools.term2svg.tags.0")}</span>
					<span class="tag">#{translate("home.tools.term2svg.tags.1")}</span>
				</div>
				<div class="enter-btn text-purple">
					<span>{translate("common.execute")}</span>
					<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
		</a>

	</div>

	<!-- 状态栏 -->
	<div class="status-bar mt-12">
		<div class="status-item">
			<span class="status-label">{translate("home.status.system")}</span>
			<span class="status-value text-green">● {translate("home.status.online")}</span>
		</div>
		<div class="status-item">
			<span class="status-label">{translate("home.status.tools")}</span>
			<span class="status-value text-cyan">04 {translate("home.status.active")}</span>
		</div>
		<div class="status-item">
			<span class="status-label">{translate("home.status.version")}</span>
			<span class="status-value">v2.0.0</span>
		</div>
	</div>
</div>

<style>
	/* 终端窗口 */
	.terminal-window {
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
					0 0 0 1px rgba(0, 245, 255, 0.1);
	}

	.terminal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-primary);
	}

	.terminal-dots {
		display: flex;
		gap: 0.5rem;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.dot-red { background: #ff5f56; }
	.dot-yellow { background: #ffbd2e; }
	.dot-green { background: #27c93f; }

	.terminal-title {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin-left: auto;
	}

	.terminal-body {
		padding: 2rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.terminal-line {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.terminal-prompt {
		color: var(--neon-cyan);
		font-weight: 600;
	}

	.terminal-command {
		color: var(--text-secondary);
	}

	.terminal-output {
		margin: 0.5rem 0 0.5rem 1.75rem;
		line-height: 1.6;
	}

	.terminal-cursor {
		color: var(--neon-cyan);
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	/* 工具网格 */
	.tools-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.tools-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.tools-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* 卡片光效 */
	.card-glow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: radial-gradient(
			circle at 50% 0%,
			rgba(0, 245, 255, 0.1),
			transparent 70%
		);
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}

	.tool-card:hover .card-glow {
		opacity: 1;
	}

	/* 工具标签 */
	.tool-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-muted);
		border: 1px solid var(--border-primary);
	}

	/* 进入按钮 */
	.enter-btn {
		display: flex;
		align-items: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--neon-cyan);
		transition: all 0.2s;
	}

	.group:hover .enter-btn {
		text-shadow: 0 0 10px currentColor;
	}

	/* 状态栏 */
	.status-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 1rem 1.25rem;
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-label {
		color: var(--text-muted);
	}

	.status-value {
		font-weight: 600;
	}
</style>
