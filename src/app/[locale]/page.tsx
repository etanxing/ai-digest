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
  const allPosts = listPosts(locale as Locale);
  const posts = allPosts.slice(0, 14);

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
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {posts.map((post) => (

            <article key={post.date} className="py-7">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--subtle)" }}
              >
                {formatDate(post.date, locale as Locale)}
              </p>
              <Link
                href={`/${locale}/${post.slug}`}
                className="group block mb-3"
              >
                <h2
                  className="text-lg font-bold tracking-tight group-hover:underline underline-offset-2 leading-snug"
                  style={{ color: "var(--fg)" }}
                >
                  {post.title}
                </h2>
              </Link>
              {post.stories.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {post.stories.map((story, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="text-xs font-semibold shrink-0 mt-0.5 w-4"
                        style={{ color: "var(--accent)" }}
                      >
                        {i + 1}.
                      </span>
                      <span className="text-sm leading-snug" style={{ color: "var(--muted)" }}>
                        {story}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs" style={{ color: "var(--subtle)" }}>
                {post.sourceCount} {strings.sources}
              </p>
            </article>
          ))}
        </div>
      )}

      {allPosts.length > 14 && (
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href={`/${locale}/archive`}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: "var(--muted)" }}
          >
            {locale === "zh" ? "查看全部存档 →" : "View all archives →"}
          </Link>
        </div>
      )}
    </div>
  );
}
