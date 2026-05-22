export const dynamic = "force-static";

import { locales } from "@/lib/i18n";
import { allPostDates } from "@/lib/posts";

const SITE_URL = "https://ai-digest.isawesome.work";

export async function GET(): Promise<Response> {
  const dates = allPostDates();

  const staticUrls = locales.flatMap((locale) => [
    `  <url><loc>${SITE_URL}/${locale}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${SITE_URL}/${locale}/methodology</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ]);

  const postUrls = locales.flatMap((locale) =>
    dates.map(
      (date) =>
        `  <url><loc>${SITE_URL}/${locale}/${date}</loc><lastmod>${date}</lastmod><changefreq>never</changefreq><priority>0.8</priority></url>`
    )
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...postUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

export async function generateStaticParams() {
  return [];
}
