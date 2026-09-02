/**
 * The live legacy WordPress site URL. The footer's "Legacy site" link points here,
 * so visitors can reach ten years of pre-Markdown club history.
 *
 * Must match the live domain. Update this if the legacy domain changes.
 * Used by:
 *   - components/Footer.tsx (footer "Legacy site" link)
 *   - vercel.json (rewrites preserve the old permalinks after WP is decommissioned)
 */
export const WORDPRESS_URL = "https://www.glostrupcricket.dk";