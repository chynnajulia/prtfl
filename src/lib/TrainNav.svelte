<script lang="ts">
  import { activeStation } from "$lib/stores";
  import { page } from "$app/stores";

  // Station definitions — label and the section ID to scroll to
  const stations = [
    { label: "Departure",   id: "station-intro" },
    { label: "Interchange", id: "station-showcase" },
    { label: "Final Stop",  id: "station-contact" },
  ];

  // We're on the homepage if the path is exactly "/"
  // On other pages (case studies), clicking will navigate home first
  $: isHomePage = $page.url.pathname === "/";

  function handleStationClick(index: number) {
    if (isHomePage) {
      // Scroll the section into view — scroll-snap takes over from there
      const el = document.getElementById(stations[index].id);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On other pages, go home and anchor to that section
      window.location.href = `/#${stations[index].id}`;
    }
  }
</script>

<!-- The nav is always rendered but positioned fixed on screen -->
<nav class="train-nav" aria-label="Station navigation">
  <div class="glass-rail">

    {#each stations as station, i}
      <button
        class="station-stop"
        class:active={$activeStation === i}
        onclick={() => handleStationClick(i)}
        aria-label="Go to {station.label}"
      >
        <!-- The dot — always visible -->
        <span class="dot"></span>

        <!-- The label — slides in on hover (desktop) or hidden on mobile -->
        <span class="station-label">{station.label}</span>

      </button>

      <!-- Connector line between dots (not after the last one) -->
      {#if i < stations.length - 1}
        <div class="connector"></div>
      {/if}

    {/each}
  
  </div>
</nav>

<style>
  .train-nav {
    background-color: transparent;
    position: fixed;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0; /* gap handled by connector */
  }

  .glass-rail {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 0.75rem;
    background: transparent;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(10px);

    border: 1px transparent solid;
    border-radius: 20px;
    
    transition: background 0.5s ease-in-out, border 0.5s ease-in-out;
  }

  .station-stop {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  /* The dot */
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #cccccc;
    flex-shrink: 0;
    transition: background 0.3s ease, transform 0.3s ease, display 0.5s ease;

  }

  .station-stop.active .dot {
    display: inline;
    opacity: 0.5;
    background: #7930ff;
    transform: scale(1.3);
  }

  /* Connector line between dots */
  .connector {
    align-self: flex-start;
    margin-left: 4px;
    width: 1px;
    height: 3rem;
    background: #dddddd;
/*
    transition-behavior: allow-discrete;
    transition: opacity 0.2s ease, display 0.5s ease;
    
    opacity: 0;
    display: none;*/
  }


  /* Label — hidden by default, slides in on hover */
  .station-label {
    font-family: monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    
    white-space: nowrap;
    color: #847594;
    opacity: 0.5;
/*
    transition-behavior: allow-discrete;
    opacity: 0;
    display: none;
    transform: translateX(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease, display 0.5s ease;

    */
    
    pointer-events: none; /* label itself isn't clickable, button is */
  }

  .train-nav:hover .glass-rail{
    background: rgba(255, 255, 255, 0.3);

    border: 0.5px solid rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  /* On hover over the whole nav, reveal all labels */
  /*
  .train-nav:hover .station-label {
    display: inline;
    opacity: 1;
    transform: translateX(0);
  }
    */

  /* Active station label is always visible */
  .station-stop.active .station-label {
    opacity: 1;  
  }

  /* On hover over the whole nav, reveal all dots */
  .train-nav:hover .dot {
    opacity: 1;
    transform: translateX(0);
  }

  .train-nav:hover .connector {
    opacity: 1;
    display: block;
  }


  /* Mobile: labels stay hidden, dots slightly larger for tap targets */
  @media (max-width: 767px) {
    .train-nav {
      left: 1rem;
      display:none; /*TODO: temporarily hidden on mobile*/
    }

    .dot {
      width: 8px;
      height: 8px;
    }

    /* Override hover reveal — labels never show on mobile */
    .train-nav:hover .station-label {
      opacity: 0;
    }

    .station-stop.active .station-label {
      opacity: 0;
    }
  }
</style>