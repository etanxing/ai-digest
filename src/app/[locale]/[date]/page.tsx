import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getPost, listPosts } from "@/lib/posts";
import { markdownToSafeHtml, transformDigestHtml } from "@/lib/markdown";
import ShareBar from "@/components/ShareBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isLocale(locale)) return {};
  const postDate = date.slice(0, 10);
  const post = getPost(postDate, locale as Locale);
  if (!post) return {};
  const url = `https://ai-digest.isawesome.work/${locale}/${post.slug}`;
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
      languages: { en: `/en/${post.slug}`, zh: `/zh/${post.slug}` },
    },
  };
}

export async function generateStaticParams() {
  const params: { locale: string; date: string }[] = [];
  for (const locale of locales) {
    for (const post of listPosts(locale as Locale)) {
      params.push({ locale, date: post.date });
      params.push({ locale, date: post.slug });
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

function formatDateShort(dateStr: string, locale: Locale) {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
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
  const postDate = date.slice(0, 10);
  const post = getPost(postDate, locale as Locale);
  if (!post) notFound();
  const strings = t[locale as Locale];

  const rawHtml = await markdownToSafeHtml(post.content);
  const html = transformDigestHtml(rawHtml, post.storyCount);

  const otherLocale = locale === "en" ? "zh" : "en";
  const otherPost = getPost(postDate, otherLocale as Locale);

  // Continue reading: up to 3 previous posts
  const allPosts = listPosts(locale as Locale);
  const currentIdx = allPosts.findIndex((p) => p.date === post.date);
  const continueReading = allPosts.slice(currentIdx + 1, currentIdx + 4);

  const shareUrl = `https://ai-digest.isawesome.work/${locale}/${post.slug}`;

  return (
    <article>
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "var(--subtle)" }}>
          {formatDate(post.date, locale as Locale)}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-5">
          {post.title}
        </h1>

        {/* Story TOC */}
        {post.stories.length > 0 && (
          <ul className="mb-5 space-y-2">
            {post.stories.map((story, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <li key={i}>
                  <a
                    href={`#story-${num}`}
                    className="flex items-start gap-2.5 group hover:opacity-70 transition-opacity"
                  >
                    <span className="text-xs font-bold mt-0.5 shrink-0 w-5" style={{ color: "var(--accent)" }}>
                      {num}
                    </span>
                    <span className="text-sm leading-snug" style={{ color: "var(--muted)" }}>
                      {story}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm pt-4"
          style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}
        >
          <span>{post.storyCount} {strings.storiesLabel}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{post.sourceCount} {strings.sources}</span>
          {otherPost && (
            <Link
              href={`/${otherLocale}/${otherPost.slug}`}
              className="ml-auto hover:opacity-70 transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              {strings.langLabel}
            </Link>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="prose prose-neutral max-w-none"
        style={{ "--tw-prose-links": "var(--accent)" } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* ── Share ── */}
      <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <ShareBar url={shareUrl} title={post.title} />
      </div>

      {/* ── Continue reading ── */}
      {continueReading.length > 0 && (
        <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: "var(--subtle)" }}>
            {locale === "zh" ? "继续阅读" : "Continue reading"}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {continueReading.map((p) => (
              <Link
                key={p.date}
                href={`/${locale}/${p.slug}`}
                className="group block p-4 rounded-lg transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs mb-1.5" style={{ color: "var(--subtle)" }}>
                  {formatDateShort(p.date, locale as Locale)}
                </p>
                <p className="text-sm font-semibold leading-snug group-hover:underline underline-offset-2" style={{ color: "var(--fg)" }}>
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── View all archives ── */}
      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted)" }}
        >
          ← {locale === "zh" ? "返回" : "Back"}
        </Link>
        <Link
          href={`/${locale}/archive`}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted)" }}
        >
          {locale === "zh" ? "查看全部存档 →" : "View all archives →"}
        </Link>
      </div>
    </article>
  );
}
