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
      "strong", "em", "a", "code", "pre", "br",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    FORCE_BODY: true,
  });
}
