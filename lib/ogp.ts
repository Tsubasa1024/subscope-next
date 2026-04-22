export type OgpData = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  domain: string;
};

export async function fetchOgp(url: string): Promise<OgpData> {
  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SUBSCOPEBot/1.0)" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { title: null, description: null, image: null, siteName: null, domain };

    const html = await res.text();

    const getOg = (prop: string): string | null => {
      const m =
        html.match(new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']*)["']`, "i")) ??
        html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${prop}["']`, "i"));
      return m?.[1] ?? null;
    };

    const title =
      getOg("title") ??
      (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null);

    return {
      title,
      description: getOg("description"),
      image: getOg("image"),
      siteName: getOg("site_name"),
      domain,
    };
  } catch {
    return { title: null, description: null, image: null, siteName: null, domain };
  }
}
