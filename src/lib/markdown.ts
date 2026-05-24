import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkBreaks from "remark-breaks";
import DOMPurify from "isomorphic-dompurify";

export async function markdownToSafeHtml(content: string): Promise<string> {
  const processed = await remark()
    .use(remarkBreaks)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return DOMPurify.sanitize(processed.toString(), {
    ALLOWED_TAGS: [
      "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "hr",
      "strong", "em", "a", "code", "pre", "br", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
    FORCE_BODY: true,
  });
}

export function transformDigestHtml(html: string, storyCount: number): string {
  // Story headings: <h2>1. Title</h2> → numbered
  let storyIdx = 0;
  html = html.replace(/<h2>(\d+)\.\s*([\s\S]*?)<\/h2>/g, (_match, _n, title) => {
    storyIdx++;
    const num = String(storyIdx).padStart(2, "0");
    return `<h2 id="story-${num}"><span class="story-num">${num}</span>${title.trim()}</h2>`;
  });

  // Brief items in the "Also today" ul (the ul immediately after the h3)
  // Works for both EN "Also today" and ZH "今日…" headings
  let briefIdx = storyCount;
  html = html.replace(
    /(<h3[^>]*>[\s\S]*?<\/h3>\s*)(<ul>)([\s\S]*?)(<\/ul>)/,
    (_match, h3, ulOpen, items, ulClose) => {
      const numbered = items.replace(/<li>/g, () => {
        briefIdx++;
        const num = String(briefIdx).padStart(2, "0");
        return `<li class="brief-item"><span class="brief-num">${num}</span>`;
      });
      return h3 + ulOpen + numbered + ulClose;
    }
  );

  return html;
}
