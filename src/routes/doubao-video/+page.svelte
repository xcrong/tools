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
	<title>豆包视频链接解析工具 - 开发工具集合</title>
	<meta
		name="description"
		content="从豆包视频分享链接获取高清视频下载地址，支持解析视频信息和一键复制下载链接"
	/>
</svelte:head>

<div class="content-container">
	<div class="page-title">豆包视频链接解析工具</div>

	<!-- 视频链接解析 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-purple">
				<span class="text-lg">🎬</span>
			</div>
			<h2 class="card-title">视频链接解析</h2>
		</div>
		<div class="space-y-4">
			<div>
				<label for="share-url" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
					豆包视频分享链接
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
			>
				{#if loading}
					<span class="loading-spinner"></span>
					<span class="ml-2">解析中...</span>
				{:else}
					<span>🚀 解析链接</span>
				{/if}
			</button>
		</div>

		{#if error}
			<div class="mt-5 p-4 rounded-lg flex items-center animate-fade-in" style="background: var(--error-bg); border: 1px solid var(--error);">
				<span class="mr-2">⚠️</span>
				<span style="color: var(--error);">{error}</span>
			</div>
		{/if}

		{#if videoInfo}
			<div class="mt-5 tool-card animate-fade-in" style="background: var(--surface-muted);">
				<div class="flex items-center mb-5">
					<div class="icon-box icon-box-green">
						<span class="text-lg">📹</span>
					</div>
					<h3 class="card-title">视频信息</h3>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
					{#if videoInfo.user_info?.nickname}
						<div class="data-block">
							<div class="data-block-label">作者</div>
							<div class="data-block-value">{videoInfo.user_info.nickname}</div>
						</div>
					{/if}
					<div class="data-block">
						<div class="data-block-label">分辨率</div>
						<div class="data-block-value">{videoInfo.play_info.width}x{videoInfo.play_info.height}</div>
					</div>
					<div class="data-block">
						<div class="data-block-label">清晰度</div>
						<div class="data-block-value">{videoInfo.play_info.definition}</div>
					</div>
				</div>
				
				<div class="data-block mb-3">
					<div class="data-block-label">视频链接</div>
					<div class="flex gap-2 items-start mt-2">
						<div class="flex-1 p-3 rounded-lg font-mono text-sm break-all" style="background: var(--surface-card); border: 1px solid var(--border); color: var(--text-primary);">
							{videoInfo.play_info.main}
						</div>
						<button
							onclick={() => copyToClipboard(videoInfo.play_info.main, 'video')}
							class="btn-copy {copyFeedback['video'] ? 'btn-copy-success' : ''} whitespace-nowrap"
						>
							{copyFeedback['video'] ? '✓ 已复制' : '📋 复制'}
						</button>
					</div>
				</div>

				{#if videoInfo.play_info.backup}
					<div class="data-block mb-3">
						<div class="data-block-label">备用链接</div>
						<div class="flex gap-2 items-start mt-2">
							<div class="flex-1 p-3 rounded-lg font-mono text-sm break-all" style="background: var(--surface-card); border: 1px solid var(--border); color: var(--text-primary);">
								{videoInfo.play_info.backup}
							</div>
							<button
								onclick={() => copyToClipboard(videoInfo.play_info.backup, 'backup')}
								class="btn-copy {copyFeedback['backup'] ? 'btn-copy-success' : ''} whitespace-nowrap"
							>
								{copyFeedback['backup'] ? '✓ 已复制' : '📋 复制'}
							</button>
						</div>
					</div>
				{/if}

				{#if videoInfo.prompt}
					<div class="data-block">
						<div class="data-block-label">AI 提示词</div>
						<div class="mt-2 text-sm break-all" style="color: var(--text-primary);">
							{videoInfo.prompt}
						</div>
					</div>
				{/if}

				{#if videoInfo.play_info.poster_url}
					<div class="mt-5">
						<div class="data-block-label mb-3">视频封面</div>
						<img 
							src={videoInfo.play_info.poster_url} 
							alt="视频封面" 
							class="rounded-lg max-w-full h-auto"
							style="border: 1px solid var(--border);"
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- 使用说明 -->
	<div class="tool-card">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-blue">
				<span class="text-lg">📋</span>
			</div>
			<h2 class="card-title">使用说明</h2>
		</div>
		<div class="space-y-3">
			<div class="flex items-start">
				<span class="step-indicator">1</span>
				<span style="color: var(--text-secondary);">在豆包App中复制视频分享链接</span>
			</div>
			<div class="flex items-start">
				<span class="step-indicator">2</span>
				<span style="color: var(--text-secondary);">粘贴到上面的输入框中</span>
			</div>
			<div class="flex items-start">
				<span class="step-indicator">3</span>
				<span style="color: var(--text-secondary);">点击"解析链接"获取视频信息和下载链接</span>
			</div>
			<div class="flex items-start">
				<span class="step-indicator">4</span>
				<span style="color: var(--text-secondary);">点击"复制"按钮复制下载链接</span>
			</div>
		</div>
	</div>
</div>