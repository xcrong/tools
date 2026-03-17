<script lang="ts">
	// Cloudflare Worker API 地址
	const API_URL = 'https://doubao.wjhsjbsish.workers.dev';

	let shareUrl = $state("");
	let loading = $state(false);
	let videoInfo: any = $state(null);
	let error = $state("");
	let copyFeedback = $state<Record<string, boolean>>({});

	async function parseUrl() {
		if (!shareUrl) {
			error = "请输入豆包视频分享链接";
			return;
		}

		loading = true;
		error = "";
		videoInfo = null;

		try {
			const response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ shareUrl }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "解析失败");
			}

			videoInfo = data;
		} catch (e) {
			error = (e as Error).message || "解析失败";
		} finally {
			loading = false;
		}
	}

	function copyToClipboard(text: string, key: string) {
		navigator.clipboard.writeText(text).then(() => {
			copyFeedback[key] = true;
			setTimeout(() => (copyFeedback[key] = false), 1500);
		}).catch(() => {
			alert("复制失败，请手动复制");
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !loading) {
			parseUrl();
		}
	}
</script>

<svelte:head>
	<title>Doubao Video // 链接解析 - 开发工具集合</title>
	<meta
		name="description"
		content="从豆包视频分享链接获取高清视频下载地址，支持解析视频信息和一键复制下载链接"
	/>
</svelte:head>

<div class="content-container">
	<div class="page-title">豆包视频链接解析工具</div>

	<!-- 视频链接解析 -->
	<div class="tool-card mb-5 tool-card-pink">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-pink">
				<svg class="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			</div>
			<h2 class="card-title">视频链接解析 // PARSER</h2>
		</div>
		<div class="space-y-4">
			<div>
				<label for="share-url" class="block text-sm font-medium mb-2 font-mono text-secondary">
					<span class="text-pink">$</span> SHARE_URL
				</label>
				<input
					id="share-url"
					type="url"
					placeholder="粘贴豆包视频分享链接"
					bind:value={shareUrl}
					disabled={loading}
					onkeydown={handleKeydown}
					class="tool-input"
				/>
			</div>
			<button
				onclick={parseUrl}
				disabled={loading || !shareUrl}
				class="btn-primary"
				style="border-color: var(--neon-pink); color: var(--neon-pink);"
			>
				{#if loading}
					<span class="loading-spinner"></span>
					<span class="ml-2 font-mono">PARSING...</span>
				{:else}
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					<span class="font-mono">PARSE</span>
				{/if}
			</button>
		</div>

		{#if error}
			<div class="mt-5 p-4 rounded-lg flex items-center animate-fade-in state-error border">
				<span class="mr-3 text-lg">⚠</span>
				<span class="font-mono text-sm">{error}</span>
			</div>
		{/if}

		{#if videoInfo}
			<div class="mt-5 tool-card animate-fade-in" style="background: var(--bg-secondary);">
				<div class="flex items-center mb-5">
					<div class="icon-box icon-box-green">
						<svg class="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="card-title">视频信息 // INFO</h3>
				</div>

				<!-- 视频封面 -->
				{#if videoInfo.play_info?.poster_url}
					<div class="mb-5">
						<div class="data-block-label mb-2">封面 // POSTER</div>
						<div class="poster-container">
							<img 
								src={videoInfo.play_info.poster_url} 
								alt="视频封面" 
								class="poster-image"
							/>
							<div class="poster-overlay">
								<svg class="w-12 h-12 text-pink" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z"/>
								</svg>
							</div>
						</div>
					</div>
				{/if}

				<!-- 视频元数据 -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
					{#if videoInfo.user_info?.nickname}
						<div class="data-block">
							<div class="data-block-label">作者 // AUTHOR</div>
							<div class="data-block-value">{videoInfo.user_info.nickname}</div>
						</div>
					{/if}
					<div class="data-block">
						<div class="data-block-label">分辨率 // RES</div>
						<div class="data-block-value">{videoInfo.play_info.width}x{videoInfo.play_info.height}</div>
					</div>
					<div class="data-block">
						<div class="data-block-label">清晰度 // DEF</div>
						<div class="data-block-value">{videoInfo.play_info.definition}</div>
					</div>
				</div>
				
				<!-- 视频链接 -->
				<div class="data-block mb-3">
					<div class="data-block-label">视频链接 // VIDEO_URL</div>
					<div class="flex gap-2 items-start mt-2">
						<div class="flex-1 p-3 rounded-lg font-mono text-sm break-all code-block">
							{videoInfo.play_info.main}
						</div>
						<button
							onclick={() => copyToClipboard(videoInfo.play_info.main, 'video')}
							class="btn-copy {copyFeedback['video'] ? 'btn-copy-success' : ''} whitespace-nowrap"
						>
							{copyFeedback['video'] ? '✓' : 'CP'}
						</button>
					</div>
				</div>

				<!-- 备用链接 -->
				{#if videoInfo.play_info.backup}
					<div class="data-block mb-3">
						<div class="data-block-label">备用链接 // BACKUP</div>
						<div class="flex gap-2 items-start mt-2">
							<div class="flex-1 p-3 rounded-lg font-mono text-sm break-all code-block opacity-70">
								{videoInfo.play_info.backup}
							</div>
							<button
								onclick={() => copyToClipboard(videoInfo.play_info.backup, 'backup')}
								class="btn-copy {copyFeedback['backup'] ? 'btn-copy-success' : ''} whitespace-nowrap"
							>
								{copyFeedback['backup'] ? '✓' : 'CP'}
							</button>
						</div>
					</div>
				{/if}

				<!-- AI 提示词 -->
				{#if videoInfo.prompt}
					<div class="data-block">
						<div class="data-block-label">AI 提示词 // PROMPT</div>
						<div class="mt-2 text-sm break-all font-mono p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)]" style="color: var(--text-secondary);">
							{videoInfo.prompt}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- 使用说明 -->
	<div class="tool-card">
		<div class="flex items-center mb-5">
			<div class="icon-box" style="border-color: var(--text-muted);">
				<svg class="w-5 h-5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="card-title">使用说明 // GUIDE</h2>
		</div>
		<div class="space-y-3">
			<div class="step-item">
				<span class="step-number">01</span>
				<span class="step-text">在豆包App中复制视频分享链接</span>
			</div>
			<div class="step-item">
				<span class="step-number">02</span>
				<span class="step-text">粘贴到输入框中</span>
			</div>
			<div class="step-item">
				<span class="step-number">03</span>
				<span class="step-text">点击 PARSE 按钮获取视频信息</span>
			</div>
			<div class="step-item">
				<span class="step-number">04</span>
				<span class="step-text">复制下载链接并使用下载工具</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* 海报容器 */
	.poster-container {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--border-primary);
		aspect-ratio: 16/9;
	}

	.poster-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.poster-container:hover .poster-image {
		transform: scale(1.02);
	}

	.poster-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.poster-container:hover .poster-overlay {
		opacity: 1;
	}

	/* 步骤样式 */
	.step-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
	}

	.step-number {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--neon-pink);
		min-width: 24px;
	}

	.step-text {
		color: var(--text-secondary);
		font-size: 0.9375rem;
	}

	/* 文本颜色 */
	.text-pink { color: var(--neon-pink); }
	.text-green { color: var(--neon-green); }
</style>
