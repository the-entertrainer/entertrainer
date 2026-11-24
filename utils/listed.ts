/**
 * Hide-not-delete for public catalogs.
 *
 * Every catalog row may set `listed`. Omitted means listed.
 * Flip one line to put an item back on the hubs, teasers, sitemap, and RSS:
 * `listed: true`. The page and route stay either way.
 * Unlisted URLs stay reachable and are marked noindex.
 */
export function isListed(item: { listed?: boolean } | null | undefined): boolean {
  return item?.listed !== false
}
