<script lang="ts">
  import { onMount } from 'svelte'
  import { translate } from '$lib/i18n/store.svelte'

  const rawPath = '/llm/SKILL.md'
  const publicRawUrl = `https://tools.xcrong.me${rawPath}`

  let skillContent = $state('')
  let loading = $state(true)
  let loadFailed = $state(false)
  let copyFeedback = $state(false)
  let urlCopyFeedback = $state(false)

  async function loadSkill() {
    loading = true
    loadFailed = false

    try {
      const response = await fetch(rawPath)

      if (!response.ok) {
        throw new Error(`Failed to load SKILL.md: ${response.status}`)
      }

      skillContent = await response.text()
    } catch (error) {
      console.error(error)
      loadFailed = true
    } finally {
      loading = false
    }
  }

  async function copySkill() {
    if (!skillContent) {
      return
    }

    try {
      await navigator.clipboard.writeText(skillContent)
      copyFeedback = true
      window.setTimeout(() => (copyFeedback = false), 1500)
    } catch (error) {
      console.error(error)
      alert(translate('llmSkill.errors.copyFailed'))
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicRawUrl)
      urlCopyFeedback = true
      window.setTimeout(() => (urlCopyFeedback = false), 1500)
    } catch (error) {
      console.error(error)
      alert(translate('llmSkill.errors.copyFailed'))
    }
  }

  onMount(() => {
    loadSkill()
  })
</script>

<svelte:head>
  <title>{translate('llmSkill.title')} - {translate('common.title')}</title>
  <meta name="description" content={translate('llmSkill.description')} />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="content-container">
  <div class="page-title">{translate('llmSkill.title')}</div>

  <div class="tool-card skill-card">
    <div class="flex items-center mb-5">
      <div class="icon-box icon-box-cyan">
        <span class="font-mono text-lg text-cyan">AI</span>
      </div>
      <h2 class="card-title">{translate('llmSkill.cardTitle')}</h2>
    </div>

    <p class="skill-description">{translate('llmSkill.description')}</p>

    <div class="skill-status-row">
      <div class="skill-meta">
        <span class="meta-label">{translate('llmSkill.fileLabel')}</span>
        <span class="meta-value">/llm/SKILL.md</span>
      </div>
      <div class="skill-meta">
        <span class="meta-label">{translate('llmSkill.statusLabel')}</span>
        <span class:status-ready={!loading && !loadFailed} class:status-error={loadFailed} class="meta-value">
          {#if loading}
            {translate('llmSkill.status.loading')}
          {:else if loadFailed}
            {translate('llmSkill.status.failed')}
          {:else}
            {translate('llmSkill.status.ready')}
          {/if}
        </span>
      </div>
    </div>

    <label class="meta-label block mb-2" for="skill-url">{translate('llmSkill.urlLabel')}</label>
    <div class="url-row">
      <input
        id="skill-url"
        class="skill-url"
        type="text"
        value={publicRawUrl}
        readonly
        aria-label={translate('llmSkill.urlLabel')}
      />
    </div>

    <div class="action-row">
      <button
        class="btn-primary btn-primary-filled flex-1 min-w-[180px]"
        onclick={copySkill}
        disabled={loading || loadFailed || !skillContent}
      >
        <span class="font-mono">
          {copyFeedback ? `✓ ${translate('common.copied').toUpperCase()}` : translate('llmSkill.actions.copySkill')}
        </span>
      </button>

      <a
        class="btn-secondary flex-1 min-w-[180px] text-center"
        href={rawPath}
        target="_blank"
        rel="noreferrer"
      >
        <span class="font-mono">{translate('llmSkill.actions.openRaw')}</span>
      </a>

      <button class="btn-secondary flex-1 min-w-[180px]" onclick={copyUrl}>
        <span class="font-mono">
          {urlCopyFeedback ? `✓ ${translate('common.copied').toUpperCase()}` : translate('llmSkill.actions.copyUrl')}
        </span>
      </button>
    </div>

    <p class="skill-hint">{translate('llmSkill.hint')}</p>
  </div>
</div>

<style>
  .skill-card {
    max-width: 860px;
  }

  .skill-description {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .skill-status-row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .skill-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 1rem;
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
  }

  .meta-label,
  .meta-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
  }

  .meta-label {
    color: var(--text-muted);
  }

  .meta-value {
    color: var(--text-primary);
    word-break: break-all;
  }

  .status-ready {
    color: var(--neon-green);
  }

  .status-error {
    color: #ff5f7a;
  }

  .url-row {
    margin-bottom: 1.5rem;
  }

  .skill-url {
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    margin-bottom: 1rem;
  }

  .skill-hint {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.7;
  }

  @media (min-width: 720px) {
    .skill-status-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
