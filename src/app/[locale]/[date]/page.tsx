import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getPost, allPostDates } from "@/lib/posts";
import { markdownToSafeHtml } from "@/lib/markdown";

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
      <div className="mb-8">
        <div className="text-xs text-neutral-400 uppercase tracking-wide mb-2">
          {formatDate(post.date, locale as Locale)}
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>{post.storyCount} {strings.storiesLabel}</span>
          <span>{post.sourceCount} {strings.sources}</span>
          <Link href={`/${otherLocale}/${date}`} className="hover:text-neutral-700 ml-auto">
            {strings.langLabel}
          </Link>
        </div>
      </div>

      <div
        className="prose prose-sm prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-10 pt-6 border-t border-neutral-100">
        <Link href={`/${locale}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back to all digests
        </Link>
      </div>
    </article>
  );
}
