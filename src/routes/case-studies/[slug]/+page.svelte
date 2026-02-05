<script>
  import { marked } from "marked";
  export let data;

  const html = marked.parse(data.content);
</script>

<div class="page">
  <article>
    <h1>{data.meta.title}</h1>
    <p class="desc">{data.meta.description}</p>

    {#if data.meta.hero}
      <img src={data.meta.hero} alt="" />
    {/if}

    <div class="content">{@html html}</div>
  </article>
</div>

<style>
  article {
    /*max-width: 800px;*/
    margin: auto;
  }

  img {
    width: 100%;
    border-radius: 16px;
    margin: 2rem 0;
  }

  /*
  .content :global(h2) {
    margin-top: 3rem;
  }
  */
</style>
