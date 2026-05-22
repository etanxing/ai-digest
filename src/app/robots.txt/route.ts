export const dynamic = "force-static";

const SITE_URL = "https://ai-digest.isawesome.work";

export async function GET(): Promise<Response> {
  const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
