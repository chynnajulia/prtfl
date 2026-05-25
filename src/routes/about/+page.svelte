<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { TextScramble } from "$lib/TextScramble";

  // ── Card tilt state ──────────────────────────────────────────
  let cardEl:   HTMLElement;
  let nameEl:   HTMLElement;

  const disciplines = ["UX", "DEV", "WRITING", "GAMES", "MUSIC"];

  // Same cursor/gyro tilt pattern as the carousel card
  function applyTilt(x: number, y: number) {
    if (!cardEl) return;
    cardEl.style.transition = "transform 0.06s ease, box-shadow 0.06s ease";
    cardEl.style.transform  =
      `rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    cardEl.style.boxShadow  =
      `${-x * 18}px ${-y * 14}px 52px rgba(0,0,0,0.12),
       ${-x * 6}px ${-y * 4}px 20px rgba(121,48,255,0.06),
       inset 0 1px 0 rgba(255,255,255,0.95)`;
  }

  function resetTilt() {
    if (!cardEl) return;
    cardEl.style.transition = "transform 0.45s ease, box-shadow 0.45s ease";
    cardEl.style.transform  = "rotateX(0) rotateY(0) translateY(0)";
    cardEl.style.boxShadow  = `
      0 12px 48px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.95)`;
  }

  onMount(() => {
    // ── TextScramble on name ──
    let cleanup = () => {};
    if (nameEl) {
      const fx = new TextScramble(nameEl);
      // Small delay so the card entrance animation finishes first
      setTimeout(() => fx.setText("Chynna Julia Cordevilla"), 600);
      cleanup = () => fx.destroy();
    }

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    // ── Desktop: cursor tilt ──
    if (!isTouch && cardEl) {
      cardEl.addEventListener("mousemove", (e: MouseEvent) => {
        const r = cardEl.getBoundingClientRect();
        applyTilt(
          (e.clientX - r.left) / r.width  - 0.5,
          (e.clientY - r.top)  / r.height - 0.5,
        );
      });
      cardEl.addEventListener("mouseleave", resetTilt);
    }

    // ── Mobile: gyroscope tilt ──
    function startGyro() {
      window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
        applyTilt(
          Math.max(-1, Math.min(1, (e.gamma ?? 0)       / 25)),
          Math.max(-1, Math.min(1, ((e.beta ?? 0) - 30) / 25)),
        );
      });
    }

    if (isTouch && window.DeviceOrientationEvent) {
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
        ? cardEl?.addEventListener("click", () => {
            (DeviceOrientationEvent as any).requestPermission()
              .then((s: string) => { if (s === "granted") startGyro(); })
              .catch(console.error);
          }, { once: true })
        : startGyro();
    }

    return cleanup;
  });
</script>

<svelte:head>
  <title>About — Chynna Julia</title>
</svelte:head>

<!-- Ticket-backing texture behind everything -->
<div class="ticket-bg"    aria-hidden="true"></div>
<!-- Paper overlay: same as case study pages -->
<div class="paper-overlay" aria-hidden="true"></div>

<div class="about-page">

  <!-- Back link -->
  <a href="/" class="back-link">← RETURN TO PORTFOLIO</a>

  <!-- ── The Transit Card ── -->
  <div class="card-stage">
    <div class="transit-card" bind:this={cardEl}>

      <!-- Card face -->
      <div class="card-face">

        <!-- Top row: brand + contactless symbol -->
        <div class="card-top">
          <div class="card-brand">
            <!-- The "network" name — treat it as your personal brand -->
            <p class="brand-network">CREATIVE TRANSIT</p>
            <p class="brand-sub">PERSONAL PASS</p>
          </div>
          <!-- Contactless payment symbol, SVG inline -->
          <svg class="contactless" viewBox="0 0 24 24" fill="none"
            aria-label="Contactless" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              fill="none"/>
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
            <path d="M12 11c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"
              fill="currentColor"/>
          </svg>
        </div>

        <!-- Middle row: photo + identity -->
        <div class="card-middle">

          <!-- Photo placeholder -->
          <div class="photo-wrap" aria-label="Profile photo placeholder">
            <!--<img src="/images/photo.jpg" alt="Chynna Julia" class="photo-img" /> TODO !!! -->
            <div class="photo-placeholder">
              <!-- Pixel-art person silhouette via CSS -->
              <div class="silhouette-head"></div>
              <div class="silhouette-body"></div>
            </div>
            <p class="photo-label">CARDHOLDER</p>
          </div>

          <!-- Identity details -->
          <div class="card-identity">

            <div class="identity-top">
              <p class="card-label">CARDHOLDER NAME</p>
              <!-- TextScramble targets this element -->
              <p class="card-name glitch-text" bind:this={nameEl}>Chynna Julia Cordevilla</p>
              <p class="card-tagline">
                Designing at the intersection of ink, code, and transit.
              </p>
            </div>

            <!-- Chip (decorative) -->
            <div class="chip" aria-hidden="true">
              <div class="chip-line"></div>
              <div class="chip-line"></div>
              <div class="chip-line"></div>
            </div>

          </div>
        </div>

        <!-- Valid for: disciplines -->
        <div class="card-disciplines">
          <p class="card-label">VALID FOR</p>
          <div class="disciplines-row">
            {#each disciplines as discipline, i}
              <span class="discipline">{discipline}</span>
              {#if i < disciplines.length - 1}
                <span class="discipline-dot" aria-hidden="true">·</span>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Bottom row: issued + card number + contacts -->
        <div class="card-bottom">
          <div class="card-meta">
            <div class="meta-field">
              <p class="card-label">ISSUED</p>
              <p class="card-value">2014</p>
            </div>
            <div class="meta-field">
              <p class="card-label">STATUS</p>
              <p class="card-value accent">ACTIVE</p>
            </div>
          </div>

          <!-- Contact links -->
          <div class="card-contacts">
            
            <a href="mailto:chynnajulia@gmail.com"
              class="contact-link"
              aria-label="Email Chynna"
            >
              <!-- Mail icon -->
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="14" height="10" rx="1.5"
                  stroke="currentColor" stroke-width="1.2"/>
                <path d="M1 5l7 5 7-5"
                  stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              chynnajulia@gmail.com
            </a>
            
              <a href="https://twitter.com/_chynnajulia"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-link"
              aria-label="Chynna on Twitter"
            >
              <!-- X/Twitter icon -->
              <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6 1h2.2L9.9 6.8 15.5 15H11l-3.5-4.6L3.4 15H1.2l5.3-6.1L.5 1H5.1l3.2 4.2L12.6 1zm-.8 12.6h1.2L4.3 2.2H3l8.8 11.4z"/>
              </svg>
              @_chynnajulia
            </a>
          </div>
        </div>

      </div>

      <!-- Magnetic stripe at bottom of card -->
      <div class="magnetic-stripe" aria-hidden="true"></div>

      <!-- Glass sheen overlay -->
      <div class="card-sheen" aria-hidden="true"></div>

    </div>
  </div>

  <!-- Below the card: small print, like fine print on a transit card -->
  <p class="fine-print">
    This pass is non-transferable · Valid across all creative disciplines
    · <a href="mailto:chynnajulia@gmail.com">Contact issuer</a> for collaboration
  </p>

</div>

<style>
  /* ── Page layout ── */
  .about-page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-8);
    padding: 6rem var(--space-8) var(--space-12);
    position: relative;
  }

  /* ── Ticket backing texture ── */
  /* Diagonal lines, like the back of a boarding pass */
  .ticket-bg {
    position: fixed;
    inset: 0;
    z-index: -9; /* above ThreeBG grain, below paper overlay */
    pointer-events: none;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 6px,
      rgba(0,0,0,0.015) 6px,
      rgba(0,0,0,0.015) 7px
    );
  }

  /* Paper overlay */
  .paper-overlay {
    position: fixed;
    inset: 0;
    background: rgba(250, 248, 245, 0.92);
    z-index: var(--z-paper);
    pointer-events: none;
  }

  /* Back link */
  .back-link {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    text-decoration: none;
    transition: color var(--transition-fast);
    align-self: flex-start;
  }
  .back-link:hover { color: var(--color-accent); opacity: 1; }

  /* ── Card stage: 3D perspective context ── */
  .card-stage {
    perspective: 1000px;
    width: 100%;
    max-width: 680px;
    /* Entrance animation */
    animation: card-enter 0.7s cubic-bezier(0.2, 1.2, 0.4, 1) forwards;
  }

  @keyframes card-enter {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── The transit card ── */
  .transit-card {
    width: 100%;
    /* Classic credit/transit card aspect ratio (85.6mm × 53.98mm ≈ 1.586) */
    aspect-ratio: 1.586;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.52);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.88);
    box-shadow:
      0 12px 48px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.95);
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    cursor: default;
  }

  /* ── Card face (padding container) ── */
  .card-face {
    position: absolute;
    inset: 0;
    padding: 1.4rem 1.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 1;
  }

  /* ── Top row ── */
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .brand-network {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink);
    font-weight: 600;
    line-height: 1;
    margin-bottom: 2px;
  }

  .brand-sub {
    font-family: var(--font-mono);
    font-size: calc(var(--text-xs) * 0.85);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    line-height: 1;
  }

  /* Contactless icon */
  .contactless {
    width: 22px;
    height: 22px;
    color: var(--color-ink-faint);
  }

  /* ── Middle row ── */
  .card-middle {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex: 1;
    padding: 0.5rem 0;
  }

  /* Photo placeholder */
  .photo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .photo-placeholder {
    width: 64px;
    height: 78px;
    border-radius: 6px;
    border: 1px dashed var(--color-border-dashed);
    background: var(--color-accent-soft);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    overflow: hidden;
  }

  /* Actual Image */
  .photo-img {
    width: 64px; height: 78px;
    object-fit: cover;
    border-radius: 6px;
    }

  /* Simple CSS silhouette */
  .silhouette-head {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: rgba(121,48,255,0.15);
  }
  .silhouette-body {
    width: 32px; height: 24px;
    border-radius: 50% 50% 0 0;
    background: rgba(121,48,255,0.1);
  }

  .photo-label {
    font-family: var(--font-mono);
    font-size: calc(var(--text-xs) * 0.8);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    white-space: nowrap;
  }

  /* Identity */
  .card-identity {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .card-label {
    font-family: var(--font-mono);
    font-size: calc(var(--text-xs) * 0.88);
    letter-spacing: var(--tracking-label);
    color: var(--color-ink-faint);
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 3px;
  }

  .card-name {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 800;
    color: var(--color-ink);
    letter-spacing: var(--tracking-tight);
    line-height: 1.1;
    margin-bottom: 4px;
    /* min-height prevents layout shift during TextScramble */
    min-height: 1.2em;
  }

  .card-tagline {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-ink-soft);
    line-height: 1.5;
    letter-spacing: 0.01em;
  }

  /* Chip (decorative) */
  .chip {
    width: 32px; height: 24px;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 4px;
    background: linear-gradient(135deg,
      rgba(200,180,120,0.3) 0%,
      rgba(220,200,140,0.5) 50%,
      rgba(200,180,120,0.3) 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 4px 5px;
    align-self: flex-end;
  }

  .chip-line {
    height: 1px;
    background: rgba(0,0,0,0.15);
    border-radius: 1px;
  }

  /* ── Disciplines ── */
  .card-disciplines { }

  .disciplines-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 3px;
  }

  .discipline {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wider);
    color: var(--color-ink);
    font-weight: 500;
  }

  .discipline-dot {
    color: var(--color-accent);
    font-size: 0.9em;
  }

  /* ── Bottom row ── */
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .card-meta {
    display: flex;
    gap: var(--space-6);
  }

  .meta-field { }

  .card-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-ink);
    font-weight: 600;
    letter-spacing: var(--tracking-wide);
    line-height: 1;
  }

  .card-value.accent { color: var(--color-accent); }

  /* Contact links */
  .card-contacts {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .contact-link {
    font-family: var(--font-mono);
    font-size: calc(var(--text-xs) * 0.9);
    letter-spacing: 0.04em;
    color: var(--color-ink-soft);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color var(--transition-fast);
  }
  .contact-link:hover { color: var(--color-accent); opacity: 1; }
  .contact-link svg   { width: 12px; height: 12px; flex-shrink: 0; }

  /* ── Magnetic stripe ── */
  /* Positioned at the bottom of the card, like a real transit card */
  .magnetic-stripe {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 11%;
    background: linear-gradient(
      to bottom,
      rgba(20,10,40,0.85),
      rgba(10,5,20,0.92)
    );
    /* Subtle iridescent shimmer — like a real magnetic stripe in light */
    background-image: linear-gradient(
      90deg,
      rgba(121,48,255,0.08) 0%,
      transparent 30%,
      rgba(0,200,255,0.05) 60%,
      transparent 100%
    ),
    linear-gradient(
      to bottom,
      rgba(20,10,40,0.85),
      rgba(10,5,20,0.92)
    );
    z-index: 2;
  }

  /* ── Glass sheen ── */
  .card-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    background: linear-gradient(
      130deg,
      rgba(255,255,255,0.22) 0%,
      rgba(255,255,255,0.05) 40%,
      transparent 60%,
      rgba(255,255,255,0.04) 100%
    );
    border-radius: 16px;
  }

  /* ── Fine print ── */
  .fine-print {
    font-family: var(--font-mono);
    font-size: calc(var(--text-xs) * 0.85);
    letter-spacing: 0.06em;
    color: var(--color-ink-faint);
    text-align: center;
    line-height: 1.8;
    max-width: 520px;
  }
  .fine-print a {
    color: var(--color-accent);
    text-decoration: none;
  }
  .fine-print a:hover { opacity: 0.7; }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .card-stage { max-width: 100%; }

    /* On small screens, drop the aspect ratio lock and let
       the card grow taller so content isn't too cramped */
    .transit-card { aspect-ratio: auto; min-height: 340px; }

    .card-name    { font-size: var(--text-xl); }
    .card-tagline { display: none; } /* too cramped on small cards */

    .card-contacts { display: none; } /* moved to fine print on mobile */
  }
</style>