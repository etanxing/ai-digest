import { notFound } from "next/navigation";
import { isLocale, t, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const content: Record<Locale, { title: string; body: React.ReactNode }> = {
  en: {
    title: "Methodology",
    body: (
      <>
        <p>
          AI Digest is a daily briefing that curates AI industry news from 20+ sources. It is closer to a wire service than a magazine — content is algorithmically selected and AI-written, with human supervision of rules rather than content.
        </p>
        <h2>How it works</h2>
        <h3>Source collection</h3>
        <p>
          The system monitors company blogs (OpenAI, Anthropic, Google AI, DeepMind, Meta, NVIDIA), tech media (MIT Technology Review, TechCrunch, The Verge), research communities (Hacker News, HuggingFace), and industry newsletters via RSS.
        </p>
        <h3>Two-stage selection</h3>
        <ol>
          <li>
            <strong>Algorithmic scoring</strong> — each item is scored on cross-source corroboration, community engagement, source authority, and recency.
          </li>
          <li>
            <strong>AI editorial</strong> — a language model selects 3 feature stories plus brief news items from the top-scored candidates, considering domain variety and avoiding repetition.
          </li>
        </ol>
        <h3>Writing</h3>
        <p>
          Selected stories are written by a language model and linked back to original sources. The system targets a 5-minute read time.
        </p>
        <h2>Principles</h2>
        <ul>
          <li>Humans tune the algorithm, never touch the content.</li>
          <li>Every claim links to an original source.</li>
          <li>No editorial agenda, no sponsors.</li>
        </ul>
        <h2>Cadence</h2>
        <p>Published daily by 09:00 UTC. Available in English and Chinese.</p>
      </>
    ),
  },
  zh: {
    title: "方法论",
    body: (
      <>
        <p>
          AI 日报是一份每日简报，从 20 多个来源策划 AI 行业资讯。它更像通讯社而非杂志——内容由算法筛选、AI 撰写，人工只负责调整规则，不干预具体内容。
        </p>
        <h2>工作原理</h2>
        <h3>来源收集</h3>
        <p>
          系统通过 RSS 监控公司博客（OpenAI、Anthropic、Google AI、DeepMind、Meta、NVIDIA）、科技媒体（MIT 技术评论、TechCrunch、The Verge）、研究社区（Hacker News、HuggingFace）及行业通讯。
        </p>
        <h3>两阶段筛选</h3>
        <ol>
          <li>
            <strong>算法评分</strong> — 每条内容按跨来源佐证、社区参与度、来源权威性和时效性综合评分。
          </li>
          <li>
            <strong>AI 编辑</strong> — 语言模型从高分候选中挑选 3 篇重点报道及若干简讯，兼顾领域多样性并避免重复。
          </li>
        </ol>
        <h3>撰写</h3>
        <p>
          经筛选的报道由语言模型撰写，并附原始来源链接。目标阅读时长为 5 分钟。
        </p>
        <h2>原则</h2>
        <ul>
          <li>人工调整算法规则，不干预内容。</li>
          <li>每项声明均附原始来源链接。</li>
          <li>无编辑立场，无赞助商。</li>
        </ul>
        <h2>更新频率</h2>
        <p>每日北京时间 17:00 前发布，提供中英双语版本。</p>
      </>
    ),
  },
};

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = content[locale as Locale];
  const strings = t[locale as Locale];

  return (
    <div>
      <div className="mb-8">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-3"
          style={{ color: "var(--subtle)" }}
        >
          {strings.methodology}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{page.title}</h1>
      </div>
      <div className="prose prose-neutral max-w-none">
        {page.body}
      </div>
    </div>
  );
}
