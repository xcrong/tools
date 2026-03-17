<script lang="ts">
	import { onMount } from "svelte";

	let inputValue = $state("");
	let nowTimestamp = $state({ s: 0, ms: 0 });
	let currentTime = $state({ local: "", timezone: "", iso: "", utc: "" });

	let result = $state({
		s: "",
		ms: "",
		iso: "",
		local: "",
		utc: "",
	});

	let copyFeedback = $state<Record<string, boolean>>({});

	function detectPrecision(value: string): string {
		const len = value.length;
		if (len <= 11) return "s";
		if (len <= 14) return "ms";
		if (len <= 17) return "us";
		return "ns";
	}

	function convert() {
		if (!inputValue.trim()) {
			result = { s: "", ms: "", iso: "", local: "", utc: "" };
			return;
		}

		const value = inputValue.trim();
		let timestamp = 0;

		if (isNaN(Number(value))) {
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				return;
			}
			timestamp = date.getTime();
		} else {
			const num = Number(value);
			const precision = detectPrecision(value);

			switch (precision) {
				case "s":
					timestamp = num * 1000;
					break;
				case "ms":
					timestamp = num;
					break;
				case "us":
					timestamp = num / 1000;
					break;
				case "ns":
					timestamp = num / 1000000;
					break;
			}
		}

		const date = new Date(timestamp);

		result.s = Math.floor(timestamp / 1000).toString();
		result.ms = timestamp.toString();
		result.iso = date.toISOString();
		result.local = date.toLocaleString("zh-CN");
		result.utc = date.toUTCString();
	}

	function updateNow() {
		const now = Date.now();
		nowTimestamp.s = Math.floor(now / 1000);
		nowTimestamp.ms = now;

		const date = new Date(now);
		currentTime.local = date.toLocaleString("zh-CN");
		currentTime.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		currentTime.iso = date.toISOString();
		currentTime.utc = date.toUTCString();
	}

	function copyToClipboard(text: string, key: string) {
		if (!text) return;
		navigator.clipboard.writeText(text).then(() => {
			copyFeedback[key] = true;
			setTimeout(() => (copyFeedback[key] = false), 1500);
		});
	}

	function fillNow() {
		inputValue = nowTimestamp.s.toString();
	}

	function clearInput() {
		inputValue = "";
		result = { s: "", ms: "", iso: "", local: "", utc: "" };
	}

	$effect(() => {
		convert();
	});

	onMount(() => {
		updateNow();
		const interval = setInterval(updateNow, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Timestamp // 转换工具 - 开发工具集合</title>
	<meta
		name="description"
		content="Unix时间戳在线转换工具，支持秒/毫秒/微秒/纳秒多种精度"
	/>
</svelte:head>

<div class="content-container">
	<div class="page-title">时间戳转换工具</div>

	<!-- 当前时间 - 实时显示 -->
	<div class="tool-card mb-5 tool-card-cyan animate-pulse-glow">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-cyan">
				<svg class="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="card-title">当前时间 // NOW</h2>
			<div class="ml-auto">
				<span class="live-indicator">
					<span class="live-dot"></span>
					<span class="live-text">LIVE</span>
				</span>
			</div>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div class="data-row">
				<span class="data-label">UNIX_S:</span>
				<span class="data-value text-cyan text-lg">{nowTimestamp.s}</span>
				<button
					class="btn-copy {copyFeedback['nowS'] ? 'btn-copy-success' : ''}"
					onclick={() => copyToClipboard(nowTimestamp.s.toString(), 'nowS')}
				>
					{copyFeedback['nowS'] ? '✓' : 'CP'}
				</button>
			</div>
			<div class="data-row">
				<span class="data-label">UNIX_MS:</span>
				<span class="data-value text-cyan text-lg">{nowTimestamp.ms}</span>
				<button
					class="btn-copy {copyFeedback['nowMs'] ? 'btn-copy-success' : ''}"
					onclick={() => copyToClipboard(nowTimestamp.ms.toString(), 'nowMs')}
				>
					{copyFeedback['nowMs'] ? '✓' : 'CP'}
				</button>
			</div>
		</div>
	</div>

	<!-- 当前时间详情 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-purple">
				<svg class="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="card-title">时间详情 // DETAILS</h2>
		</div>
		<div class="space-y-2">
			<div class="data-row">
				<span class="data-label">LOCAL:</span>
				<span class="data-value">{currentTime.local}</span>
			</div>
			<div class="data-row">
				<span class="data-label">TZ:</span>
				<span class="data-value">{currentTime.timezone}</span>
			</div>
			<div class="data-row">
				<span class="data-label">ISO:</span>
				<span class="data-value">{currentTime.iso}</span>
			</div>
			<div class="data-row">
				<span class="data-label">UTC:</span>
				<span class="data-value">{currentTime.utc}</span>
			</div>
		</div>
	</div>

	<!-- 输入 -->
	<div class="tool-card mb-5 tool-card-green">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-green">
				<svg class="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
			<h2 class="card-title">输入 // INPUT</h2>
		</div>
		<div class="flex flex-col sm:flex-row gap-3">
			<input
				type="text"
				placeholder="输入时间戳或日期时间"
				bind:value={inputValue}
				class="tool-input flex-1"
			/>
			<div class="flex gap-2">
				<button class="btn-primary" onclick={fillNow}>
					<span class="font-mono">NOW</span>
				</button>
				<button class="btn-secondary" onclick={clearInput}>
					<span class="font-mono">CLR</span>
				</button>
			</div>
		</div>
		{#if inputValue && !result.s}
			<p class="text-sm mt-3 font-mono" style="color: var(--error);">
				⚠ INVALID_INPUT
			</p>
		{/if}
	</div>

	<!-- 转换结果 -->
	<div class="tool-card">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-yellow">
				<svg class="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h2 class="card-title">转换结果 // OUTPUT</h2>
		</div>
		<div class="space-y-2">
			<div class="data-row">
				<span class="data-label">UNIX_S:</span>
				<span class="data-value {result.s ? 'text-cyan' : 'text-muted'}">{result.s || "---"}</span>
				{#if result.s}
					<button
						class="btn-copy {copyFeedback['s'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.s, 's')}
					>
						{copyFeedback['s'] ? '✓' : 'CP'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label">UNIX_MS:</span>
				<span class="data-value {result.ms ? 'text-cyan' : 'text-muted'}">{result.ms || "---"}</span>
				{#if result.ms}
					<button
						class="btn-copy {copyFeedback['ms'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.ms, 'ms')}
					>
						{copyFeedback['ms'] ? '✓' : 'CP'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label">ISO:</span>
				<span class="data-value {result.iso ? '' : 'text-muted'}">{result.iso || "---"}</span>
				{#if result.iso}
					<button
						class="btn-copy {copyFeedback['iso'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.iso, 'iso')}
					>
						{copyFeedback['iso'] ? '✓' : 'CP'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label">LOCAL:</span>
				<span class="data-value {result.local ? '' : 'text-muted'}">{result.local || "---"}</span>
				{#if result.local}
					<button
						class="btn-copy {copyFeedback['local'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.local, 'local')}
					>
						{copyFeedback['local'] ? '✓' : 'CP'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label">UTC:</span>
				<span class="data-value {result.utc ? '' : 'text-muted'}">{result.utc || "---"}</span>
				{#if result.utc}
					<button
						class="btn-copy {copyFeedback['utc'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.utc, 'utc')}
					>
						{copyFeedback['utc'] ? '✓' : 'CP'}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* 实时指示器 */
	.live-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: rgba(0, 245, 255, 0.1);
		border: 1px solid rgba(0, 245, 255, 0.3);
		border-radius: 4px;
	}

	.live-dot {
		width: 8px;
		height: 8px;
		background: var(--neon-cyan);
		border-radius: 50%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { 
			opacity: 1;
			box-shadow: 0 0 0 0 rgba(0, 245, 255, 0.7);
		}
		50% { 
			opacity: 0.5;
			box-shadow: 0 0 0 6px rgba(0, 245, 255, 0);
		}
	}

	.live-text {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--neon-cyan);
	}

	/* 工具类 */
	.text-cyan { color: var(--neon-cyan); }
	.text-green { color: var(--neon-green); }
	.text-yellow { color: var(--neon-yellow); }
	.text-purple { color: var(--neon-purple); }
	.text-muted { color: var(--text-muted); }
</style>
