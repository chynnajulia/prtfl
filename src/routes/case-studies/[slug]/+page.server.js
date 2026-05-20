import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const filePath = path.join(
    process.cwd(),
    "content/case-studies",
    `${params.slug}.md`
  );

  // Return a clean 404 if the slug doesn't match any file
  if (!fs.existsSync(filePath)) {
    throw error(404, `Case study "${params.slug}" not found.`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // marked() converts the markdown body to an HTML string.
  // We'll render it with {@html} in the page component.
  const body = await marked(content);

  return {
    meta: data,   // frontmatter: title, slug, image, role, year, type, etc.
    body,         // rendered HTML string of the markdown body
  };
}