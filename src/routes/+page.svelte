<script>
  export let data;
</script>

<div class="page">
    <h1>Hi, I’m Chynna Julia 👋</h1>
    <p class="subtitle">
    A UX Designer & Creative Developer crafting thoughtful digital experiences.
    </p>

    <section class="projects">
        {#each data.caseStudies as cs}
            <a
            class="card"
            href={`/case-studies/${cs.slug}`}
            data-sveltekit-preload
            >
            <h2>{cs.title}</h2>
            <p>{cs.description}</p>
            </a>
        {/each}
    </section>
</div>

<style>
    h1 {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    .subtitle {
        color: #666;
        margin-bottom: 3rem;
    }

    .projects {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .card {
        padding: 1.5rem;
        border-radius: 16px;
        border: 1px solid #eee;
        transition: transform 0.2s ease;
    }

    .card:hover {
       transform: translateY(-4px);
    }
</style>