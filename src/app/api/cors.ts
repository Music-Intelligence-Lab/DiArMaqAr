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
 * Handle preflight OPTIONS requests
 */
export function handleCorsPreflightRequest() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * Add CORS headers to any response
 */
export function addCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}