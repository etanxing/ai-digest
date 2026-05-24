import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "zh" ? "全部存档 — AI 日报" : "Archive — AI Digest",
  };
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

function monthKey(dateStr: string, locale: Locale) {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const strings = t[locale as Locale];
  const posts = listPosts(locale as Locale);

  // Group by month
  const groups: { month: string; posts: typeof posts }[] = [];
  for (const post of posts) {
    const month = monthKey(post.date, locale as Locale);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.posts.push(post);
    } else {
      groups.push({ month, posts: [post] });
    }
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "var(--subtle)" }}>
          {locale === "zh" ? "所有期刊" : "All issues"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {locale === "zh" ? "存档" : "Archive"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {posts.length} {locale === "zh" ? "期" : "issues"}
        </p>
      </div>

      <div className="space-y-10">
        {groups.map(({ month, posts: monthPosts }) => (
          <section key={month}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--subtle)" }}>
              {month}
            </h2>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {monthPosts.map((post) => (
                <div key={post.date} className="py-4">
                  <p className="text-xs mb-1" style={{ color: "var(--subtle)" }}>
                    {formatDate(post.date, locale as Locale)}
                  </p>
                  <Link
                    href={`/${locale}/${post.slug}`}
                    className="group block"
                  >
                    <h3 className="text-base font-semibold group-hover:underline underline-offset-2 leading-snug mb-2" style={{ color: "var(--fg)" }}>
                      {post.title}
                    </h3>
                  </Link>
                  {post.stories.length > 0 && (
                    <ul className="space-y-0.5">
                      {post.stories.map((story, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-xs font-bold shrink-0 mt-0.5 w-4" style={{ color: "var(--accent)" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xs leading-snug" style={{ color: "var(--muted)" }}>
                            {story}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs mt-2" style={{ color: "var(--subtle)" }}>
                    {post.sourceCount} {strings.sources}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href={`/${locale}`} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--muted)" }}>
          ← {locale === "zh" ? "返回首页" : "Back to latest"}
        </Link>
      </div>
    </div>
  );
}
