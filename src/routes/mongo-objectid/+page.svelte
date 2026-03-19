<script lang="ts">
	import {
		objectIdToDate,
		dateToObjectId,
		objectIdToTimestamp,
		createObjectIdFromDate,
		parseObjectId,
		validateObjectIds,
		formatForMongoShell,
		getUnixTimestamp,
		isValidObjectId,
		type ValidationResult,
	} from "$lib/utils/mongo-objectid";
	import { translate } from "$lib/i18n/store.svelte";

	// 主输入 - ObjectId
	let objectIdInput = $state("");
	// 主输入 - 时间戳
	let timestampInput = $state("");

	// 批量验证输入
	let batchInput = $state("");
	let batchResults = $state<ValidationResult[]>([]);

	// 复制反馈状态
	let copyFeedback = $state<Record<string, boolean>>({});

	// 初始化为当前时间
	$effect(() => {
		const now = new Date();
		const { objectId, timestamp } = createObjectIdFromDate(
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
		);
		objectIdInput = objectId;
		timestampInput = timestamp;
	});

	// 解析 ObjectId 结果
	let parsedObjectId = $derived(
		objectIdInput && isValidObjectId(objectIdInput)
			? parseObjectId(objectIdInput)
			: null,
	);

	// 从 ObjectId 转换
	function convertFromObjectId() {
		if (!objectIdInput || !isValidObjectId(objectIdInput)) {
			return;
		}

		const date = objectIdToDate(objectIdInput);
		if (date) {
			timestampInput = date.toISOString();
		}
	}

	// 从时间戳转换
	function convertFromTimestamp() {
		if (!timestampInput) {
			return;
		}

		const date = new Date(timestampInput);
		if (isNaN(date.getTime())) {
			return;
		}

		objectIdInput = dateToObjectId(date);
	}

	// 监听 ObjectId 变化
	$effect(() => {
		if (objectIdInput && isValidObjectId(objectIdInput)) {
			convertFromObjectId();
		}
	});

	// 监听时间戳变化
	$effect(() => {
		if (timestampInput) {
			convertFromTimestamp();
		}
	});

	// 批量验证
	function handleBatchValidate() {
		const lines = batchInput.split("\n").filter((line) => line.trim());
		batchResults = validateObjectIds(lines);
	}

	// 复制到剪贴板
	async function copyToClipboard(text: string, key: string) {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			copyFeedback[key] = true;
			setTimeout(() => (copyFeedback[key] = false), 1500);
		} catch (err) {
			console.error("复制失败:", err);
		}
	}
</script>

<svelte:head>
	<title>{translate("mongoObjectId.title")} - {translate("common.title")}</title>
	<meta
		name="description"
		content={translate("mongoObjectId.description")}
	/>
	
	<!-- Open Graph -->
	<meta property="og:title" content={translate("mongoObjectId.title")} />
	<meta property="og:description" content={translate("mongoObjectId.description")} />
	<meta property="og:image" content="https://tools.xcrong.me/og-image-mongo.png" />
	<meta property="og:image:alt" content="MongoDB ObjectId Converter - Cyber Terminal Style" />
	<meta property="og:url" content="https://tools.xcrong.me/mongo-objectid" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={translate("mongoObjectId.title")} />
	<meta name="twitter:description" content={translate("mongoObjectId.description")} />
	<meta name="twitter:image" content="https://tools.xcrong.me/og-image-mongo.png" />
	<meta name="twitter:image:alt" content="MongoDB ObjectId Converter - Cyber Terminal Style" />
</svelte:head>

<div class="content-container">
	<div class="page-title">{translate("mongoObjectId.title")}</div>

	<!-- 输入区域 - 双栏 -->
	<section class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
		<!-- ObjectId 输入 -->
		<div class="tool-card tool-card-cyan">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-cyan">
					<span class="font-mono text-lg text-cyan font-bold">ID</span>
				</div>
				<h2 class="card-title">{translate("mongoObjectId.input.objectId")}</h2>
			</div>
			<div class="space-y-4">
				<input
					type="text"
					placeholder={translate("mongoObjectId.input.objectIdPlaceholder")}
					bind:value={objectIdInput}
					class="tool-input {objectIdInput.length > 0 && !isValidObjectId(objectIdInput) ? 'tool-input-error' : ''}"
				/>
				{#if objectIdInput.length > 0 && !isValidObjectId(objectIdInput)}
					<p class="text-sm flex items-center gap-2" style="color: var(--error);">
						<span>⚠</span>
						<span class="font-mono">{translate("mongoObjectId.input.invalidFormat")}</span>
					</p>
				{/if}
				<div class="flex gap-3">
					<button
						onclick={() => copyToClipboard(objectIdInput, 'oid')}
						class="btn-primary btn-primary-filled flex-1"
					>
						<span class="font-mono">{copyFeedback['oid'] ? '✓ ' + translate("common.copied").toUpperCase() : translate("common.copy").toUpperCase()}</span>
					</button>
					<button onclick={() => (objectIdInput = '')} class="btn-secondary flex-1">
						<span class="font-mono">{translate("common.clear").toUpperCase()}</span>
					</button>
				</div>
			</div>
		</div>

		<!-- 时间戳输入 -->
		<div class="tool-card tool-card-green">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-green">
					<span class="font-mono text-lg text-green font-bold">TS</span>
				</div>
				<h2 class="card-title">{translate("mongoObjectId.input.timestamp")}</h2>
			</div>
			<div class="space-y-4">
				<input
					type="text"
					placeholder={translate("mongoObjectId.input.timestampPlaceholder")}
					bind:value={timestampInput}
					class="tool-input"
				/>
				<div class="flex gap-3">
					<button
						onclick={() => copyToClipboard(timestampInput, 'ts')}
						class="btn-primary flex-1"
						style="border-color: var(--neon-green); color: var(--neon-green);"
					>
						<span class="font-mono">{copyFeedback['ts'] ? '✓ ' + translate("common.copied").toUpperCase() : translate("common.copy").toUpperCase()}</span>
					</button>
					<button onclick={() => (timestampInput = '')} class="btn-secondary flex-1">
						<span class="font-mono">{translate("common.clear").toUpperCase()}</span>
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- 转换结果 -->
	{#if parsedObjectId}
		<div class="tool-card mb-6 animate-fade-in">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-purple">
					<svg class="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="card-title">{translate("mongoObjectId.result.title")}</h2>
			</div>
			<div class="space-y-3">
				<div class="data-row">
					<span class="data-label">{translate("mongoObjectId.result.iso")}</span>
					<span class="data-value">{parsedObjectId.date.toISOString()}</span>
					<button
						class="btn-copy {copyFeedback['iso'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(parsedObjectId!.date.toISOString(), 'iso')}
					>
						{copyFeedback['iso'] ? '✓' : translate("common.copy").toUpperCase()}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">{translate("mongoObjectId.result.local")}</span>
					<span class="data-value">{parsedObjectId.date.toLocaleString()}</span>
					<button
						class="btn-copy {copyFeedback['local'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(parsedObjectId!.date.toLocaleString(), 'local')}
					>
						{copyFeedback['local'] ? '✓' : translate("common.copy").toUpperCase()}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">{translate("mongoObjectId.result.unixS")}</span>
					<span class="data-value">{getUnixTimestamp(parsedObjectId.date, "s")}</span>
					<button
						class="btn-copy {copyFeedback['unix-s'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(getUnixTimestamp(parsedObjectId!.date, "s").toString(), 'unix-s')}
					>
						{copyFeedback['unix-s'] ? '✓' : translate("common.copy").toUpperCase()}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">{translate("mongoObjectId.result.unixMs")}</span>
					<span class="data-value">{getUnixTimestamp(parsedObjectId.date, "ms")}</span>
					<button
						class="btn-copy {copyFeedback['unix-ms'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(getUnixTimestamp(parsedObjectId!.date, "ms").toString(), 'unix-ms')}
					>
						{copyFeedback['unix-ms'] ? '✓' : translate("common.copy").toUpperCase()}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">{translate("mongoObjectId.result.mongo")}</span>
					<span class="data-value font-semibold">{formatForMongoShell(objectIdInput)}</span>
					<button
						class="btn-copy {copyFeedback['mongo'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(formatForMongoShell(objectIdInput), 'mongo')}
					>
						{copyFeedback['mongo'] ? '✓' : translate("common.copy").toUpperCase()}
					</button>
				</div>
			</div>
		</div>

		<!-- ObjectId 结构解析 -->
		<div class="tool-card mb-6 animate-fade-in">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-yellow">
					<svg class="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
				</div>
				<h2 class="card-title">{translate("mongoObjectId.structure.title")}</h2>
			</div>
			<div class="structure-diagram mb-5">
				<div class="hex-string font-mono">
					{#each objectIdInput.match(/.{1,2}/g) || [] as hex, i}
						<span class="hex-byte byte-{i < 4 ? 'ts' : i < 7 ? 'mid' : i < 9 ? 'pid' : 'ctr'}">{hex}</span>
					{/each}
				</div>
				<div class="hex-legend">
					<div class="legend-item">
						<span class="legend-dot byte-ts"></span>
						<span class="legend-label">{translate("mongoObjectId.structure.legend.timestamp")}</span>
					</div>
					<div class="legend-item">
						<span class="legend-dot byte-mid"></span>
						<span class="legend-label">{translate("mongoObjectId.structure.legend.machineId")}</span>
					</div>
					<div class="legend-item">
						<span class="legend-dot byte-pid"></span>
						<span class="legend-label">{translate("mongoObjectId.structure.legend.processId")}</span>
					</div>
					<div class="legend-item">
						<span class="legend-dot byte-ctr"></span>
						<span class="legend-label">{translate("mongoObjectId.structure.legend.counter")}</span>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="data-block">
					<div class="data-block-label">{translate("mongoObjectId.structure.timestamp")}</div>
					<div class="data-block-value">{parsedObjectId.timestamp}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">{translate("mongoObjectId.structure.machineId")}</div>
					<div class="data-block-value">{parsedObjectId.machineId}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">{translate("mongoObjectId.structure.processId")}</div>
					<div class="data-block-value">{parsedObjectId.processId}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">{translate("mongoObjectId.structure.counter")}</div>
					<div class="data-block-value">{parsedObjectId.counter}</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 批量验证 -->
	<div class="tool-card mb-6">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-orange">
				<svg class="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
			</div>
			<h2 class="card-title">{translate("mongoObjectId.batch.title")}</h2>
		</div>
		<p class="text-sm mb-5 text-secondary font-mono">
			<span class="text-cyan">$</span> {translate("mongoObjectId.batch.hint")}
		</p>
		<div class="space-y-4 mb-5">
			<textarea
				placeholder="507f1f77bcf86cd799439011
507f1f77bcf86cd799439012
invalid_objectid"
				bind:value={batchInput}
				rows="5"
				class="tool-input resize-none"
			></textarea>
			<button class="btn-primary" onclick={handleBatchValidate}>
				<span class="font-mono">{translate("mongoObjectId.batch.validate")}</span>
			</button>
		</div>

		{#if batchResults.length > 0}
			<div class="space-y-2 animate-fade-in">
				<h3 class="text-base font-semibold mb-3 font-mono text-secondary">
					{translate("mongoObjectId.batch.results")}
				</h3>
				{#each batchResults as result}
					<div
						class="data-row {result.isValid ? 'state-success' : 'state-error'}"
					>
						<span class="font-mono text-lg">{result.isValid ? '✓' : '✗'}</span>
						<span class="data-value">{result.objectId}</span>
						{#if result.error}
							<span class="text-sm font-mono" style="color: var(--error);">{result.error}</span>
						{/if}
					</div>
				{/each}
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
			<h2 class="card-title">{translate("mongoObjectId.guide.title")}</h2>
		</div>
		<div class="space-y-6">
			<div>
				<h3 class="text-base font-semibold mb-3 font-mono text-cyan">{translate("mongoObjectId.guide.structureTitle")}</h3>
				<p class="text-sm mb-4 text-secondary">
					{translate("mongoObjectId.guide.structureDesc")}
				</p>
				<div class="code-block font-mono text-sm">
<div>┌─────────────┬─────────────┬─────────────┬─────────────┐</div>
<div>│  TIMESTAMP  │  MACHINE_ID │  PROCESS_ID │   COUNTER   │</div>
<div>│   4 bytes   │   3 bytes   │   2 bytes   │   3 bytes   │</div>
<div>└─────────────┴─────────────┴─────────────┴─────────────┘</div>
				</div>
			</div>

			<div>
				<h3 class="text-base font-semibold mb-3 font-mono text-cyan">{translate("mongoObjectId.guide.mongoShellTitle")}</h3>
				<p class="text-sm mb-3 text-secondary">
					{translate("mongoObjectId.guide.mongoShellDesc")}
				</p>
				<div class="code-block">
{'<code>db.collection.find({ "_id": { "$gt": ObjectId("5272e0f00000000000000000") } })</code>'}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* 结构图样式 */
	.structure-diagram {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 1rem;
	}

	.hex-string {
		font-size: 1rem;
		letter-spacing: 0.1em;
		margin-bottom: 1rem;
		word-break: break-all;
		line-height: 1.8;
	}

	.hex-byte {
		padding: 0.25rem 0.375rem;
		border-radius: 4px;
		margin: 0 1px;
	}

	.byte-ts {
		background: rgba(0, 245, 255, 0.15);
		color: var(--neon-cyan);
		border: 1px solid rgba(0, 245, 255, 0.3);
	}

	.byte-mid {
		background: rgba(0, 255, 157, 0.15);
		color: var(--neon-green);
		border: 1px solid rgba(0, 255, 157, 0.3);
	}

	.byte-pid {
		background: rgba(255, 0, 160, 0.15);
		color: var(--neon-pink);
		border: 1px solid rgba(255, 0, 160, 0.3);
	}

	.byte-ctr {
		background: rgba(255, 238, 0, 0.15);
		color: var(--neon-yellow);
		border: 1px solid rgba(255, 238, 0, 0.3);
	}

	.hex-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 3px;
	}

	.legend-dot.byte-ts { background: rgba(0, 245, 255, 0.5); }
	.legend-dot.byte-mid { background: rgba(0, 255, 157, 0.5); }
	.legend-dot.byte-pid { background: rgba(255, 0, 160, 0.5); }
	.legend-dot.byte-ctr { background: rgba(255, 238, 0, 0.5); }

	.legend-label {
		color: var(--text-secondary);
	}

	/* 文本颜色工具类 */
	.text-cyan { color: var(--neon-cyan); }
	.text-green { color: var(--neon-green); }
	.text-yellow { color: var(--neon-yellow); }
	.text-purple { color: var(--neon-purple); }
	.text-orange { color: var(--neon-orange); }
</style>
