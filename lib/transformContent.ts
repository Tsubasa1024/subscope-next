import { fetchOgp } from "./ogp";

// <p> の中身がリンク1つだけの場合にマッチ（スタンドアロンリンク）
const STANDALONE_LINK = /<p>\s*<a\s[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>\s*<\/p>/gi;

function cleanupHtml(html: string): string {
  let s = html;
  s = s.replace(/<p>\s*<\/p>/gi, "");
  s = s.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");
  s = s.replace(/<(h[2-4])([^>]*)>\s*<strong>([\s\S]*?)<\/strong>\s*<\/\1>/gi, "<$1$2>$3</$1>");
  return s;
}

function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCard(url: string, title: string, description: string | null, image: string | null, domain: string): string {
  const globe = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

  return `<div class="link-card"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="link-card-inner">${
    image ? `<div class="link-card-thumb"><img src="${escapeAttr(image)}" alt="${escapeAttr(title)}" /></div>` : ""
  }<div class="link-card-body"><div class="link-card-title">${title}</div>${
    description ? `<div class="link-card-desc">${description}</div>` : ""
  }<div class="link-card-domain">${globe}${domain}</div></div></a></div>`;
}

export async function transformContent(html: string): Promise<string> {
  const cleaned = cleanupHtml(html);

  const matches = [...cleaned.matchAll(STANDALONE_LINK)];
  if (matches.length === 0) return cleaned;

  const ogpResults = await Promise.all(
    matches.map(([, url]) => fetchOgp(url).catch(() => null))
  );

  let result = cleaned;
  for (let i = 0; i < matches.length; i++) {
    const [fullMatch, url, linkText] = matches[i];
    const ogp = ogpResults[i];
    if (!ogp) continue;

    const title = ogp.title ?? linkText ?? url;
    result = result.replace(fullMatch, buildCard(url, title, ogp.description, ogp.image, ogp.domain));
  }

  return result;
}
