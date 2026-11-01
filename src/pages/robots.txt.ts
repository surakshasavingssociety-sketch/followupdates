import type { APIRoute } from "astro";
import { SITE } from "../lib/constants";

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/

Sitemap: ${SITE.url}/sitemap-index.xml
`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=3600",
      },
    },
  );
