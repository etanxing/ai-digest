import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

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
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{strings.tagline}</h1>
        <p className="text-neutral-500 text-sm">{strings.subtagline}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-neutral-400">{strings.noPostsYet}</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.date} className="border-b border-neutral-100 pb-8">
              <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wide">
                {formatDate(post.date, locale as Locale)}
              </div>
              <Link
                href={`/${locale}/${post.date}`}
                className="block group"
              >
                <h2 className="text-base font-semibold group-hover:underline mb-1">
                  {post.title}
                </h2>
              </Link>
              <p className="text-xs text-neutral-400 mt-2">
                {post.sourceCount} {strings.sources}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
