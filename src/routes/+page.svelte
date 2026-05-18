<script>
  import { onMount } from "svelte";
  import { activeStation } from "$lib/stores";

  import imageN1 from '$lib/assets/normal-1.png';
  import imageD1 from '$lib/assets/dither-1.gif';

  export let data;

  let sections = [];

  // Communicate Active Station to ThreeJS
  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target);
            activeStation.set(index);
          }
        });
      },
      {
        threshold: 0.6 // station is "active" when 60% visible
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect(); // cleanup
  });
</script>

<div class="train-page">

  <!-- Station 1: Introduction -->
  <section class="station" id="station-intro" bind:this={sections[0]}>
    <div class="station-content">
      <p class="station-label">01 · Departure</p>
      <h1>Chynna Julia</h1>
      <p class="role">UX Designer & Creative Developer</p>
      <p class="flavor">
        <!-- your flavor text here -->
        Crafting thoughtful digital experiences — somewhere between 
        ink and interface.
      </p>
    </div>
  </section>

  <!-- Station 2: Showcase -->
  <section class="station" id="station-showcase" bind:this={sections[1]}>
    <div class="station-content">
      <p class="station-label">02 · Interchange</p>
      <h2>Selected Work</h2>
      <p class="station-sub">Scroll horizontally to explore.</p>
      <div class="images">
        <img class="bottom" src="{imageN1}"/> <!-- TODO -->
        <img class="top" src="{imageD1}"/> <!-- TODO -->
      </div>

      <!-- Horizontal scroll track -->
      <div class="showcase-track">
        {#each data.caseStudies as cs}
          <div class="showcase-card">
            <p class="card-tag">Case Study</p>
            <h3>{cs.title}</h3>
            <p>{cs.description}</p>
            <a href={`/case-studies/${cs.slug}`} class="read-more">
              Read the full story →
            </a>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Station 3: Contact CTA -->
  <section class="station" id="station-contact" bind:this={sections[2]}>
    <div class="station-content">
      <p class="station-label">03 · Final Stop</p>
      <h2>Let's build something together.</h2>
      <p class="flavor">
        <!-- your CTA flavor text here -->
      </p>
      <a href="mailto:you@email.com" class="cta-button">Get in touch</a>
    </div>
  </section>

</div>

<style>
  /* Vertical scroll-snap container */
  .train-page {
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scrollbar-width: none; /* hide scrollbar — navigation is via train nav */
  }

  .train-page::-webkit-scrollbar {
    display: none;
  }

  /* Each station fills the screen and snaps into place */
  .station {
    height: 100dvh; /* mobile + web-friendly */
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    justify-content: flex-start; /* left-aligned, editorial feel */
    padding: 0 4rem;
  }

  .station-content {
    max-width: 640px;
    padding-left: 3rem;
  }

  @media (min-width: 768px) {
    .station-content {
      padding-left: 9rem;
    }
  }

  .station-label {
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.4;
    margin-bottom: 1rem;
  }

  /* Horizontal scroll track for showcase cards */
  .showcase-track {
    display: flex;
    gap: 1.5rem;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    padding-bottom: 1rem;
    scrollbar-width: none;
  }

  .showcase-track::-webkit-scrollbar {
    display: none;
  }

  .showcase-card {
    min-width: 320px;
    scroll-snap-align: start;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 2rem;
    flex-shrink: 0;
  }

  .card-tag {
    font-family: monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.4;
    margin-bottom: 0.5rem;
  }

  .read-more {
    display: inline-block;
    margin-top: 1.5rem;
    font-family: monospace;
    font-size: 0.85rem;
    text-decoration: none;
    color: #7930ff;
  }

  .read-more:hover {
    opacity: 0.7;
  }


  
  .images {
    position: relative;
    width: 450px;
    height: 200px;
  }

  .images img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease-in-out;
  }

  .images .top:hover {
    opacity: 0;
  }

</style>