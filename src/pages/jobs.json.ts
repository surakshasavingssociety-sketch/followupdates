import type { APIRoute } from "astro";
import { jobs } from "../lib/jobs";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(jobs), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
