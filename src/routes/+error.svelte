<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { TextScramble } from "$lib/TextScramble";

  let headingEl: HTMLElement;

  // Only show the train metaphor for 404s.
  // Other errors (500 etc) get a more neutral message.
  $: is404 = $page.status === 404;

  const phrases404 = [
    "WRONG STATION.",
    "DESTINATION: UNKNOWN.",
    "ERR · 404.",
    "WRONG STATION.",
  ];

  onMount(() => {
    if (!headingEl) return;
    const fx = new TextScramble(headingEl);
    let i = 0;
    const next = () => {
      fx.setText(is404 ? phrases404[i] : `ERR · ${$page.status}.`).then(() => {
        i = (i + 1) % phrases404.length;
        setTimeout(next, i === 0 ? 3000 : 1200);
      });
    };
    next();
    return () => fx.destroy();
  });
</script>

<svelte:head>
  <title>{$page.status} — Chynna Julia</title>
</svelte:head>

<div class="error-page">

  <!-- Status badge -->
  <div class="error-badge" aria-hidden="true">
    <span class="badge-label font-pixel">
      {is404 ? "DESTINATION NOT FOUND" : "SERVICE ERROR"}
    </span>
  </div>

  <!-- Heading -->
  <h1
    class="error-heading glitch-text"
    bind:this={headingEl}
    aria-label={is404 ? "Wrong station" : `Error ${$page.status}`}
  >{is404 ? "WRONG STATION." : `ERR · ${$page.status}.`}</h1>

  <!-- Body -->
  <div class="error-body">
    {#if is404}
      <p>
        This destination doesn't exist on the current line.<br />
        The route you requested could not be found.
      </p>
    {:else}
      <p>
        A signal failure has occurred on this line.<br />
        Our engineers have been notified.
      </p>
    {/if}
  </div>

  <!-- Dead-end train line -->
  <div class="deadend" aria-hidden="true">
    <div class="deadend-track">
      <div class="deadend-node"></div>
      <div class="deadend-segment"></div>
      <!-- Buffer stop — the physical end-of-line marker -->
      <div class="deadend-buffer">
        <div class="buffer-bar"></div>
      </div>
    </div>
    <div class="deadend-label font-pixel">END OF LINE</div>
  </div>

  <!-- Return home -->
  <a href="/" class="return-btn">
    ← RETURN TO LAST KNOWN STATION
  </a>

</div>

<style>
  .error-page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 6rem var(--space-12) var(--space-12);
    gap: var(--space-8);
    max-width: 1200px;
    margin: 0 auto;
  }

  /* ── Badge ── */
  .error-badge {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border-dashed);
    border-radius: var(--radius-pill);
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(8px);
  }

  .badge-label {
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
  }

  /* ── Heading ── */
  .error-heading {
    font-size: var(--text-massive);
    font-weight: 800;
    letter-spacing: var(--tracking-tight);
    color: var(--color-ink);
    line-height: var(--leading-tight);
    min-height: 1.1em;
    margin: 0;
  }

  /* ── Body ── */
  .error-body p {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-ink-soft);
    line-height: var(--leading-relaxed);
    max-width: 420px;
  }

  /* ── Dead-end track ── */
  .deadend {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .deadend-track {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .deadend-node {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--color-accent);
    opacity: 0.5;
  }

  .deadend-segment {
    width: 1.5px;
    height: 30px;
    background: var(--color-border-dashed);
  }

  /* Buffer stop: two horizontal bars — the real transit symbol for
     end of line, like the bumpers at a terminal station */
  .deadend-buffer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .buffer-bar {
    width: 18px;
    height: 2.5px;
    background: var(--color-ink-faint);
    border-radius: 2px;
  }

  .deadend-label {
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    writing-mode: vertical-lr; /* rotated 90° like a station sign */
    transform: rotate(180deg);
    opacity: 0.5;
  }

  /* ── Return button ── */
  .return-btn {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-accent);
    text-decoration: none;
    padding: var(--space-3) var(--space-5);
    border: 1.5px solid var(--color-accent);
    border-radius: var(--radius-sm);
    transition:
      background var(--transition-fast),
      color     var(--transition-fast);
  }

  .return-btn:hover {
    background: var(--color-accent);
    color: white;
    opacity: 1;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .error-page    { padding: 5rem var(--space-6) var(--space-8); }
    .error-heading { font-size: var(--text-3xl); }
  }
</style>