import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "./i18n";

const postsDir = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  date: string;
  locale: Locale;
  title: string;
  storyCount: number;
  briefCount: number;
  sourceCount: number;
  stories: string[];
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

export function postSlug(date: string, title: string): string {
  return `${date}-${slugify(title)}`;
}

function extractStories(content: string): string[] {
  const matches = content.matchAll(/^##\s+\d+\.\s+(.+)$/gm);
  return Array.from(matches, (m) => m[1].trim()).slice(0, 3);
}

function parseFile(filePath: string): Post {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title as string;
  const date = data.date as string;
  return {
    date,
    locale: data.locale as Locale,
    title,
    storyCount: (data.storyCount as number) ?? 3,
    briefCount: (data.briefCount as number) ?? 0,
    sourceCount: (data.sourceCount as number) ?? 0,
    stories: extractStories(content),
    slug: postSlug(date, title),
    content,
  };
}

export function listPosts(locale: Locale): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(`.${locale}.md`));

  return files
    .map((f) => parseFile(path.join(postsDir, f)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(date: string, locale: Locale): Post | null {
  const filePath = path.join(postsDir, `${date}.${locale}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath);
}

export function allPostDates(): string[] {
  if (!fs.existsSync(postsDir)) return [];
  const dates = new Set<string>();
  fs.readdirSync(postsDir).forEach((f) => {
    const match = f.match(/^(\d{4}-\d{2}-\d{2})\.[a-z]+\.md$/);
    if (match) dates.add(match[1]);
  });
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}
