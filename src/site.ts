/**
 * The archive's canonical origin — one literal for the whole app.
 *
 * Deliberately a constant and not an environment lookup. Every consumer here
 * needs the *canonical* origin, not the origin the code happens to be running
 * on: `metadataBase` and the JSON-LD have to name the public site even when
 * rendered on a deploy preview, `links.self` in API responses must never leak
 * a branch URL to a client that will cache it, and an exported Scala file
 * carries this string to wherever the file travels. An env fallback would
 * silently substitute a wrong origin into all of them.
 */
export const SITE_URL = "https://diarmaqar.net";
