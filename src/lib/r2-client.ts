/**
 * Client-safe R2 utilities.
 * This file is safe to import in browser code — it contains NO secrets,
 * NO AWS SDK imports, and NO process.env references.
 *
 * Server-only logic (presigned URLs, delete) lives in src/lib/r2.ts.
 */

/**
 * Extract the R2 object key from a public URL.
 *
 * Works for both:
 *   https://pub-xxx.r2.dev/properties/123/images/uuid.jpg  →  properties/123/images/uuid.jpg
 *   https://media.yourdomain.com/properties/123/images/uuid.jpg  →  properties/123/images/uuid.jpg
 *
 * The key always starts with "properties/".
 */
export function urlToKey(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    // Strip leading slash, then find the "properties/" segment
    const clean = pathname.replace(/^\//, "");
    const idx = clean.indexOf("properties/");
    return idx !== -1 ? clean.slice(idx) : clean;
  } catch {
    // Not a valid URL — return as-is (already a key)
    return url;
  }
}
