import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const strings = t[locale as Locale];
  return {
    title: strings.siteTitle,
    description: strings.subtagline,
    openGraph: {
      title: strings.siteTitle,
      description: strings.subtagline,
      url: `https://ai-digest.isawesome.work/${locale}`,
      siteName: "AI Digest",
      type: "website",
    },
    alternates: {
      canonical: `https://ai-digest.isawesome.work/${locale}`,
      languages: { en: "/en", zh: "/zh" },
    },
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function formatDate(dateStr: string, locale: Locale) {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const strings = t[locale as Locale];
  const posts = listPosts(locale as Locale);

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{strings.tagline}</h1>
        <p className="text-base" style={{ color: "var(--muted)" }}>
          {strings.subtagline}
        </p>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "var(--subtle)" }}>{strings.noPostsYet}</p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <article key={post.date}>
              <Link
                href={`/${locale}/${post.date}`}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5 px-4 py-4 -mx-4 rounded-lg transition-colors"
                style={{ ["--hover-bg" as string]: "var(--surface)" }}
                onMouseEnter={undefined}
              >
                <span
                  className="text-xs font-medium tabular-nums shrink-0 pt-0.5"
                  style={{ color: "var(--subtle)" }}
                >
                  {formatDate(post.date, locale as Locale)}
                </span>
                <span className="flex-1">
                  <span
                    className="font-semibold text-base group-hover:underline underline-offset-2"
                    style={{ color: "var(--fg)" }}
                  >
                    {post.title}
                  </span>
                  <span className="text-xs ml-3" style={{ color: "var(--subtle)" }}>
                    {post.sourceCount} {strings.sources}
                  </span>
                </span>
              </Link>
              <div className="h-px mx-0" style={{ background: "var(--border)" }} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
