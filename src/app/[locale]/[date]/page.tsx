import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getPost, allPostDates } from "@/lib/posts";
import { markdownToSafeHtml } from "@/lib/markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(date, locale as Locale);
  if (!post) return {};
  const url = `https://ai-digest.isawesome.work/${locale}/${date}`;
  return {
    title: `${post.title} — AI Digest`,
    description: `${post.storyCount} stories curated from ${post.sourceCount} sources.`,
    openGraph: {
      title: post.title,
      description: `${post.storyCount} stories curated from ${post.sourceCount} sources.`,
      url,
      siteName: "AI Digest",
      type: "article",
      publishedTime: post.date,
    },
    alternates: {
      canonical: url,
      languages: {
        en: `/en/${date}`,
        zh: `/zh/${date}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const dates = allPostDates();
  const params: { locale: string; date: string }[] = [];
  for (const locale of locales) {
    for (const date of dates) {
      params.push({ locale, date });
    }
  }
  return params;
}

function formatDate(dateStr: string, locale: Locale) {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(date, locale as Locale);
  if (!post) notFound();
  const strings = t[locale as Locale];
  const html = await markdownToSafeHtml(post.content);

  const otherLocale = locale === "en" ? "zh" : "en";

  return (
    <article>
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-3"
          style={{ color: "var(--subtle)" }}
        >
          {formatDate(post.date, locale as Locale)}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-5">
          {post.title}
        </h1>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm pt-4"
          style={{
            color: "var(--muted)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span>{post.storyCount} {strings.storiesLabel}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{post.sourceCount} {strings.sources}</span>
          <Link
            href={`/${otherLocale}/${date}`}
            className="ml-auto hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            {strings.langLabel}
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="prose prose-neutral max-w-none" style={{ "--tw-prose-links": "var(--accent)" } as React.CSSProperties}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Footer nav */}
      <div
        className="mt-12 pt-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <Link
          href={`/${locale}`}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted)" }}
        >
          ← Back to all digests
        </Link>
      </div>
    </article>
  );
}
