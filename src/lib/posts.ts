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
}

export interface Post extends PostMeta {
  content: string;
}

function parseFile(filePath: string): Post {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    date: data.date as string,
    locale: data.locale as Locale,
    title: data.title as string,
    storyCount: (data.storyCount as number) ?? 3,
    briefCount: (data.briefCount as number) ?? 0,
    sourceCount: (data.sourceCount as number) ?? 0,
    content,
  };
}

export function listPosts(locale: Locale): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(`.${locale}.md`));

  return files
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(postsDir, f), "utf-8"));
      return {
        date: data.date as string,
        locale: data.locale as Locale,
        title: data.title as string,
        storyCount: (data.storyCount as number) ?? 3,
        briefCount: (data.briefCount as number) ?? 0,
        sourceCount: (data.sourceCount as number) ?? 0,
      };
    })
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
