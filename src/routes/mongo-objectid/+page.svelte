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
	<title>MongoDB ObjectId ↔ 时间戳转换器 - 开发工具集合</title>
	<meta
		name="description"
		content="将 MongoDB ObjectId 转换为时间戳，反之亦然。解析 ObjectId 组件，批量验证，生成可查询的 ObjectIds。"
	/>
</svelte:head>

<div class="content-container">
	<div class="page-title">MongoDB ObjectId ↔ 时间戳转换器</div>

	<section class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
		<!-- ObjectId 输入 -->
		<div class="tool-card">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-blue">
					<span class="text-lg">#</span>
				</div>
				<h2 class="card-title">ObjectId</h2>
			</div>
			<div class="space-y-4">
				<input
					type="text"
					placeholder="输入24位字符的ObjectId"
					bind:value={objectIdInput}
					class="tool-input {objectIdInput.length > 0 && !isValidObjectId(objectIdInput) ? 'tool-input-error' : ''}"
				/>
				<div class="flex gap-3">
					<button
						onclick={() => copyToClipboard(objectIdInput, 'oid')}
						class="btn-primary flex-1"
					>
						{copyFeedback['oid'] ? '✓ 已复制' : '复制'}
					</button>
					<button onclick={() => (objectIdInput = '')} class="btn-secondary flex-1">
						清除
					</button>
				</div>
			</div>
			{#if objectIdInput && !isValidObjectId(objectIdInput)}
				<p class="text-sm mt-3 flex items-center" style="color: var(--error);">
					<span class="mr-2">⚠️</span>
					请输入有效的24位十六进制ObjectId
				</p>
			{/if}
		</div>

		<!-- 时间戳输入 -->
		<div class="tool-card">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-green">
					<span class="text-lg">🕐</span>
				</div>
				<h2 class="card-title">时间戳</h2>
			</div>
			<div class="space-y-4">
				<input
					type="text"
					placeholder="输入ISO时间戳"
					bind:value={timestampInput}
					class="tool-input"
				/>
				<div class="flex gap-3">
					<button
						onclick={() => copyToClipboard(timestampInput, 'ts')}
						class="btn-primary flex-1"
					>
						{copyFeedback['ts'] ? '✓ 已复制' : '复制'}
					</button>
					<button onclick={() => (timestampInput = '')} class="btn-secondary flex-1">
						清除
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- 转换结果 -->
	{#if parsedObjectId}
		<div class="tool-card mb-6 animate-fade-in">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-orange">
					<span class="text-lg">📊</span>
				</div>
				<h2 class="card-title">转换结果</h2>
			</div>
			<div class="space-y-3">
				<div class="data-row">
					<span class="data-label">创建时间 (ISO):</span>
					<span class="data-value">{parsedObjectId.date.toISOString()}</span>
					<button
						class="btn-copy {copyFeedback['iso'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(parsedObjectId!.date.toISOString(), 'iso')}
					>
						{copyFeedback['iso'] ? '✓ 已复制' : '📋 复制'}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">创建时间 (本地):</span>
					<span class="data-value">{parsedObjectId.date.toLocaleString()}</span>
					<button
						class="btn-copy {copyFeedback['local'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(parsedObjectId!.date.toLocaleString(), 'local')}
					>
						{copyFeedback['local'] ? '✓ 已复制' : '📋 复制'}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">Unix 时间戳 (秒):</span>
					<span class="data-value">{getUnixTimestamp(parsedObjectId.date, "s")}</span>
					<button
						class="btn-copy {copyFeedback['unix-s'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(getUnixTimestamp(parsedObjectId!.date, "s").toString(), 'unix-s')}
					>
						{copyFeedback['unix-s'] ? '✓ 已复制' : '📋 复制'}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">Unix 时间戳 (毫秒):</span>
					<span class="data-value">{getUnixTimestamp(parsedObjectId.date, "ms")}</span>
					<button
						class="btn-copy {copyFeedback['unix-ms'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(getUnixTimestamp(parsedObjectId!.date, "ms").toString(), 'unix-ms')}
					>
						{copyFeedback['unix-ms'] ? '✓ 已复制' : '📋 复制'}
					</button>
				</div>
				<div class="data-row">
					<span class="data-label">Mongo Shell 格式:</span>
					<span class="data-value font-semibold">{formatForMongoShell(objectIdInput)}</span>
					<button
						class="btn-copy {copyFeedback['mongo'] ? 'btn-copy-success' : ''}"
						onclick={() => copyToClipboard(formatForMongoShell(objectIdInput), 'mongo')}
					>
						{copyFeedback['mongo'] ? '✓ 已复制' : '📋 复制'}
					</button>
				</div>
			</div>
		</div>

		<!-- ObjectId 解析 -->
		<div class="tool-card mb-6 animate-fade-in">
			<div class="flex items-center mb-5">
				<div class="icon-box icon-box-purple">
					<span class="text-lg">🔍</span>
				</div>
				<h2 class="card-title">ObjectId 结构解析</h2>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="data-block">
					<div class="data-block-label">时间戳 (8位十六进制)</div>
					<div class="data-block-value">{parsedObjectId.timestamp}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">机器ID (6位十六进制)</div>
					<div class="data-block-value">{parsedObjectId.machineId}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">进程ID (4位十六进制)</div>
					<div class="data-block-value">{parsedObjectId.processId}</div>
				</div>
				<div class="data-block">
					<div class="data-block-label">计数器 (6位十六进制)</div>
					<div class="data-block-value">{parsedObjectId.counter}</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- 批量验证 -->
	<div class="tool-card mb-6">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-indigo">
				<span class="text-lg">✅</span>
			</div>
			<h2 class="card-title">批量验证</h2>
		</div>
		<p class="text-sm mb-5" style="color: var(--text-secondary);">
			输入多个ObjectId（每行一个）以一次性验证它们。
		</p>
		<div class="space-y-4 mb-5">
			<textarea
				placeholder="输入ObjectId（每行一个）
示例：
507f1f77bcf86cd799439011
507f1f77bcf86cd799439012
invalid_objectid"
				bind:value={batchInput}
				rows="5"
				class="tool-input resize-none"
			></textarea>
			<button class="btn-primary" onclick={handleBatchValidate}>
				验证 ObjectId
			</button>
		</div>

		{#if batchResults.length > 0}
			<div class="space-y-2 animate-fade-in">
				<h3 class="text-base font-semibold mb-3" style="color: var(--text-primary);">
					验证结果
				</h3>
				{#each batchResults as result}
					<div
						class="data-row {result.isValid ? 'state-success' : 'state-error'}"
					>
						<span class="text-lg">{result.isValid ? "✓" : "✗"}</span>
						<span class="data-value font-mono text-sm">{result.objectId}</span>
						{#if result.error}
							<span class="text-sm" style="color: var(--error);">{result.error}</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- 使用说明 -->
	<div class="tool-card">
		<div class="flex items-center mb-5">
			<div class="icon-box icon-box-gray">
				<span class="text-lg">📖</span>
			</div>
			<h2 class="card-title">使用指南</h2>
		</div>
		<div class="space-y-6">
			<div>
				<h3 class="text-base font-semibold mb-3" style="color: var(--text-primary);">
					ObjectId 结构
				</h3>
				<p class="text-sm mb-4" style="color: var(--text-secondary);">
					MongoDB ObjectId 是一个12字节的值，由以下部分组成：
				</p>
				<ul class="space-y-2 text-sm" style="color: var(--text-secondary);">
					<li class="flex items-center">
						<span class="w-24 font-medium">4字节：</span>
						Unix时间戳（秒）
					</li>
					<li class="flex items-center">
						<span class="w-24 font-medium">3字节：</span>
						机器标识符
					</li>
					<li class="flex items-center">
						<span class="w-24 font-medium">2字节：</span>
						进程ID
					</li>
					<li class="flex items-center">
						<span class="w-24 font-medium">3字节：</span>
						计数器
					</li>
				</ul>
			</div>

			<div>
				<h3 class="text-base font-semibold mb-3" style="color: var(--text-primary);">
					使用场景
				</h3>
				<p class="text-sm mb-3" style="color: var(--text-secondary);">
					从时间戳生成ObjectIds用于日期范围查询：
				</p>
				<div class="code-block">
					<code>db.collection.find(&#123; "_id": &#123; "$gt": ObjectId("5272e0f00000000000000000") &#125; &#125;)</code>
				</div>
			</div>
		</div>
	</div>
</div>