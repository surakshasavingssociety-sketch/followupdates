import type { APIRoute } from "astro";
import { institutionDatabase } from "../lib/institutions";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(institutionDatabase), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
