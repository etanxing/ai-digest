import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, isLocale, t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

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
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <header className="border-b border-neutral-200">
        <nav className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-6 text-sm">
          <Link href={`/${locale}`} className="font-semibold tracking-tight mr-auto">
            {strings.siteTitle}
          </Link>
          <Link href={`/${locale}/methodology`} className="text-neutral-500 hover:text-neutral-900 transition-colors">
            {strings.methodology}
          </Link>
          <Link
            href={locale === "en" ? "/zh" : "/en"}
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {strings.langLabel}
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-neutral-200 mt-16">
        <div className="max-w-2xl mx-auto px-4 py-6 text-xs text-neutral-500 flex flex-wrap gap-4">
          <Link href={`/${locale}`} className="hover:text-neutral-900">Archive</Link>
          <Link href={`/${locale}/methodology`} className="hover:text-neutral-900">{strings.methodology}</Link>
        </div>
      </footer>
    </div>
  );
}
