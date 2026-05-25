<script lang="ts">
  import { IconDownload } from "@tabler/icons-svelte";
  import { page } from "$app/stores";

  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  $: $page.url.pathname, (menuOpen = false);
</script>

<header class="topnav">

  <!-- Hamburger: left on mobile, hidden on desktop -->
   <!--
  <button
    class="hamburger"
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
    onclick={toggleMenu}
  >
    <span class="bar" class:open={menuOpen}></span>
    <span class="bar" class:open={menuOpen}></span>
    <span class="bar" class:open={menuOpen}></span>
  </button>-->

  <!-- Logo: centered on mobile, left on desktop -->
  <a href="/" class="logo">CJ</a>

  <!-- Desktop links: appear right after logo via order, hidden on mobile -->
  <nav class="desktop-links">
    <!--<a href="/" class:active={$page.url.pathname === "/"}>Home</a> -->
    <a href="/about" class:active={$page.url.pathname === "/about"}>about</a>
    <!-- CV button: always rightmost, always visible -->
    <a href="/cv.pdf" download class="cv-button" aria-label="download cv">
      <IconDownload size={15} stroke={2.5} />
      <span class="cv-desktop">download</span><span class="cv-label">cv</span>
    </a>
  </nav>

  <!-- Spacer: pushes CV button to the right on desktop -->
  <div class="spacer"></div>

  

  <!-- Mobile dropdown -->
  {#if menuOpen}
    <nav class="mobile-menu">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/cv.pdf" download>download cv</a>
    </nav>
  {/if}

</header>

<style>
  /* Default: for Mobile */

  .topnav {
    max-width: 1000px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background-color: red;

    /*
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    */


  }

  /* ── Logo ── */
  .logo {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-decoration: none;
    color: #1a1a1a;

    /* Mobile: centered via absolute positioning so it doesn't
       get pushed around by the hamburger or CV button */
    /*
    position: absolute;
    left: 50%;
    transform: translateX(-50%);*/
  }

  /* ── Desktop links ── */
  .desktop-links {
    display: flex;
    margin-left: auto;
    gap: 1.5rem;
    justify-content: space-between;
    align-items: center;

    border-radius: 40px;

    box-shadow: 0px -3px 3px 0px rgba(255,255,255,0.5);
    -webkit-box-shadow: 0px -3px 3px 0px rgba(255,255,255,0.5);
    -moz-box-shadow: 0px -3px 3px 0px rgba(255,255,255,0.5);

    box-shadow: 0px 3px 3px 0px rgba(255,255,255,0.5);
    -webkit-box-shadow: 0px 3px 3px 0px rgba(255,255,255,0.5);
    -moz-box-shadow: 0px 3px 3px 0px rgba(255,255,255,0.5);

    box-shadow: 0px 15px 40px 10px rgba(77, 61, 88, 0.15);
    -webkit-box-shadow: 0px 15px 40px 10px rgba(77, 61, 88, 0.15);
    -moz-box-shadow: 0px 15px 40px 10px rgba(77, 61, 88, 0.15);

    box-shadow: 
      inset 1px 1px 0px rgba(255, 255, 255, 0.4), /* Highlights */
      0 8px 24px rgba(0, 0, 0, 0.25); /* Cast Shadow */

    /*
    background: rgba(255, 255, 255, 0.05);
    border-radius: 40px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    */

    padding-left: 20px;
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .desktop-links a {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-decoration: none;
    color: #1a1a1a;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  .desktop-links a:hover,
  .desktop-links a.active {
    opacity: 1;
  }

  /* ── CV button ── */
  .cv-button {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    /*text-transform: uppercase;*/
    text-decoration: none;
    color: white;
    background: #7930ff;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  .cv-button:hover {
    opacity: 0.8;
  }

  .cv-label {
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
  }

  .cv-desktop {
    display: none;
  }

  /* ── Hamburger ── */
  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    flex-shrink: 0;
  }

  .bar {
    display: block;
    width: 22px;
    height: 2px;
    background: #1a1a1a;
    border-radius: 2px;
    transition: transform 0.2s ease, opacity 0.2s ease;
    transform-origin: center;
  }

  .bar:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
  .bar:nth-child(2).open { opacity: 0; }
  .bar:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }

  /* ── Mobile dropdown ── */
  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.97);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
    gap: 1.25rem;
  }

  .mobile-menu a {
    font-family: monospace;
    font-size: 0.9rem;
    text-decoration: none;
    color: #1a1a1a;
    letter-spacing: 0.08em;
  }

  .glass-card {
    width: 240px;
    height: 360px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1),
      inset 0 0 52px 26px rgba(255, 255, 255, 2.6);
    position: relative;
    overflow: hidden;
  }

  /* ── Desktop overrides (768px+) ── */
  @media (min-width: 768px) {
    .topnav {
      max-width: none;
    }

    .logo {
      /* On desktop, logo flows naturally in the flex row —
         no more absolute centering trick needed */
      position: static;
      transform: none;
    }

    .hamburger {
      display: none;
    }

    .cv-desktop {
      display: inline;
    }
  }
</style>