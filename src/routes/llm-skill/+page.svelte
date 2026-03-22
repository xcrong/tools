<script lang="ts">
  import { onMount } from 'svelte'
  import { translate } from '$lib/i18n/store.svelte'

  interface SkillOption {
    id: 'doubao-video' | 'term2svg'
    nameKey: string
    descriptionKey: string
    icon: string
    rawPath: string
  }

  const siteUrl = 'https://tools.xcrong.me'
  const skillOptions: SkillOption[] = [
    {
      id: 'doubao-video',
      nameKey: 'llmSkill.skills.doubaoVideo.name',
      descriptionKey: 'llmSkill.skills.doubaoVideo.description',
      icon: '▶',
      rawPath: '/llm/doubao-video/SKILL.md',
    },
    {
      id: 'term2svg',
      nameKey: 'llmSkill.skills.term2svg.name',
      descriptionKey: 'llmSkill.skills.term2svg.description',
      icon: '$',
      rawPath: '/llm/term2svg/SKILL.md',
    },
  ]

  let selectedSkillId = $state<SkillOption['id']>('doubao-video')
  let loading = $state(true)
  let loadFailed = $state(false)
  let copyFeedback = $state(false)
  let urlCopyFeedback = $state(false)

  const selectedSkill = $derived(
    skillOptions.find((skill) => skill.id === selectedSkillId) ?? skillOptions[0],
  )
  const publicRawUrl = $derived(`${siteUrl}${selectedSkill.rawPath}`)
  const copyText = $derived(`READ THIS SKILL.md: ${publicRawUrl}`)

  async function verifySkill() {
    loading = true
    loadFailed = false

    try {
      const response = await fetch(selectedSkill.rawPath, { method: 'HEAD' })

      if (!response.ok) {
        throw new Error(`Failed to load SKILL.md: ${response.status}`)
      }
    } catch (error) {
      console.error(error)
      loadFailed = true
    } finally {
      loading = false
    }
  }

  function selectSkill(id: SkillOption['id']) {
    if (selectedSkillId === id) {
      return
    }

    selectedSkillId = id
    copyFeedback = false
    urlCopyFeedback = false
    verifySkill()
  }

  async function copySkillInstruction() {
    try {
      await navigator.clipboard.writeText(copyText)
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
    verifySkill()
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

    <div class="selector-grid">
      {#each skillOptions as skill}
        <button
          class:selected={skill.id === selectedSkill.id}
          class="selector-card"
          onclick={() => selectSkill(skill.id)}
        >
          <div class="selector-head">
            <span class="selector-icon">{skill.icon}</span>
            <span class="selector-name">{translate(skill.nameKey)}</span>
          </div>
          <p class="selector-description">{translate(skill.descriptionKey)}</p>
        </button>
      {/each}
    </div>

    <div class="skill-status-row">
      <div class="skill-meta">
        <span class="meta-label">{translate('llmSkill.fileLabel')}</span>
        <span class="meta-value">{selectedSkill.rawPath}</span>
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

    <label class="meta-label block mb-2" for="skill-copy-text">{translate('llmSkill.copyTextLabel')}</label>
    <div class="url-row">
      <textarea
        id="skill-copy-text"
        class="skill-copy-text"
        readonly
        value={copyText}
        aria-label={translate('llmSkill.copyTextLabel')}
      ></textarea>
    </div>

    <div class="action-row">
      <button
        class="btn-primary btn-primary-filled flex-1 min-w-[180px]"
        onclick={copySkillInstruction}
        disabled={loading || loadFailed}
      >
        <span class="font-mono">
          {copyFeedback ? `✓ ${translate('common.copied').toUpperCase()}` : translate('llmSkill.actions.copySkill')}
        </span>
      </button>

      <a
        class="btn-secondary flex-1 min-w-[180px] text-center"
        href={selectedSkill.rawPath}
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
    max-width: 920px;
  }

  .skill-description {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .selector-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .selector-card {
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid var(--border-primary);
    background: rgba(255, 255, 255, 0.02);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .selector-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-1px);
  }

  .selector-card.selected {
    border-color: rgba(0, 245, 255, 0.45);
    background: rgba(0, 245, 255, 0.06);
    box-shadow: 0 0 24px rgba(0, 245, 255, 0.08);
  }

  .selector-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }

  .selector-icon,
  .selector-name {
    font-family: 'JetBrains Mono', monospace;
  }

  .selector-icon {
    color: var(--neon-cyan);
    font-size: 1rem;
    width: 1rem;
    text-align: center;
  }

  .selector-name {
    color: var(--text-primary);
    font-size: 0.95rem;
    font-weight: 700;
  }

  .selector-description {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.92rem;
    line-height: 1.7;
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

  .skill-url,
  .skill-copy-text {
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
  }

  .skill-copy-text {
    min-height: 78px;
    resize: vertical;
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
    .selector-grid,
    .skill-status-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
