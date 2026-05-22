export const dynamic = "force-static";

import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const SITE_URL = "https://ai-digest.isawesome.work";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const posts = listPosts(locale as Locale).slice(0, 20);

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${locale}/${post.date}`;
      const pubDate = new Date(post.date + "T09:00:00Z").toUTCString();
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.storyCount} stories curated from ${post.sourceCount} sources.]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Digest</title>
    <link>${SITE_URL}/${locale}</link>
    <description>The AI-curated AI briefing. 20+ sources. 3 stories. 5 minutes.</description>
    <language>${locale === "zh" ? "zh-CN" : "en-US"}</language>
    <atom:link href="${SITE_URL}/${locale}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
