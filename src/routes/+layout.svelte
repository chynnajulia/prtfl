<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<main>
  <!--<slot />-->
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
		margin: 0 auto;
		background-color: red;
	}

	a {
		text-decoration: none;
		color: black;
	}

	a:hover {
		opacity: 0.6;
	}
	
</style>

{@render children()}
