import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function load({ params }) {
  const filePath = path.join(
    process.cwd(),
    "content/case-studies",
    `${params.slug}.md`
  );

  const file = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(file);

  return {
    meta: data,
    content
  };
}
