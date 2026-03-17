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
	<title>时间戳转换工具 - 开发工具集合</title>
	<meta
		name="description"
		content="Unix时间戳在线转换工具，支持秒/毫秒/微秒/纳秒多种精度"
	/>
</svelte:head>

<div class="content-container">
	<div class="page-title">时间戳转换工具</div>

	<!-- 当前时间戳 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-blue">
				<span class="text-lg">🔄</span>
			</div>
			<h2 class="card-title">当前时间戳</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div class="data-row">
				<span class="data-label text-sm">秒:</span>
				<span class="data-value">{nowTimestamp.s}</span>
				<button
					class="btn-copy {copyFeedback['nowS'] ? 'btn-copy-success' : ''}"
					onclick={() => copyToClipboard(nowTimestamp.s.toString(), 'nowS')}
				>
					{copyFeedback['nowS'] ? '✓' : '📋'}
				</button>
			</div>
			<div class="data-row">
				<span class="data-label text-sm">毫秒:</span>
				<span class="data-value">{nowTimestamp.ms}</span>
				<button
					class="btn-copy {copyFeedback['nowMs'] ? 'btn-copy-success' : ''}"
					onclick={() => copyToClipboard(nowTimestamp.ms.toString(), 'nowMs')}
				>
					{copyFeedback['nowMs'] ? '✓' : '📋'}
				</button>
			</div>
		</div>
	</div>

	<!-- 当前时间 -->
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-green">
				<span class="text-lg">📍</span>
			</div>
			<h2 class="card-title">当前时间</h2>
		</div>
		<div class="space-y-2">
			<div class="data-row">
				<span class="data-label">本地:</span>
				<span class="data-value">{currentTime.local}</span>
			</div>
			<div class="data-row">
				<span class="data-label">时区:</span>
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
	<div class="tool-card mb-5">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-purple">
				<span class="text-lg">⌨️</span>
			</div>
			<h2 class="card-title">输入</h2>
		</div>
		<div class="flex flex-col sm:flex-row gap-3">
			<input
				type="text"
				placeholder="输入时间戳或日期时间"
				bind:value={inputValue}
				class="tool-input flex-1"
			/>
			<div class="flex gap-2">
				<button class="btn-primary whitespace-nowrap" onclick={fillNow}>
					使用当前时间
				</button>
				<button class="btn-secondary whitespace-nowrap" onclick={clearInput}>
					清除
				</button>
			</div>
		</div>
	</div>

	<!-- 转换结果 -->
	<div class="tool-card">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-orange">
				<span class="text-lg">📋</span>
			</div>
			<h2 class="card-title">转换结果</h2>
		</div>
		<div class="space-y-2">
			<div class="data-row">
				<span class="data-label text-sm">Unix 秒:</span>
				<span class="data-value">{result.s || "-"}</span>
				{#if result.s}
					<button
						class="btn-copy {copyFeedback['s'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.s, 's')}
					>
						{copyFeedback['s'] ? '✓ 已复制' : '📋 复制'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label text-sm">Unix 毫秒:</span>
				<span class="data-value">{result.ms || "-"}</span>
				{#if result.ms}
					<button
						class="btn-copy {copyFeedback['ms'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.ms, 'ms')}
					>
						{copyFeedback['ms'] ? '✓ 已复制' : '📋 复制'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label text-sm">ISO 8601:</span>
				<span class="data-value">{result.iso || "-"}</span>
				{#if result.iso}
					<button
						class="btn-copy {copyFeedback['iso'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.iso, 'iso')}
					>
						{copyFeedback['iso'] ? '✓ 已复制' : '📋 复制'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label text-sm">本地时间:</span>
				<span class="data-value">{result.local || "-"}</span>
				{#if result.local}
					<button
						class="btn-copy {copyFeedback['local'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.local, 'local')}
					>
						{copyFeedback['local'] ? '✓ 已复制' : '📋 复制'}
					</button>
				{/if}
			</div>
			<div class="data-row">
				<span class="data-label text-sm">UTC:</span>
				<span class="data-value">{result.utc || "-"}</span>
				{#if result.utc}
					<button
						class="btn-copy {copyFeedback['utc'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(result.utc, 'utc')}
					>
						{copyFeedback['utc'] ? '✓ 已复制' : '📋 复制'}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>