<script lang="ts">
  import { onMount } from 'svelte';
  import { TextScramble } from "$lib/TextScramble";

  // ─── Props ────────────────────────────────────────────────────────────────
  export let caseStudies: Array<{
    title:          string;
    description:    string;
    slug:           string;
    role?:          string;
    year?:          string;
    type?:          string;   // e.g. 'UX', 'DEV', 'UX + DEV'
    image?:         string;   // path to HD image in /static
    imageDithered?: string;   // path to manually dithered image in /static
  }> = [];

  // ─── CTA glitch phrases ───────────────────────────────────────────────────
  const phrases = [
    'TRACE ROUTE →',
    'VIEW ITINERARY →',
    'PULL RECORD →',
    'BOARD →',
    'READ CASE STUDY →',
  ];
  let phraseIndex = 0; // TODO: delete this then just place a p or span within anchor text in order to cycle through (see page.svelte)
  let phraseText  = phrases[0];
  let vcsEl: HTMLElement;

  // ─── Carousel state ───────────────────────────────────────────────────────
  let current   = 0;
  let animating = false;

  // Ghost animation states.
  // 'idle'    → continuous CSS sway animation (feels alive at rest)
  // 'lean-in' → ghost swings toward viewer (the side being navigated to)
  // 'lean-out'→ ghost recedes away (opposite side)
  let ghostLeftState:  'idle' | 'lean-in' | 'lean-out' = 'idle';
  let ghostRightState: 'idle' | 'lean-in' | 'lean-out' = 'idle';

  // ─── Derived values ───────────────────────────────────────────────────────
  $: N         = caseStudies.length;
  $: leftIdx   = (current - 1 + N) % N;
  $: rightIdx  = (current + 1) % N;
  $: card      = caseStudies[current]  ?? {};
  $: leftCard  = caseStudies[leftIdx]  ?? {};
  $: rightCard = caseStudies[rightIdx] ?? {};
  $: counter   = `0${current + 1} / 0${N}`;

  // ─── Barcode generator ────────────────────────────────────────────────────
  // Generates a deterministic visual barcode from the card slug.
  // Each character in the slug seeds the height of one bar via a simple hash.
  // Same slug = same barcode every render. No randomness.
  function makeBars(slug = 'cs') {
    const widths  = [2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1];
    const heights = slug.split('').map((ch, i) =>
      [100, 70, 85, 55, 90][(ch.charCodeAt(0) * 37 + i * 13) % 5]
    );
    return widths.map((w, i) => ({ w, h: heights[i % heights.length] ?? 75 }));
  }
  $: bars = makeBars(card.slug ?? card.title ?? 'cs');

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  let mainCard:    HTMLElement;
  let cardImageEl: HTMLElement;
  let imageRevealed = false; // dithered ↔ HD toggle state on mobile

  // ─── Navigation ───────────────────────────────────────────────────────────
  function changeCard(dir: number) {
    if (animating || N <= 1) return;
    animating     = true;
    imageRevealed = false; // reset image state for the incoming card

    // Ghost lean: the incoming side leans in (tips forward like a record being
    // selected from a crate), the outgoing side leans out (recedes away).
    if (dir > 0) {
      ghostRightState = 'lean-in';
      ghostLeftState  = 'lean-out';
    } else {
      ghostLeftState  = 'lean-in';
      ghostRightState = 'lean-out';
    }

    const exitX  = dir > 0 ? '-108%' : '108%';
    const enterX = dir > 0 ? '108%'  : '-108%';

    // Slide current card out with slight scale-down (feels like picking it up)
    mainCard.style.transition = 'transform 0.24s cubic-bezier(0.4,0,1,1), opacity 0.24s ease';
    mainCard.style.transform  = `translateX(${exitX}) scale(0.94)`;
    mainCard.style.opacity    = '0.1';

    setTimeout(() => {
      current = (current + dir + N) % N;

      // Reset new card to entering side (instant — no transition)
      mainCard.style.transition = 'none';
      mainCard.style.transform  = `translateX(${enterX}) scale(0.94)`;
      mainCard.style.opacity    = '0.1';

      // Two rAF calls ensure the browser applies the reset before animating.
      // Without them, the browser may batch both style changes together
      // and skip the intermediate state.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        // The '1.3' in this bezier overshoots scale(1) briefly before settling.
        // This creates a spring-like bounce — the physical weight of the card.
        mainCard.style.transition =
          'transform 0.32s cubic-bezier(0.2,1.3,0.4,1), opacity 0.3s ease';
        mainCard.style.transform  = 'translateX(0) scale(1)';
        mainCard.style.opacity    = '1';

        // Return ghosts to their idle sway after completing the lean
        setTimeout(() => {
          ghostLeftState  = 'idle';
          ghostRightState = 'idle';
          animating       = false;
        }, 180);
      }));
    }, 240);
  }

  // ─── CTA glitch cycling ───────────────────────────────────────────────────
  function cyclePhrase() {
    setTimeout(() => {
      phraseIndex        = (phraseIndex + 1) % phrases.length;
      phraseText         = phrases[phraseIndex];
    }, 800);
  }


  // ─── Tilt (shared: cursor on desktop, gyroscope on mobile) ───────────────
  // x, y: normalized −1 to 1 (−1 = far left/up, 1 = far right/down)
  function applyTilt(x: number, y: number) {
    if (animating || !mainCard) return;
    mainCard.style.transition = 'transform 0.06s ease, box-shadow 0.06s ease';
    mainCard.style.transform  =
      `rotateX(${-y * 9}deg) rotateY(${x * 9}deg) translateY(-3px)`;
    // Shadow shifts opposite to tilt direction, simulating a fixed light source
    mainCard.style.boxShadow  =
      `${-x * 14}px ${-y * 12}px 44px rgba(0,0,0,0.11), inset 0 1px 0 rgba(255,255,255,0.95)`;
  }

  function resetTilt() {
    if (animating || !mainCard) return;
    mainCard.style.transition = 'transform 0.38s ease, box-shadow 0.38s ease';
    mainCard.style.transform  = 'rotateX(0) rotateY(0) translateY(0)';
    mainCard.style.boxShadow  =
      '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)';
  }

  // ─── Image glitch reveal (mobile tap) ────────────────────────────────────
  // Desktop: hover handled entirely in CSS.
  // Mobile: tap triggers a glitch transition between dithered ↔ HD.
  function handleImageTap() {
    if (!cardImageEl) return;
    cardImageEl.classList.add('glitching');
    setTimeout(() => { imageRevealed = !imageRevealed; }, 200);
    setTimeout(() => cardImageEl?.classList.remove('glitching'), 500);
  }

  // ─── Touch physics ────────────────────────────────────────────────────────
  let touchStartX = 0, touchLastX = 0, touchLastT = 0;
  let velocity = 0, dragging = false, dragOffset = 0;

  function onTouchStart(e: TouchEvent) {
    touchStartX = touchLastX = e.touches[0].clientX;
    touchLastT  = Date.now();
    velocity    = 0;
    dragging    = true;
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging || animating || !mainCard) return;
    const x = e.touches[0].clientX, now = Date.now(), dt = now - touchLastT || 1;
    velocity   = (x - touchLastX) / dt; // instantaneous velocity (px/ms)
    dragOffset = x - touchStartX;
    touchLastX = x;
    touchLastT = now;
    // 0.7 resistance: card follows finger but feels heavy, like real glass
    mainCard.style.transition = 'none';
    mainCard.style.transform  =
      `translateX(${dragOffset * 0.7}px) rotateY(${-dragOffset * 0.04}deg)`;
  }

  function onTouchEnd() {
    if (!dragging || animating || !mainCard) return;
    dragging = false;
    const w = mainCard.getBoundingClientRect().width;
    // Commit if: fast flick OR dragged > 30% of card width
    if (Math.abs(velocity) > 0.35 || Math.abs(dragOffset) > w * 0.3) {
      changeCard(dragOffset < 0 ? 1 : -1);
    } else {
      // Spring back: overshoot bezier gives a satisfying snap-back
      mainCard.style.transition = 'transform 0.4s cubic-bezier(0.2,1.4,0.4,1)';
      mainCard.style.transform  = 'translateX(0) rotateY(0)';
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  onMount(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Desktop: cursor-driven tilt
    if (!isTouch && mainCard) {
      mainCard.addEventListener('mousemove', (e: MouseEvent) => {
        const r = mainCard.getBoundingClientRect();
        applyTilt(
          (e.clientX - r.left) / r.width  - 0.5,
          (e.clientY - r.top)  / r.height - 0.5,
        );
      });
      mainCard.addEventListener('mouseleave', resetTilt);
    }

    // Mobile: gyroscope-driven tilt.
    // gamma = left/right tilt (−90 to 90°)
    // beta  = forward/back tilt (−180 to 180°)
    // Subtracting 30 from beta corrects for the natural forward tilt
    // of a phone held in hand, so "neutral" = no card tilt.
    function startGyro() {
      window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
        if (animating) return;
        applyTilt(
          Math.max(-1, Math.min(1, (e.gamma ?? 0)        / 25)),
          Math.max(-1, Math.min(1, ((e.beta ?? 0) - 30)  / 25)),
        );
      });
    }

    if (isTouch && window.DeviceOrientationEvent) {
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
        ? mainCard?.addEventListener('click', () => {
            (DeviceOrientationEvent as any).requestPermission()
              .then((s: string) => { if (s === 'granted') startGyro(); })
              .catch(console.error);
          }, { once: true })
        : startGyro();
    }

    const phraseInterval = setInterval(cyclePhrase, 3200);


    // Text Scramble
    const fxViewCS = new TextScramble(vcsEl);
    let counterVCS = 0;

    const nextVCS = () => {
      fxViewCS.setText(phrases[counterVCS]).then(() => {
        counterVCS = (counterVCS + 1) % phrases.length;
        setTimeout(nextVCS, 1500);
      });
    };

    nextVCS();


    // Return value of onMount = cleanup function.
    // Svelte calls this automatically when the component is destroyed.
    return () => {
        fxViewCS.destroy();
        clearInterval(phraseInterval);
    };
  });
</script>

<!-- ─── Template ──────────────────────────────────────────────────────────── -->
<section class="showcase-carousel">

  <p class="destination-tag" aria-hidden="true">
    DESTINATION · {(card.title ?? '').toUpperCase()}
  </p>

  <div class="carousel-row">

    <button
      class="arrow-btn"
      onclick={() => changeCard(-1)}
      aria-label="Previous case study"
      disabled={N <= 1}
    >←</button>

    <!-- Stage: all three cards (2 ghosts + 1 main) share one 3D context -->
    <div class="stage">

      <!-- Left ghost (previous record in the crate) -->
      <div
        class="ghost ghost-left"
        class:lean-in={ghostLeftState   === 'lean-in'}
        class:lean-out={ghostLeftState  === 'lean-out'}
        aria-hidden="true"
      >
        <div
          class="ghost-image"
          style={leftCard.imageDithered
            ? `background-image:url(${leftCard.imageDithered})`
            : leftCard.image ? `background-image:url(${leftCard.image})` : ''}
        ></div>
        <p class="ghost-title">{leftCard.title ?? ''}</p>
      </div>

      <!-- Right ghost (next record in the crate) -->
      <div
        class="ghost ghost-right"
        class:lean-in={ghostRightState  === 'lean-in'}
        class:lean-out={ghostRightState === 'lean-out'}
        aria-hidden="true"
      >
        <div
          class="ghost-image"
          style={rightCard.imageDithered
            ? `background-image:url(${rightCard.imageDithered})`
            : rightCard.image ? `background-image:url(${rightCard.image})` : ''}
        ></div>
        <p class="ghost-title">{rightCard.title ?? ''}</p>
      </div>

      <!-- Main card -->
      <div class="slide-viewport">
        <div
            class="card"
            bind:this={mainCard}
            ontouchstart={onTouchStart}
            ontouchmove={onTouchMove}
            ontouchend={onTouchEnd}
        >

          <!-- Image -->
          <div
            class="card-image"
            bind:this={cardImageEl}
            onclick={handleImageTap}
            role="button"
            tabindex="0"
            aria-label="Tap to toggle full image"
           >   
            <div class="img-layer img-dithered" class:hidden={imageRevealed}>
              {#if card.imageDithered}
                <img src={card.imageDithered} alt="" />
              {:else}
                <span class="img-hint">Tap to reveal</span>
              {/if}
            </div>
            <div class="img-layer img-hd" class:revealed={imageRevealed}>
              {#if card.image}
                <img src={card.image} alt={card.title} />
              {:else}
                <span class="img-hint img-hint--hd">HD image</span>
              {/if}
            </div>
            <div class="image-sheen" aria-hidden="true"></div>
          </div>

          <!-- Body -->
          <div class="card-body">
            <div class="top-row">
              <div class="ref">
                <div class="hole" aria-hidden="true"></div>
                REF · CS-00{current + 1}
              </div>
              <div class="stamp">{card.type ?? 'UX'}</div>
            </div>

            <p class="field-label">Project</p>
            <h3 class="project-title">{card.title ?? ''}</h3>

            <p class="field-label">Brief</p>
            <p class="brief">{card.description ?? ''}</p>

            <hr class="divider" />

            <div class="meta-row">
              <div>
                <p class="field-label">Role</p>
                <p class="meta-value">{card.role ?? '—'}</p>
              </div>
              <div>
                <p class="field-label">Year</p>
                <p class="meta-value">{card.year ?? '—'}</p>
              </div>
            </div>

            <div class="barcode" aria-hidden="true">
              {#each bars as bar}
                <div class="bar" style="width:{bar.w}px; height:{bar.h}%"></div>
              {/each}
            </div>
            <p class="barcode-label" aria-hidden="true">
              {(card.slug ?? 'cs-001').toUpperCase().replace(/-/g, ' · ')}
            </p>
          </div>

          <!-- Footer -->  
          <div class="card-footer">
            <a
              href="/case-studies/{card.slug}"
              class="cta-wrap"
              bind:this={vcsEl}
              data-text={phraseText}
            >{phraseText}</a>
            <span class="boarding-label" aria-hidden="true">BOARDING PASS</span>
          </div>

        </div>
      </div>
    </div>

    <button
      class="arrow-btn"
      onclick={() => changeCard(1)}
      aria-label="Next case study"
      disabled={N <= 1}
    >→</button>

  </div>

  <p class="counter" aria-live="polite">{counter}</p>

</section>

<!-- ─── Styles ────────────────────────────────────────────────────────────── -->
<style>
  .showcase-carousel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
  }

  .destination-tag {
    font-family: monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(0,0,0,0.22);
    text-transform: uppercase;
    align-self: flex-start;
  }

  .carousel-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
  }

  /* ── Arrow buttons ── */
  .arrow-btn {
    flex-shrink: 0;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.85);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    font-family: monospace;
    font-size: 15px;
    color: #1a1a1a;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    user-select: none;
    z-index: 2;
  }
  .arrow-btn:hover:not(:disabled) { background: rgba(255,255,255,0.88); transform: scale(1.1); }
  .arrow-btn:active:not(:disabled) { transform: scale(0.93); }
  .arrow-btn:disabled { opacity: 0.25; cursor: default; }

  /* ── Stage ── */
  /* perspective here applies to all children — ghost cards and the
     main card all live in the same 3D space, which is what makes
     the rotateY transforms look correct relative to each other */
  .stage {
    flex: 1;
    position: relative;
    perspective: 1000px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Ghost cards ── */
  .ghost {
    position: absolute;
    top: 50%;
    width: 88%;
    height: calc(100% - 12px);
    border-radius: 16px;
    background: rgba(255,255,255,0.22);
    border: 1px solid rgba(255,255,255,0.55);
    backdrop-filter: blur(10px);
    overflow: hidden;
    pointer-events: none;
    /* Smooth transition between idle / lean-in / lean-out.
       When .lean-in or .lean-out is added, the browser interpolates
       from the current CSS transform (mid-sway animation) to the
       new one. When classes are removed, it transitions back. */
    transition:
      transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94),
      opacity   0.3s ease;
    z-index: 0;
  }

  .ghost-image {
    width: 100%;
    aspect-ratio: 16/9;
    background-size: cover;
    background-position: center;
    /* Heavy blur simulates the image seen through frosted glass */
    filter: blur(5px) brightness(0.8) grayscale(0.5);
    opacity: 0.55;
  }

  .ghost-title {
    padding: 0.4rem 0.75rem;
    font-family: monospace;
    font-size: 8px;
    letter-spacing: 0.1em;
    color: rgba(0,0,0,0.2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Ghost left: idle resting position + sway ── */
  .ghost-left {
    transform-origin: right center;
    transform: translateY(-50%) translateX(-84%) rotateY(42deg) scale(0.84);
    opacity: 0.5;
    animation: sway-left 9s ease-in-out infinite;
  }

  /* ── Ghost right: idle resting position + sway ── */
  .ghost-right {
    transform-origin: left center;
    transform: translateY(-50%) translateX(84%) rotateY(-42deg) scale(0.84);
    opacity: 0.5;
    animation: sway-right 9s ease-in-out infinite;
  }

  /* Sway: slow (9s), very subtle (±2°), like records settling under gravity */
  @keyframes sway-left {
    0%, 100% {
      transform: translateY(-50%) translateX(-84%) rotateY(42deg) scale(0.84);
      opacity: 0.50;
    }
    50% {
      transform: translateY(-50%) translateX(-84%) rotateY(44deg) scale(0.83);
      opacity: 0.44;
    }
  }
  @keyframes sway-right {
    0%, 100% {
      transform: translateY(-50%) translateX(84%) rotateY(-42deg) scale(0.84);
      opacity: 0.50;
    }
    50% {
      transform: translateY(-50%) translateX(84%) rotateY(-44deg) scale(0.83);
      opacity: 0.44;
    }
  }

  /* ── Lean-in: ghost tips toward viewer (being selected) ── */
  /* animation:none stops the sway; the CSS transition on .ghost
     smoothly takes it from wherever the sway was to this position */
  .ghost-left.lean-in {
    animation: none;
    transform: translateY(-50%) translateX(-56%) rotateY(20deg) scale(0.94) !important;
    opacity: 0.72;
  }
  .ghost-right.lean-in {
    animation: none;
    transform: translateY(-50%) translateX(56%) rotateY(-20deg) scale(0.94) !important;
    opacity: 0.72;
  }

  /* ── Lean-out: ghost recedes away (other side selected) ── */
  .ghost-left.lean-out {
    animation: none;
    transform: translateY(-50%) translateX(-102%) rotateY(58deg) scale(0.70) !important;
    opacity: 0.18;
  }
  .ghost-right.lean-out {
    animation: none;
    transform: translateY(-50%) translateX(102%) rotateY(-58deg) scale(0.70) !important;
    opacity: 0.18;
  }

  /* ── Slide viewport ── */
  .slide-viewport {
    width: 100%;
    overflow: hidden;
    border-radius: 16px;
    position: relative;
    z-index: 1;
  }

  /* ── Main glass card ── */
  .card {
    width: 100%;
    border-radius: 16px;
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.85);
    box-shadow:
      0 8px 32px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.95);
    overflow: hidden;
    transform-style: preserve-3d;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
    will-change: transform;
    cursor: grab;
  }
  .card:active { cursor: grabbing; }

  /* ── Image area ── */
  .card-image {
    width: 100%;
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .img-layer {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.45s ease;
  }
  .img-layer img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .img-dithered         { opacity: 1; }
  .img-dithered.hidden  { opacity: 0; }
  .img-hd               { opacity: 0; }
  .img-hd.revealed      { opacity: 1; }

  /* Desktop: CSS hover reveal */
  @media (min-width: 768px) {
    .card:hover .img-hd      { opacity: 1; }
    .card:hover .img-dithered { opacity: 0; }
  }

  /* Mobile: start with HD, tap-to-glitch handles toggle */
  @media (max-width: 767px) {
    .img-dithered { opacity: 0; }
    .img-hd       { opacity: 1; }
  }

  /* Image glitch animation (class toggled by JS) */
  .card-image.glitching .img-layer {
    animation: img-glitch 0.5s steps(1) forwards;
  }
  @keyframes img-glitch {
    0%   { clip-path: inset(0 0 100% 0); }
    10%  { clip-path: inset(10% 0 60% 0); transform: translateX(4px); }
    20%  { clip-path: inset(60% 0 10% 0); transform: translateX(-4px); }
    30%  { clip-path: inset(30% 0 40% 0); transform: translateX(2px); }
    40%  { clip-path: inset(80% 0 5%  0); transform: translateX(-2px); }
    50%  { clip-path: inset(0 0 0 0);    transform: translateX(0); }
    100% { clip-path: inset(0 0 0 0); }
  }

  .image-sheen {
    position: absolute; inset: 0; pointer-events: none; z-index: 2;
    background: linear-gradient(130deg,
      rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.06) 100%);
  }

  .img-hint {
    font-family: monospace; font-size: 10px;
    letter-spacing: 0.14em; color: rgba(110,80,180,0.4);
    text-transform: uppercase; position: relative; z-index: 1;
  }
  .img-hint--hd { color: rgba(220,210,255,0.5); }

  /* ── Card body ── */
  .card-body { padding: 1rem 1.15rem 0.5rem; }

  .top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.7rem; }
  .ref {
    font-family: monospace; font-size: 10px;
    letter-spacing: 0.14em; color: rgba(0,0,0,0.28);
    display: flex; align-items: center; gap: 7px;
  }
  .hole { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,0.15); flex-shrink: 0; }
  .stamp { font-family: monospace; font-size: 9px; letter-spacing: 0.15em; border: 1.5px solid #7930ff; color: #7930ff; padding: 2px 8px; border-radius: 3px; }

  .field-label { font-family: monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(0,0,0,0.28); margin-bottom: 3px; text-transform: uppercase; }
  .project-title { font-size: 15px; font-weight: 600; color: #1a1a1a; line-height: 1.3; margin-bottom: 0.65rem; font-family: inherit; }
  .brief { font-family: monospace; font-size: 11px; color: rgba(0,0,0,0.44); line-height: 1.65; margin-bottom: 0.8rem; }
  .divider { border: none; border-top: 1px dashed rgba(0,0,0,0.1); margin-bottom: 0.7rem; }
  .meta-row { display: flex; gap: 2rem; margin-bottom: 0.7rem; }
  .meta-value { font-family: monospace; font-size: 11px; color: rgba(0,0,0,0.52); }

  .barcode { display: flex; gap: 2px; align-items: flex-end; height: 18px; margin-bottom: 2px; }
  .bar { background: rgba(0,0,0,0.16); border-radius: 1px; }
  .barcode-label { font-family: monospace; font-size: 8px; color: rgba(0,0,0,0.16); letter-spacing: 0.1em; }

  /* ── Footer ── */
  .card-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1.15rem 0.85rem; border-top: 1px dashed rgba(0,0,0,0.09); }



  .cta-wrap {
    position: relative; display: inline-block;
    font-family: monospace; font-size: 10px;
    letter-spacing: 0.14em; color: #7930ff;
    text-decoration: none; user-select: none;
  }

  .boarding-label { font-family: monospace; font-size: 8px; color: rgba(0,0,0,0.14); letter-spacing: 0.12em; }

  /* ── Counter ── */
  .counter { font-family: monospace; font-size: 11px; letter-spacing: 0.14em; color: rgba(0,0,0,0.28); }

  /* ── Mobile adjustments ── */
  @media (max-width: 767px) {
    .ghost-left  { transform: translateY(-50%) translateX(-80%) rotateY(40deg) scale(0.82); animation-name: sway-left-sm; }
    .ghost-right { transform: translateY(-50%) translateX(80%)  rotateY(-40deg) scale(0.82); animation-name: sway-right-sm; }
    .ghost-left.lean-in  { transform: translateY(-50%) translateX(-52%) rotateY(18deg) scale(0.92) !important; }
    .ghost-right.lean-in { transform: translateY(-50%) translateX(52%)  rotateY(-18deg) scale(0.92) !important; }
    .ghost-left.lean-out  { transform: translateY(-50%) translateX(-96%) rotateY(55deg) scale(0.68) !important; }
    .ghost-right.lean-out { transform: translateY(-50%) translateX(96%)  rotateY(-55deg) scale(0.68) !important; }

    @keyframes sway-left-sm {
      0%, 100% { transform: translateY(-50%) translateX(-80%) rotateY(40deg) scale(0.82); }
      50%       { transform: translateY(-50%) translateX(-80%) rotateY(42deg) scale(0.81); }
    }
    @keyframes sway-right-sm {
      0%, 100% { transform: translateY(-50%) translateX(80%) rotateY(-40deg) scale(0.82); }
      50%       { transform: translateY(-50%) translateX(80%) rotateY(-42deg) scale(0.81); }
    }
  }
</style>