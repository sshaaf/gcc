## ADDED Requirements

### Requirement: News Section Lead-Card Selection

The home page News section MUST select its lead card as follows: if any post in `content/news/` has `lead: true`, the most recent such post is the lead. Otherwise, the most recent post overall (by `date`) is the lead. The two non-lead cards are the next two most-recent posts excluding the lead. This rule is independent of whether posts were hand-authored or imported from WordPress.

#### Scenario: Lead explicitly marked
- **WHEN** at least one post has `lead: true`
- **THEN** the lead card is the most recent `lead: true` post (regardless of other posts' dates)

#### Scenario: No lead marked
- **WHEN** no post has `lead: true`
- **THEN** the lead card is the most recent post overall; the grid cards are the next two most-recent

#### Scenario: WordPress import without `lead: true`
- **WHEN** the import script writes posts without setting `lead: true` on any of them
- **THEN** the most recent imported post (by `date`) becomes the lead card on the home page after import

### Requirement: News Section Continues to Render Three Cards

The home page News section MUST continue to render exactly one lead card and two grid cards, even when the underlying post set grows from 3 seeded posts to 60+ imported posts. Older posts remain reachable at `/news/<slug>` but do not appear on the home page.

#### Scenario: More than three posts in content/news/
- **WHEN** 60 posts exist in `content/news/` (e.g. after WP import)
- **THEN** the home page still shows 3 cards (1 lead + 2 grid); the remaining 57 are reachable only via direct URL