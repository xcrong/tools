<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import "./app.css";

	let { children } = $props();
	let theme = $state("light");
	let mobileMenuOpen = $state(false);

	onMount(() => {
		const saved = localStorage.getItem("theme");
		if (saved) {
			theme = saved;
		} else {
			theme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
	});

	$effect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		localStorage.setItem("theme", theme);
	});

	function toggleTheme() {
		theme = theme === "light" ? "dark" : "light";
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	const navItems = [
		{ href: "/", label: "主页" },
		{ href: "/mongo-objectid", label: "ObjectId" },
		{ href: "/timestamp", label: "时间戳" },
		{ href: "/doubao-video", label: "视频下载" },
	];
</script>

<!-- 全局背景 -->
<div class="min-h-screen transition-theme" style="background: var(--surface-base);">
	<!-- 导航栏 -->
	<nav
		class="sticky top-0 z-10 border-b transition-theme"
		style="background: var(--surface-card); border-color: var(--border);"
	>
		<div class="max-w-7xl mx-auto px-4 md:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<a
					href="/"
					class="text-lg font-bold no-underline transition-colors duration-200"
					style="color: var(--text-primary);"
				>
					<span class="mr-2">🛠️</span>
					开发工具集合
				</a>

				<!-- 导航链接 + 主题切换 -->
				<div class="flex items-center gap-1">
					<ul class="hidden sm:flex items-center list-none m-0 p-0 gap-1">
						{#each navItems as item}
							<li>
								<a
									href={item.href}
									class="block px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200"
									class:active-nav={$page.url.pathname === item.href}
									style="color: var(--text-secondary);"
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>

					<!-- 主题切换按钮 -->
					<button
						onclick={toggleTheme}
						class="ml-2 p-2 rounded-lg transition-all duration-200 hover:scale-105"
						style="background: var(--surface-muted); color: var(--text-secondary);"
						aria-label="切换主题"
					>
						{#if theme === 'light'}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						{/if}
					</button>

					<!-- 移动端菜单按钮 -->
					<button
						class="sm:hidden ml-2 p-2 rounded-lg transition-all duration-200"
						style="background: var(--surface-muted); color: var(--text-secondary);"
						onclick={toggleMobileMenu}
						aria-label="菜单"
					>
						{#if mobileMenuOpen}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- 移动端菜单 -->
			{#if mobileMenuOpen}
				<ul class="sm:hidden list-none m-0 p-0 pb-4 space-y-1 animate-fade-in">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="block px-4 py-3 rounded-lg text-sm font-medium no-underline transition-all duration-200"
								class:active-nav={$page.url.pathname === item.href}
								style="color: var(--text-secondary);"
								onclick={closeMobileMenu}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</nav>

	<!-- 主要内容区域 -->
	<main class="min-h-[calc(100vh-64px)]">
		{@render children()}
	</main>
</div>

<style>
	.active-nav {
		background: var(--primary-bg) !important;
		color: var(--primary) !important;
	}

	a:hover:not(.active-nav) {
		background: var(--surface-muted);
	}
</style>
