import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function load() {
  const dir = path.join(process.cwd(), "content/case-studies");
  const files = fs.readdirSync(dir);

  const caseStudies = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return data;
    })
    // Sort by year descending so newest work appears first.
    // Falls back to alphabetical by title if year is missing.
    .sort((a, b) => {
      if (a.year && b.year) return Number(b.year) - Number(a.year);
      return (a.title ?? '').localeCompare(b.title ?? '');
    });

  return { caseStudies };
}