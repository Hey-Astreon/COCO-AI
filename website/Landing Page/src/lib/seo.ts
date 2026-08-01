export const SITE_URL = "https://coco-ai-cyan.vercel.app";
export const OG_IMAGE_URL = `${SITE_URL}/real_cocoai_ui_preview.webp`;

interface SeoOptions {
  title: string;
  description: string;
  path: string;
}

/**
 * Builds the TanStack Router `head()` payload for a page: document title,
 * description, canonical URL, Open Graph, and Twitter card tags.
 */
export function seoHead({ title, description, path }: SeoOptions) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:site_name", content: "CocoAI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
