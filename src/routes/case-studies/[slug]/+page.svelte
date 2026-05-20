<script lang="ts">
  import { onMount } from "svelte";
  import { TextScramble } from "$lib/TextScramble";

  export let data;
  const { meta, body } = data;

  let titleEl:      HTMLElement;
  let docketEl:     HTMLElement;
  let fullStoryEl:  HTMLElement;

  // Tracks which section is active
  let atFullStory = false;

  function goToFullStory() {
    atFullStory = true;
  }

  function backToDocket() {
    atFullStory = false;
    // Also reset the full story scroll to top
    fullStoryEl?.scrollTo({ top: 0, behavior: "smooth" });
  }

  onMount(() => {
    // TextScramble on title
    let cleanup = () => {};
    if (titleEl && meta.title) {
      const fx = new TextScramble(titleEl);
      fx.setText(meta.title);
      cleanup = () => fx.destroy();
    }

    // ── Wheel: detect extra scroll past docket bottom ──
    // A small threshold (60px) is enough because the real
    // resistance came from scrolling through the docket content.
    const THRESHOLD = 60;
    let accumulated = 0;

    function handleWheel(e: WheelEvent) {
      if (atFullStory) {
        // In full story: detect scroll up past the top
        const atTop = fullStoryEl.scrollTop <= 0;
        if (atTop && e.deltaY < 0) {
          e.preventDefault();
          accumulated += Math.abs(e.deltaY);
          if (accumulated >= THRESHOLD) {
            accumulated = 0;
            backToDocket();
          }
        } else {
          accumulated = 0;
        }
        return;
      }

      // In docket: detect scroll down past the bottom
      const atBottom =
        docketEl.scrollTop + docketEl.clientHeight >= docketEl.scrollHeight - 8;

      if (atBottom && e.deltaY > 0) {
        e.preventDefault();
        accumulated += e.deltaY;
        if (accumulated >= THRESHOLD) {
          accumulated = 0;
          goToFullStory();
        }
      } else {
        accumulated = 0;
      }
    }

    // ── Touch: swipe past section boundary ──
    let touchStartY      = 0;
    let touchStartScroll = 0;

    function onTouchStart(e: TouchEvent) {
      touchStartY      = e.touches[0].clientY;
      touchStartScroll = atFullStory
        ? fullStoryEl.scrollTop
        : docketEl.scrollTop;
    }

    function onTouchEnd(e: TouchEvent) {
      const dy = touchStartY - e.changedTouches[0].clientY;

      if (!atFullStory) {
        const atBottom =
          docketEl.scrollTop + docketEl.clientHeight >= docketEl.scrollHeight - 8;
        if (atBottom && dy > 60) goToFullStory();
      } else {
        const atTop = fullStoryEl.scrollTop <= 0;
        if (atTop && dy < -60) backToDocket();
      }
    }

    // Attach to the outer viewport (not the inner sections)
    window.addEventListener("wheel",      handleWheel,  { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });

    return () => {
      cleanup();
      window.removeEventListener("wheel",      handleWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  });
</script>

<svelte:head>
  <title>{meta.title ?? "Case Study"} — Chynna Julia</title>
</svelte:head>

<div class="paper-overlay" aria-hidden="true"></div>
<!-- ── Two-section scroll layout ── -->
<div class="case-viewport">

    <!-- Sliding wrapper: moves up by 100dvh when atFullStory -->
  <div class="sections-wrapper" class:at-story={atFullStory}>


    <!-- ══════════════════════════════════════════════
        SECTION 1: THE DOCKET
        Visual summary — designed to be absorbed fast.
        Recruiter scans this before deciding to read on.
    ════════════════════════════════════════════════ -->
    <section class="case-section" bind:this={docketEl}>
      <div class="docket-inner">

        <!-- Back link — styled like a ticket stub -->
        <a href="/" class="back-link" aria-label="Back to portfolio">
          ← RETURN TO PORTFOLIO
        </a>

        <!-- Masthead -->
        <div class="masthead">
          <p class="masthead-label">THE DOCKET</p>
          <h1 class="project-name" bind:this={titleEl}>{meta.title ?? ""}</h1>
          <div class="masthead-rule" aria-hidden="true"></div>
        </div>

        <!-- Metadata row — waybill style -->
        <div class="meta-grid">
          <div class="meta-cell">
            <p class="meta-label">REF</p>
            <p class="meta-value">{meta.slug?.toUpperCase().replace(/-/g, " · ")}</p>
          </div>
          <div class="meta-cell">
            <p class="meta-label">TYPE</p>
            <p class="meta-value">{meta.type ?? "UX"}</p>
          </div>
          <div class="meta-cell">
            <p class="meta-label">ROLE</p>
            <p class="meta-value">{meta.role ?? "—"}</p>
          </div>
          <div class="meta-cell">
            <p class="meta-label">ISSUED</p>
            <p class="meta-value">{meta.year ?? "—"}</p>
          </div>
        </div>

        <!-- Hero image -->
        {#if meta.image}
          <div class="hero-image-wrap">
            <!-- Dithered shown by default; HD fades in on hover -->
            {#if meta.imageDithered}
              <img
                class="hero-img hero-img--dithered"
                src={meta.imageDithered}
                alt=""
                aria-hidden="true"
              />
            {/if}
            <img
              class="hero-img hero-img--hd"
              src={meta.image}
              alt={meta.title}
            />
          </div>
        {/if}

        <!-- Brief -->
        <p class="docket-brief">{meta.description ?? ""}</p>

        <!-- Read full story CTA -->
        <button class="read-more-btn" onclick={goToFullStory}>
          READ THE FULL STORY ↓
        </button>

      </div>
    </section>

    <!-- ══════════════════════════════════════════════
        SECTION 2: THE FULL STORY
        In-depth case study rendered from markdown.
        Clean, content-forward, nothing competing
        with the actual process work.
    ════════════════════════════════════════════════ -->
    <section class="case-section" bind:this={fullStoryEl}>
      <div class="story-inner">

        <!-- Top navigation -->
        <div class="story-nav">
          <button class="story-back-btn" onclick={backToDocket}>
            ↑ BACK TO DOCKET
          </button>
          <span class="story-ref" aria-hidden="true">
            {meta.slug?.toUpperCase().replace(/-/g, " · ")}
          </span>
        </div>

        <!-- Rendered markdown body -->
        <!-- {@html} is safe here because the content comes from
            your own markdown files, not user input -->
        <article class="story-body">
          {@html body}
        </article>

        <!-- Bottom navigation -->
        <div class="story-footer">
          <button class="story-back-btn" onclick={backToDocket}>
            ↑ BACK TO DOCKET
          </button>
          <a href="/" class="back-link">← RETURN TO PORTFOLIO</a>
        </div>

      </div>
    </section>


  </div>
</div>

<style>

  .paper-overlay {
    position: fixed;
    inset: 0;
    /* Warm off-white — feels like paper, not clinical white */
    background: rgba(250, 248, 245, 0.93);
    z-index: -8; /* above ThreeBG layers (-30, -20, -10), below content */
    pointer-events: none;
  }
  

  /* ── Outer viewport: fixed, clips everything ── */
  .case-viewport {
    height: 100dvh;
    overflow: hidden; /* parent never scrolls — sections do */
    position: relative;
  }

  /* ── Sliding wrapper ── */
  /* Contains both sections stacked vertically.
    Slides up by 100dvh to reveal the full story section.
    The cubic-bezier gives it a heavy, deliberate feel —
    like a heavy page turning rather than a quick snap. */
  .sections-wrapper {
    display: flex;
    flex-direction: column;
    transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1);
    height: 200dvh; /* tall enough to hold both sections */
  }

  .sections-wrapper.at-story {
    transform: translateY(-100dvh);
  }

  /* ── Each section: fills viewport, scrolls internally ── */
  .case-section {
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .case-section::-webkit-scrollbar { display: none; }







  /* ══════════════════════════
     DOCKET SECTION
  ══════════════════════════ */

  .docket-inner {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    padding: 6rem 2rem 4rem;
  }

  /* Back link — ticket stub aesthetic */
  .back-link {
    display: inline-block;
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(0,0,0,0.35);
    text-decoration: none;
    margin-bottom: 2.5rem;
    transition: color 0.2s, opacity 0.2s;
  }
  .back-link:hover { color: #7930ff; }

  /* ── Masthead ── */
  .masthead {
    margin-bottom: 2rem;
  }

  .masthead-label {
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: rgba(0,0,0,0.28);
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .project-name {
    /* Big, typographic, ink-heavy — the newspaper front page energy */
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: #1a1a1a;
    margin-bottom: 1.25rem;
    /* min-height prevents layout shift during TextScramble */
    min-height: 1.1em;
  }

  /* Thick editorial rule below title, like a newspaper section divider */
  .masthead-rule {
    height: 3px;
    background: linear-gradient(to right, #1a1a1a 60%, transparent 100%);
    border-radius: 2px;
  }

  /* ── Metadata grid ── */
  /* Waybill-style: four fields in a horizontal row */
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin: 1.5rem 0 2rem;
    padding: 1.25rem 1.5rem;
    border: 1px dashed rgba(0,0,0,0.12);
    border-radius: 6px;
  }

  @media (max-width: 600px) {
    .meta-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .meta-label {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: rgba(0,0,0,0.28);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .meta-value {
    font-family: monospace;
    font-size: 12px;
    color: #1a1a1a;
    letter-spacing: 0.06em;
  }

  /* ── Hero image ── */
  .hero-image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .hero-img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: opacity 0.5s ease;
    display: block;
  }

  /* Dithered: shown by default */
  .hero-img--dithered { opacity: 1; z-index: 1; }

  /* HD: hidden by default, revealed on hover */
  .hero-img--hd { opacity: 0; z-index: 2; }

  @media (min-width: 768px) {
    .hero-image-wrap:hover .hero-img--hd      { opacity: 1; }
    .hero-image-wrap:hover .hero-img--dithered { opacity: 0; }
  }

  /* Mobile: always show HD */
  @media (max-width: 767px) {
    .hero-img--dithered { opacity: 0; }
    .hero-img--hd       { opacity: 1; }
  }

  /* ── Brief ── */
  .docket-brief {
    font-family: monospace;
    font-size: 0.95rem;
    color: rgba(0,0,0,0.55);
    line-height: 1.8;
    max-width: 620px;
    margin-bottom: 2.5rem;
  }

  /* ── Read more button ── */
  .read-more-btn {
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #7930ff;
    background: none;
    border: 1.5px solid #7930ff;
    padding: 0.6rem 1.25rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .read-more-btn:hover {
    background: #7930ff;
    color: white;
  }

  /* ══════════════════════════
     FULL STORY SECTION
  ══════════════════════════ */

  .story-inner {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 4rem 2rem 6rem;
  }

  /* ── Story nav (top + bottom) ── */
  .story-nav, .story-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    margin-bottom: 2.5rem;
    border-bottom: 1px dashed rgba(0,0,0,0.1);
  }
  .story-footer {
    border-bottom: none;
    border-top: 1px dashed rgba(0,0,0,0.1);
    margin-top: 3rem;
    margin-bottom: 0;
  }

  .story-ref {
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: rgba(0,0,0,0.2);
  }

  .story-back-btn {
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: rgba(0,0,0,0.35);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }
  .story-back-btn:hover { color: #7930ff; }

  /* ── Markdown body styles ── */
  /* Targets the HTML that marked() generates.
     :global() is needed because these elements are injected
     via {@html} and aren't known at Svelte compile time. */
  .story-body :global(h2) {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 2.5rem 0 1rem;
    letter-spacing: -0.01em;
    /* Small monospace label above each section heading —
       the newspaper section marker */
    padding-top: 2rem;
    border-top: 1px solid rgba(0,0,0,0.08);
  }

  .story-body :global(h3) {
    font-size: 1.15rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 1.75rem 0 0.75rem;
  }

  .story-body :global(p) {
    font-size: 1rem;
    line-height: 1.85;
    color: rgba(0,0,0,0.72);
    margin-bottom: 1.25rem;
  }

  /* Pull quote — wrap text in > blockquote in your markdown */
  .story-body :global(blockquote) {
    margin: 2rem 0;
    padding: 1.25rem 1.5rem;
    border-left: 3px solid #7930ff;
    background: rgba(121,48,255,0.03);
    border-radius: 0 6px 6px 0;
  }
  .story-body :global(blockquote p) {
    font-size: 1.15rem;
    font-style: italic;
    color: rgba(0,0,0,0.6);
    margin-bottom: 0;
    line-height: 1.7;
  }

  .story-body :global(ul),
  .story-body :global(ol) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }
  .story-body :global(li) {
    font-size: 1rem;
    line-height: 1.75;
    color: rgba(0,0,0,0.7);
    margin-bottom: 0.4rem;
  }

  /* Inline code */
  .story-body :global(code) {
    font-family: monospace;
    font-size: 0.88em;
    background: rgba(121,48,255,0.06);
    color: #7930ff;
    padding: 2px 6px;
    border-radius: 3px;
  }

  /* Images in the markdown body */
  .story-body :global(img) {
    width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
    display: block;
  }

  /* Horizontal rule in markdown */
  .story-body :global(hr) {
    border: none;
    border-top: 1px dashed rgba(0,0,0,0.12);
    margin: 2.5rem 0;
  }
</style>