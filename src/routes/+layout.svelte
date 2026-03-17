<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import "./app.css";
	import Sidebar from "$lib/components/Sidebar.svelte";

	let { children } = $props();
	let theme = $state("dark");
	let mounted = $state(false);
	let sidebarOpen = $state(false);

	onMount(() => {
		mounted = true;
		const saved = localStorage.getItem("theme");
		if (saved) {
			theme = saved;
		}
		// 桌面端默认展开侧边栏
		if (window.innerWidth >= 1024) {
			sidebarOpen = true;
		}
	});

	$effect(() => {
		if (mounted) {
			if (theme === "light") {
				document.documentElement.classList.add("light");
			} else {
				document.documentElement.classList.remove("light");
			}
			localStorage.setItem("theme", theme);
		}
	});

	function toggleTheme() {
		theme = theme === "dark" ? "light" : "dark";
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<!-- 侧边栏 -->
<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

<!-- 全局背景 -->
<div class="min-h-screen bg-primary" class:sidebar-open={sidebarOpen}>
	<!-- 顶部导航栏 - 简化版 -->
	<nav class="navbar">
		<div class="navbar-content">
			<!-- 左侧：汉堡菜单 + Logo -->
			<div class="flex items-center gap-3">
				<button
					onclick={toggleSidebar}
					class="sidebar-toggle"
					aria-label="切换侧边栏"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
				<a href="/" class="logo">
					<span class="logo-bracket">[</span>
					<span class="logo-text">tools.xcrong.me</span>
					<span class="logo-bracket">]</span>
				</a>
			</div>

			<!-- 右侧：主题切换 -->
			<button
				onclick={toggleTheme}
				class="theme-btn"
				aria-label="切换主题"
			>
				{#if theme === 'dark'}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>

	<!-- 主要内容区域 -->
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	/* 导航栏 */
	.navbar {
		position: sticky;
		top: 0;
		z-index: 30;
		background: rgba(10, 10, 15, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border-primary);
		height: 56px;
	}

	.navbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		padding: 0 1rem;
	}

	@media (min-width: 1024px) {
		.navbar-content {
			padding: 0 1.5rem;
		}
	}

	/* 侧边栏切换按钮 */
	.sidebar-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 6px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.sidebar-toggle:hover {
		color: var(--neon-cyan);
		border-color: var(--neon-cyan);
	}



	/* Logo */
	.logo {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1rem;
		font-weight: 700;
		text-decoration: none;
		letter-spacing: -0.02em;
		display: none;
	}

	@media (min-width: 640px) {
		.logo {
			display: block;
		}
	}

	.logo-bracket {
		color: var(--text-muted);
	}

	.logo-text {
		color: var(--text-primary);
	}

	/* 主题切换按钮 */
	.theme-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 6px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.theme-btn:hover {
		color: var(--neon-cyan);
		border-color: var(--neon-cyan);
		box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
	}

	/* 主内容区域 */
	.main-content {
		min-height: calc(100vh - 56px);
		transition: margin-left 0.3s ease;
	}

	/* 桌面端侧边栏展开时，主内容向右偏移 */
	@media (min-width: 1024px) {
		.main-content {
			margin-left: 260px;
		}
	}
</style>
