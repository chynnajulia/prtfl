<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import { fade } from "svelte/transition";
  import ThreeBG from "$lib/ThreeBG.svelte";
  import TopNav from "$lib/TopNav.svelte";
  import TrainNav from "$lib/TrainNav.svelte";
  import { page } from "$app/stores";
  import "../app.css";

  let { children } = $props();

  // Top navbar height in px — used to offset page content so
  // nothing hides behind the fixed navbar
  const NAV_HEIGHT = 64;
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ThreeBG />
<TopNav />
<TrainNav />

<main class="page-wrapper" style="padding-top: {NAV_HEIGHT}px">
  {#key $page.url.pathname}
    <div
      class="transition"
      in:fade={{ delay: 200, duration: 400 }}
      out:fade={{ delay: 200, duration: 400 }}
    >
      {@render children()}
    </div>
  {/key}
</main>

<style>
  main {
    max-width: 1100px;
    margin: auto;
  }

  .page-wrapper {
    position: relative;
    min-height: 80vh;
  }

  .transition {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }

</style>