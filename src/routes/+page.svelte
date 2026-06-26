<script lang="ts">
  import { onMount } from "svelte";
  import { activeStation } from "$lib/stores";
  import { TextScramble } from "$lib/TextScramble";
  import ShowcaseCarousel from "$lib/ShowcaseCarousel.svelte";

  //import imageN1 from '$lib/assets/normal-1.png';
  //import imageD1 from '$lib/assets/dither-1.gif';

  export let data;

  let sections = [];

  // For Text Scramble
  let roleEl: HTMLElement;
  
  const introScramblePhrases = [
    "UX Designer",
    "Product Designer",
    "Software Developer",
    "Copywriter",
  ];


  onMount(() => {
    // Communicate Active Station to ThreeJS
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeStation.set(sections.indexOf(entry.target));
          }
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((s) => observer.observe(s));


    // ── TextScramble ──
    const fxRole = new TextScramble(roleEl);
    let counterRole = 0;

    const nextRole = () => {
      fxRole.setText(introScramblePhrases[counterRole]).then(() => {
        counterRole = (counterRole + 1) % introScramblePhrases.length;

        //const isName = introScramblePhrases[counter - 1] === "UX Designer";
        //setTimeout(next, isName ? 2000 : 900);

        setTimeout(nextRole, 1500);
      });
    };

    nextRole();


    return () => {
      observer.disconnect();
      fxRole.destroy();
    };

  });
</script>

<div class="train-page">

  <!-- Station 1: Introduction -->
<section class="station" id="station-intro" bind:this={sections[0]}>
  <div class="station-content">
    <p class="station-label">01 · Departure</p>

    <p>Hello, I am</p>
    <h1 class="name glitch-text">Chynna Julia</h1>

    <p class="subheader">I am a <span bind:this={roleEl}>UX Designer</span>.</p>
    <p class="flavor">
      Crafting thoughtful digital experiences —
      somewhere between ink and interface.
    </p>
  </div>
</section>

  <!-- Station 2: Showcase -->
  <section class="station" id="station-showcase" bind:this={sections[1]}>
    <div class="station-content">
      <p class="station-label">02 · Interchange</p>
      <h2>Selected Work</h2>
      <!--
      <div class="images">
        <img class="bottom" src="{imageN1}"/>
        <img class="top" src="{imageD1}"/> 
      </div> -->

      <!-- ShowcaseCarousel receives the full caseStudies array.
           It handles all navigation, animation, and card rendering internally. -->
      <ShowcaseCarousel caseStudies={data.caseStudies} />

    </div>
  </section>

  <!-- Station 3: Contact CTA -->
  <section class="station" id="station-contact" bind:this={sections[2]}>
    <div class="station-content">
      <p class="station-label">03 · Final Stop</p>
      <h2>Let's build something together.</h2>
      <p class="flavor">
        Additional flavor text.
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
    width: 100%;
    height: 100dvh;
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4rem;
  }

  .station-content {
    /*max-width: 720px; /* originally 690px */
    padding-left: 5%;
    /*background-color: red;*/
  }

  /* Desktop - Left Padding */
  @media (min-width: 768px) {
    .station-content { padding-left: 9rem; }
  }

  .station-label {
    /*font-family: monospace;*/
    font-family: "Ubuntu Sans Mono", monospace;
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.4;
    margin-bottom: 1rem;
  }


  h1 { font-size: 3rem; margin-bottom: 0.5rem; }
  h2 { font-size: 2rem; margin-bottom: 1.5rem; }

  .name {
    font-size: 5rem; 
    margin-bottom: -1rem;
  }

  .subheader {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    margin-left: 16rem;
    letter-spacing: 0.05rem;
  }

  .flavor {
    font-size: 1rem;
    color:rgb(110, 110, 156);
    opacity: 0.6;
    line-height: 1.7;
    max-width: 480px;
  }

  .cta-button {
    display: inline-block;
    margin-top: 1.5rem;
    font-family: monospace;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    color: white;
    background: #7930ff;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    transition: opacity 0.2s;
  }
  .cta-button:hover { opacity: 0.8; }


  /* IMAGE TEST */
  
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