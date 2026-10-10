import { createHash } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * CORS configuration for DiArMaqAr API
 * Allows cross-origin requests for scholarly and research use
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Headers every API response carries, whatever its status.
 *
 * - Link: advertises the machine-readable OpenAPI spec so a tool inspecting a
 *   response can auto-discover the full contract (RFC 8631 rel="service-desc").
 * - Netlify-Vary: query makes every query parameter part of Netlify's cache key.
 *   Without it the Next.js runtime keys only on `_rsc` and `__nextDataReq`, so
 *   `?tuningSystem=a` and `?tuningSystem=b` would share one cached response.
 *   Netlify requires the same value on every response for a URL, errors included.
 */
const apiResponseHeaders = {
  ...corsHeaders,
  "X-Content-Type-Options": "nosniff",
  Link: '<https://diarmaqar.net/openapi.json>; rel="service-desc"; type="application/json"',
  "Netlify-Vary": "query",
};

/**
 * Cache policy for successful API responses.
 *
 * The data (data/*.json) changes only with a deploy, so one URL returns the
 * same body until the next deploy, and every deploy purges Netlify's cache.
 * - Netlify's edge (and its shared durable cache) keeps the response for a
 *   year, which in practice means until the next deploy.
 * - Browsers and other clients store it but revalidate every time with the
 *   ETag, so they never hold a response from an older deploy.
 */
const successCacheHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": "public, max-age=31536000, durable",
};

/** Any status other than 200 (errors, write results) is never stored anywhere. */
const noStoreCacheHeaders = {
  "Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};

/**
 * Handle preflight OPTIONS requests
 */
export function handleCorsPreflightRequest() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/** True when an If-None-Match header names this ETag (weak comparison). */
function ifNoneMatchHits(ifNoneMatch: string, etag: string): boolean {
  const opaque = (tag: string) => tag.trim().replace(/^W\//, "");
  return ifNoneMatch
    .split(",")
    .some((tag) => tag.trim() === "*" || opaque(tag) === opaque(etag));
}

/**
 * Apply the shared API response policy: CORS, the OpenAPI discovery link,
 * and caching. Every API route returns through this, so it is the one place
 * that sets these headers.
 *
 * A 200 gets the cacheable policy and a weak ETag hashed from its body; when
 * the request's If-None-Match names that ETag, a bodiless 304 is returned
 * instead. Any other status gets no-store.
 */
export async function addCorsHeaders(response: NextResponse): Promise<NextResponse> {
  Object.entries(apiResponseHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (response.status !== 200) {
    Object.entries(noStoreCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const body = await response.clone().arrayBuffer();
  const etag = `W/"${createHash("sha1").update(Buffer.from(body)).digest("base64url")}"`;
  response.headers.set("ETag", etag);
  Object.entries(successCacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const ifNoneMatch = (await headers()).get("if-none-match");
  if (ifNoneMatch !== null && ifNoneMatchHits(ifNoneMatch, etag)) {
    // The 304 repeats the 200's validators and client policy but is never
    // stored at the edge: If-None-Match is not part of the cache key, so a
    // stored bodiless 304 would be served to clients that asked for the body.
    return new NextResponse(null, {
      status: 304,
      headers: {
        ...apiResponseHeaders,
        ETag: etag,
        "Cache-Control": successCacheHeaders["Cache-Control"],
        "Netlify-CDN-Cache-Control": "no-store",
      },
    });
  }

  return response;
}
