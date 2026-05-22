export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const t: Record<Locale, Record<string, string>> = {
  en: {
    siteTitle: "AI Digest",
    tagline: "The AI-curated AI briefing",
    subtagline: "20+ sources. 3 stories. 5 minutes.",
    methodology: "Methodology",
    search: "Search",
    archive: "Archive",
    rss: "RSS",
    privacy: "Privacy",
    whatsNew: "What's New",
    subscribe: "Subscribe",
    subscribeDesc: "Systematic AI intel. No editors. No sponsors.",
    sources: "sources curated",
    storiesLabel: "stories",
    footerBy: "by",
    noPostsYet: "No digests yet. Check back tomorrow.",
    methodologyTitle: "Methodology",
    langLabel: "中文",
    langHref: "/zh",
  },
  zh: {
    siteTitle: "AI 日报",
    tagline: "AI 精选 AI 简报",
    subtagline: "20+ 个来源，3 个故事，5 分钟速览。",
    methodology: "方法论",
    search: "搜索",
    archive: "归档",
    rss: "RSS",
    privacy: "隐私政策",
    whatsNew: "更新日志",
    subscribe: "订阅",
    subscribeDesc: "系统化 AI 情报，无编辑，无赞助。",
    sources: "个来源",
    storiesLabel: "篇报道",
    footerBy: "作者",
    noPostsYet: "暂无内容，明日再来。",
    methodologyTitle: "方法论",
    langLabel: "English",
    langHref: "/en",
  },
};
