import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const strings = t[locale as Locale];

  return (
    <div
      className="min-h-screen antialiased flex flex-col"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Accent top bar */}
      <div className="h-[3px]" style={{ background: "var(--accent)" }} />

      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <nav className="max-w-3xl mx-auto px-5 py-3.5 flex items-center gap-5">
          <Link
            href={`/${locale}`}
            className="font-bold tracking-tight text-base mr-auto flex items-center gap-2.5"
            style={{ color: "var(--fg)" }}
          >
            AI Digest
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full hidden sm:inline"
              style={{
                background: "var(--surface)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Daily Briefing
            </span>
          </Link>
          <Link
            href={`/${locale}/methodology`}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            {strings.methodology}
          </Link>
          <Link
            href={locale === "en" ? "/zh" : "/en"}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            {strings.langLabel}
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 w-full flex-1">
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="max-w-3xl mx-auto px-5 py-5 text-xs flex flex-wrap gap-5"
          style={{ color: "var(--subtle)" }}
        >
          <Link href={`/${locale}`} className="hover:opacity-70 transition-opacity">
            Archive
          </Link>
          <Link href={`/${locale}/methodology`} className="hover:opacity-70 transition-opacity">
            {strings.methodology}
          </Link>
          <Link href={`/${locale}/rss.xml`} className="hover:opacity-70 transition-opacity">
            RSS
          </Link>
          <span className="ml-auto">AI-curated · No sponsors</span>
        </div>
      </footer>
    </div>
  );
}
