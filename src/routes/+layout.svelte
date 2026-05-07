<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { fade, fly } from "svelte/transition";
	import ThreeBG from "$lib/ThreeBG.svelte";
	import { page } from "$app/stores";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThreeBG />

<nav class="nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main class="page-wrapper">
	{#key $page.url.pathname}
	
	<div class= "transition" in:fade={{ delay: 200, duration: 400 }} out:fade={{ delay:200, duration: 400 }}>
		{@render children()}
	</div>

	<!--
	<div class= "transition" in:fly={{ delay: 200, y: 10, duration: 250 }}  out:fade={{ delay:200, duration: 150 }}>
		{@render children()}
	</div>
	-->

	<!--
	<div class= "transition" in:fly={{ y: 20, duration: 300 }} out:fly={{ y: -10, duration: 150 }}>
		{@render children()}
	</div>
-->
	{/key}

</main>

<style>

	.nav {
		display: flex;
		gap: 2rem;
		padding: 1.5rem 2rem;
		font-weight: 600;
		background-color: blue;
	}

	main {
		/*padding: 2rem;*/
		max-width: 1100px;
		margin: auto;
		/*background-color: red;*/
		/*backdrop-filter: blur(6px);*/
	}

	a {
		text-decoration: none;
		color: black;
	}

	a:hover {
		opacity: 0.6;
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


