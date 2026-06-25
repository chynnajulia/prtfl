import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // edge: false means standard Node.js functions, not edge runtime.
      // Keep this false — edge has limitations with file system access
      // which your +page.server.js files use (fs, path, gray-matter).
      edge: false
    })
  }
};

export default config;