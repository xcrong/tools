<script lang="ts">
	import { page } from "$app/stores";
	
	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}
	
	let { isOpen, onClose }: Props = $props();
	
	// 工具分类数据
	const categories = [
		{
			name: "DATABASE",
			items: [
				{ href: "/mongo-objectid", label: "MongoDB ObjectId", icon: "#" },
			]
		},
		{
			name: "TIME",
			items: [
				{ href: "/timestamp", label: "Timestamp", icon: "◷" },
			]
		},
		{
			name: "MEDIA",
			items: [
				{ href: "/doubao-video", label: "豆包视频下载", icon: "▶" },
			]
		},
		{
			name: "GENERATOR",
			items: [
				{ href: "/term2svg", label: "term2svg", icon: "◇" },
			]
		}
	];
	
	// 主页特殊处理
	const homeItem = { href: "/", label: "Home", icon: "⌂" };
	
	function handleItemClick() {
		// 移动端点击后自动关闭
		if (window.innerWidth < 1024) {
			onClose();
		}
	}
</script>

<!-- 侧边栏遮罩（移动端） -->
{#if isOpen}
	<div 
		class="sidebar-overlay"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="关闭侧边栏"
	></div>
{/if}

<!-- 侧边栏 -->
<aside class="sidebar" class:open={isOpen}>
	<!-- 侧边栏头部 -->
	<div class="sidebar-header">
		<div class="logo">
			<span class="logo-bracket">[</span>
			<span class="logo-text">TOOLS</span>
			<span class="logo-bracket">]</span>
		</div>
		<button class="close-btn" onclick={onClose} aria-label="关闭">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	
	<!-- 工具列表 -->
	<nav class="sidebar-nav">
		<!-- 主页 -->
		<a 
			href={homeItem.href} 
			class="nav-item"
			class:active={$page.url.pathname === homeItem.href}
			onclick={handleItemClick}
		>
			<span class="nav-icon">{homeItem.icon}</span>
			<span class="nav-label">{homeItem.label}</span>
		</a>
		
		<div class="nav-divider"></div>
		
		<!-- 分类工具 -->
		{#each categories as category}
			<div class="category">
				<div class="category-name">{category.name}</div>
				{#each category.items as item}
					<a 
						href={item.href} 
						class="nav-item"
						class:active={$page.url.pathname === item.href}
						onclick={handleItemClick}
					>
						<span class="nav-icon">{item.icon}</span>
						<span class="nav-label">{item.label}</span>
					</a>
				{/each}
			</div>
		{/each}
	</nav>
	
	<!-- 侧边栏底部 -->
	<div class="sidebar-footer">
		<div class="footer-line">
			<span class="footer-dot"></span>
			<span class="footer-text">04 tools loaded</span>
		</div>
	</div>
</aside>

<style>
	/* 遮罩层 */
	.sidebar-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		z-index: 40;
	}
	
	@media (min-width: 1024px) {
		.sidebar-overlay {
			display: none;
		}
	}
	
	/* 侧边栏 */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 260px;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border-primary);
		z-index: 50;
		display: flex;
		flex-direction: column;
		transform: translateX(-100%);
		transition: transform 0.3s ease;
	}
	
	.sidebar.open {
		transform: translateX(0);
	}
	
	@media (min-width: 1024px) {
		.sidebar {
			transform: translateX(0);
			position: fixed;
		}
	}
	
	/* 侧边栏头部 */
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border-primary);
	}
	
	.logo {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	
	.logo-bracket {
		color: var(--text-muted);
	}
	
	.logo-text {
		color: var(--neon-cyan);
		text-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
	}
	
	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: transparent;
		border: 1px solid var(--border-primary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		border-color: var(--neon-cyan);
		color: var(--neon-cyan);
	}
	
	@media (min-width: 1024px) {
		.close-btn {
			display: none;
		}
	}
	
	/* 导航区域 */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0.75rem;
	}
	
	/* 导航项 */
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		border-radius: 6px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		text-decoration: none;
		transition: all 0.15s ease;
		margin-bottom: 0.25rem;
		border: 1px solid transparent;
	}
	
	.nav-item:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}
	
	.nav-item.active {
		background: rgba(0, 245, 255, 0.08);
		border-color: rgba(0, 245, 255, 0.3);
		color: var(--neon-cyan);
	}
	
	.nav-icon {
		font-size: 1rem;
		width: 20px;
		text-align: center;
		opacity: 0.7;
	}
	
	.nav-item.active .nav-icon {
		opacity: 1;
	}
	
	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	/* 分隔线 */
	.nav-divider {
		height: 1px;
		background: var(--border-primary);
		margin: 0.75rem 0.5rem;
	}
	
	/* 分类 */
	.category {
		margin-bottom: 1rem;
	}
	
	.category-name {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		padding: 0.5rem 0.875rem;
		letter-spacing: 0.05em;
	}
	
	/* 侧边栏底部 */
	.sidebar-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--border-primary);
	}
	
	.footer-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	
	.footer-dot {
		width: 6px;
		height: 6px;
		background: var(--neon-green);
		border-radius: 50%;
		box-shadow: 0 0 6px var(--neon-green);
	}
</style>
