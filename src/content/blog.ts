import type { Article } from "@/types/article";
import { isLang } from "@/i18n/routing";

// Blog articles written in the code: one Markdown file per article and per language in ./blog/.
// Frontmatter keys mirror the `articles` table; `published: false` keeps a file as a draft.
// They are merged with the articles stored in Supabase (see useArticles.ts); on a slug clash
// the file wins. scripts/generate-sitemap.cjs reads the same files.

const files = import.meta.glob<string>("./blog/*.md", { query: "?raw", import: "default", eager: true });

/** "key: value" lines between --- markers; quoted values are JSON strings. */
function parse(raw: string, file: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Frontmatter manquant dans ${file}`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const value = line.slice(separator + 1).trim();
    meta[line.slice(0, separator).trim()] = value.startsWith('"') ? JSON.parse(value) : value;
  }
  return { meta, content: match[2].trim() };
}

export const FILE_ARTICLES: Article[] = Object.entries(files)
  .map(([file, raw]) => {
    const { meta, content } = parse(raw, file);
    const date = new Date(`${meta.date}T09:00:00Z`).toISOString();
    return {
      id: `file:${meta.slug}`,
      slug: meta.slug,
      lang: isLang(meta.lang) ? meta.lang : "fr",
      translation_key: meta.translation_key || null,
      category: meta.category as Article["category"],
      title: meta.title,
      meta_title: meta.meta_title,
      meta_description: meta.meta_description,
      excerpt: meta.excerpt,
      image_url: meta.image_url || undefined,
      content,
      est_publie: meta.published !== "false",
      created_at: date,
      updated_at: meta.updated ? new Date(`${meta.updated}T09:00:00Z`).toISOString() : date,
    };
  })
  .filter((article) => article.est_publie);

/** Database articles plus file articles, newest first; a file replaces a database row with the same slug. */
export function withFileArticles(fromDb: Article[], keep: (article: Article) => boolean) {
  const fileSlugs = new Set(FILE_ARTICLES.map((article) => article.slug));
  return [...fromDb.filter((article) => !fileSlugs.has(article.slug)), ...FILE_ARTICLES.filter(keep)]
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const FAQ_HEADINGS = ["Questions fréquentes", "Frequently asked questions", "Preguntas frecuentes"];

/** Questions of the "## Questions fréquentes" section of an article (### question, then its answer). */
export function articleFaq(content: string): { q: string; a: string }[] {
  const start = content.split(/\r?\n/).findIndex((line) => FAQ_HEADINGS.includes(line.replace(/^##\s+/, "").trim()) && line.startsWith("## "));
  if (start < 0) return [];
  const lines = content.split(/\r?\n/).slice(start + 1);
  const end = lines.findIndex((line) => line.startsWith("## "));
  const items: { q: string; a: string }[] = [];
  for (const line of end < 0 ? lines : lines.slice(0, end)) {
    if (line.startsWith("### ")) items.push({ q: line.slice(4).trim(), a: "" });
    else if (items.length && line.trim()) items[items.length - 1].a += (items[items.length - 1].a ? " " : "") + line.trim();
  }
  // Structured data carries plain text: drop Markdown links and emphasis.
  const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1");
  return items.filter((item) => item.a).map((item) => ({ q: item.q, a: plain(item.a) }));
}

/** Articles under this word count are kept out of search results (noindex) and of the sitemap. */
export const THIN_ARTICLE_WORDS = 300;
export const isThinArticle = (content: string) => content.split(/\s+/).filter((word) => /\p{L}/u.test(word)).length < THIN_ARTICLE_WORDS;
