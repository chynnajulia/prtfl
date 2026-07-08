<script lang="ts">
  import { onMount } from "svelte";
  import { TextScramble } from "$lib/TextScramble";

  let headingEl:  HTMLElement;
  let tickerEl:   HTMLElement;

  // ── Ticker messages ────────────────────────────────────────
  // Styled like a real service disruption board.
  // Cycles through automatically.
  const tickerMessages = [
    "SERVICE DISRUPTION ON ALL LINES · ESTIMATED RESUMPTION: SOON™",
    "PLATFORM UNDER CONSTRUCTION · THANK YOU FOR YOUR PATIENCE",
    "SIGNAL FAILURE BETWEEN INK AND INTERFACE · ENGINEERS ON SITE",
    "THIS STATION IS BEING UPGRADED · NEW ROUTES COMING SOON",
    "DELAYED: PERFECTING THE DETAILS · WE APOLOGIZE FOR THE WAIT",
  ];

  let tickerIndex   = 0;
  let tickerVisible = true;

  // ── Heading scramble phrases ───────────────────────────────
  const headingPhrases = [
    "UNDER CONSTRUCTION.",
    "SIGNAL FAILURE.",
    "STAND BY.",
    "UNDER CONSTRUCTION.",
  ];

  onMount(() => {
    // ── Heading scramble ──
    let fxCleanup = () => {};
    if (headingEl) {
      const fx = new TextScramble(headingEl);
      let i = 0;
      const next = () => {
        fx.setText(headingPhrases[i]).then(() => {
          i = (i + 1) % headingPhrases.length;
          // Pause longer on "UNDER CONSTRUCTION" so it reads clearly
          const pause = headingPhrases[i - 1] === "UNDER CONSTRUCTION."
            ? 3000 : 1200;
          setTimeout(next, pause);
        });
      };
      next();
      fxCleanup = () => fx.destroy();
    }

    // ── Ticker cycling ──
    // Fades out, swaps message, fades in
    const tickerInterval = setInterval(() => {
      tickerVisible = false;
      setTimeout(() => {
        tickerIndex   = (tickerIndex + 1) % tickerMessages.length;
        tickerVisible = true;
      }, 400);
    }, 4000);

    return () => {
      fxCleanup();
      clearInterval(tickerInterval);
    };
  });
</script>

<svelte:head>
  <title>Under Construction — Chynna Julia</title>
</svelte:head>

<div class="construction-page">

  <!-- Station closed badge -->
  <div class="station-badge" aria-hidden="true">
    <span class="badge-dot"></span>
    <span class="badge-label font-pixel">STATION CLOSED</span>
  </div>

  <!-- Main heading — TextScramble target -->
  <h1
    class="construction-heading glitch-text"
    bind:this={headingEl}
    aria-label="Under Construction"
  >UNDER CONSTRUCTION.</h1>

  <!-- Subtext -->
  <div class="construction-body">
    <p>
      Something is being built at this station.<br />
      The trains will run again soon.
    </p>
    <p class="construction-sub">
      In the meantime, you can reach the conductor at
      <a href="mailto:chynnajulia@gmail.com">chynnajulia@gmail.com</a>
      or on <a href="https://twitter.com/_chynnajulia" target="_blank" rel="noopener noreferrer">@_chynnajulia</a>.
    </p>
  </div>

  <!-- Train line decoration -->
  <div class="line-decoration" aria-hidden="true">
    <div class="line-track">
      <div class="line-node node--active"></div>
      <div class="line-segment line-segment--dashed"></div>
      <div class="line-node node--ghost"></div>
    </div>
    <div class="line-labels">
      <span class="line-label">NOW</span>
      <span class="line-label line-label--faint">SOON</span>
    </div>
  </div>

  <!-- Service disruption ticker -->
  <div class="ticker-wrap" aria-live="polite">
    <span class="ticker-icon font-pixel" aria-hidden="true">⚠</span>
    <span
      class="ticker-text"
      class:visible={tickerVisible}
      bind:this={tickerEl}
    >{tickerMessages[tickerIndex]}</span>
  </div>

</div>

<style>
  .construction-page {
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

  /* ── Station badge ── */
  .station-badge {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border-dashed);
    border-radius: var(--radius-pill);
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(8px);
  }

  .badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--color-accent);
    /* Pulse animation — like a live status indicator */
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%, 100% { opacity: 1;   transform: scale(1);    }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }

  .badge-label {
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
  }

  /* ── Heading ── */
  .construction-heading {
    font-size: var(--text-massive);
    font-weight: 800;
    letter-spacing: var(--tracking-tight);
    color: var(--color-ink);
    line-height: var(--leading-tight);
    min-height: 1.1em; /* prevents layout shift during scramble */
    margin: 0;
  }

  /* ── Body text ── */
  .construction-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 480px;
  }

  .construction-body p {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-ink-soft);
    line-height: var(--leading-relaxed);
  }

  .construction-sub {
    font-size: var(--text-xs) !important;
    color: var(--color-ink-faint) !important;
  }

  .construction-body a {
    color: var(--color-accent);
    text-decoration: none;
    transition: opacity var(--transition-fast);
  }
  .construction-body a:hover { opacity: 0.7; }

  /* ── Train line decoration ── */
  /* A mini vertical train line showing "now" and "soon" stations */
  .line-decoration {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .line-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .line-node {
    width: 10px; height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .node--active {
    background: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(121,48,255,0.15);
    animation: node-pulse 2.5s ease-in-out infinite;
  }

  @keyframes node-pulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(121,48,255,0.15); }
    50%       { box-shadow: 0 0 0 6px rgba(121,48,255,0.06); }
  }

  .node--ghost {
    background: transparent;
    border: 1.5px dashed var(--color-border-dashed);
  }

  .line-segment--dashed {
    width: 1.5px;
    height: 40px;
    /* Dashed via repeating gradient — CSS borders can't be dashed vertically */
    background: repeating-linear-gradient(
      to bottom,
      var(--color-border-dashed) 0px,
      var(--color-border-dashed) 4px,
      transparent 4px,
      transparent 8px
    );
  }

  .line-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 60px;
    padding: 0;
  }

  .line-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    line-height: 1;
  }

  .line-label--faint { opacity: 0.4; }

  /* ── Service disruption ticker ── */
  .ticker-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(8px);
    border: 1px dashed var(--color-border-dashed);
    border-radius: var(--radius-sm);
    width: 100%;
    max-width: 600px;
  }

  .ticker-icon {
    font-size: 11px;
    color: var(--color-accent);
    flex-shrink: 0;
    animation: badge-pulse 1.5s ease-in-out infinite;
  }

  .ticker-text {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wider);
    color: var(--color-ink-faint);
    /* Fade transition between messages */
    opacity: 0;
    transition: opacity 0.4s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ticker-text.visible { opacity: 1; }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .construction-page { padding: 5rem var(--space-6) var(--space-8); }
    .construction-heading { font-size: var(--text-3xl); }
    .ticker-text { font-size: calc(var(--text-xs) * 0.85); }
  }
</style>