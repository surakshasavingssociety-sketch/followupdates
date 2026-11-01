import type { APIRoute } from "astro";
import { examDatabase } from "../lib/exams";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(examDatabase), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
