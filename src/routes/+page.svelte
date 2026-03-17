<svelte:head>
	<title>开发工具集合</title>
	<meta name="description" content="开发者工具集合 - MongoDB ObjectId转换、时间戳转换、豆包视频下载" />
</svelte:head>

<div class="content-container">
	<div class="page-title">开发工具集合</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
		<!-- MongoDB ObjectId -->
		<a href="/mongo-objectid" class="tool-card group cursor-pointer no-underline block">
			<div class="flex items-center mb-4">
				<div class="icon-box icon-box-blue">
					<span class="text-xl">🔗</span>
				</div>
				<h2 class="card-title">MongoDB ObjectId</h2>
			</div>
			<p class="text-sm leading-relaxed mb-5" style="color: var(--text-secondary);">
				在 MongoDB ObjectId 和时间戳之间转换，支持批量验证和解析
			</p>
			<div class="flex items-center text-sm font-medium transition-colors duration-200" style="color: var(--primary);">
				<span>进入工具</span>
				<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</a>

		<!-- 时间戳转换 -->
		<a href="/timestamp" class="tool-card group cursor-pointer no-underline block">
			<div class="flex items-center mb-4">
				<div class="icon-box icon-box-green">
					<span class="text-xl">⏰</span>
				</div>
				<h2 class="card-title">时间戳转换</h2>
			</div>
			<p class="text-sm leading-relaxed mb-5" style="color: var(--text-secondary);">
				各种精度的时间戳和人类可读时间格式转换
			</p>
			<div class="flex items-center text-sm font-medium transition-colors duration-200" style="color: var(--primary);">
				<span>进入工具</span>
				<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</a>

		<!-- 豆包视频下载 -->
		<a href="/doubao-video" class="tool-card group cursor-pointer no-underline block">
			<div class="flex items-center mb-4">
				<div class="icon-box icon-box-purple">
					<span class="text-xl">🎬</span>
				</div>
				<h2 class="card-title">豆包视频下载</h2>
			</div>
			<p class="text-sm leading-relaxed mb-5" style="color: var(--text-secondary);">
				从豆包视频分享链接获取高清下载地址
			</p>
			<div class="flex items-center text-sm font-medium transition-colors duration-200" style="color: var(--primary);">
				<span>进入工具</span>
				<svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</a>
	</div>
</div>