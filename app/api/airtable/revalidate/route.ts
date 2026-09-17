import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/** Webhook target for an Airtable automation ("When a record is created or
 *  updated in Responses -> Run a script / Send webhook"). It purges the "kpi"
 *  cache tag so the next visitor re-fetches Airtable and sees the new form
 *  submission. Guarded by a shared secret so only Airtable can trigger it.
 *
 *  The secret may be sent either as the `x-airtable-secret` header or a
 *  `?secret=` query param (Airtable's simpler webhook actions can only append
 *  query params). Both GET and POST are accepted for the same reason. */
async function handle(request: NextRequest): Promise<Response> {
  const expected = process.env.AIRTABLE_REVALIDATE_SECRET;
  if (!expected) {
    return Response.json(
      { ok: false, message: "AIRTABLE_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const provided =
    request.headers.get("x-airtable-secret") ?? request.nextUrl.searchParams.get("secret");

  if (provided !== expected) {
    return Response.json({ ok: false, message: "Invalid secret" }, { status: 401 });
  }

  // Invalidation comes from outside a Server Action (a webhook), so per the
  // Next.js docs use { expire: 0 } to expire the tagged data immediately.
  revalidateTag("kpi", { expire: 0 });

  return Response.json({ ok: true, revalidated: true, now: Date.now() });
}

export async function POST(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function GET(request: NextRequest): Promise<Response> {
  return handle(request);
}
