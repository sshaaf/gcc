## ADDED Requirements

### Requirement: Home Page Section Composition

The home page at `/` MUST render the following sections in this exact order: Topbar, Nav, Hero, MatchCentre, Teams, Honours, Coaches, Ground, Sponsors, News, Gallery preview, Join, Footer. The composition MUST be defined in `app/page.tsx` (or its composed Server Components). Section order MUST NOT be derived from content files.

#### Scenario: Section order is fixed
- **WHEN** a developer reads `app/page.tsx`
- **THEN** they can identify the section order without inspecting content files

#### Scenario: Adding a new content file does not reorder sections
- **WHEN** an author adds a new file to `content/teams/`
- **THEN** the Teams section position on the home page is unchanged

### Requirement: Home Page Renders From Markdown, Not Hardcoded Strings

Every text, number, image, and link rendered on the home page MUST originate from a Markdown file under `/content/**`. No section component MAY contain hardcoded copy that an author would reasonably need to edit (team names, sponsor names, news titles, fixture dates, hero stats, etc.). Section components MAY contain hardcoded layout, class names, and structural markup.

#### Scenario: Editing a team's description
- **WHEN** an author edits `description` in `content/teams/senior-men.md`
- **THEN** the home page renders the new description after the next build; no component code changes

#### Scenario: Editing a fixture
- **WHEN** an author updates the `when` or `venue` field in `content/fixtures/<file>.md`
- **THEN** the MatchCentre section renders the new fixture after the next build

### Requirement: "Join the Club" Buttons Are Inert

All buttons labeled "Join the Club", "Become a Member", and "Sign up for a trial session" MUST render as `<a href="#join">` or `<a href="#contact">` anchors with smooth-scroll behavior. They MUST NOT have an `onClick` handler, MUST NOT call `useRouter`, MUST NOT navigate to a route, and MUST NOT POST to an API. Their visual styling MUST match the original HTML design.

#### Scenario: Clicking the Join button does nothing but scroll
- **WHEN** a user clicks "Join the Club" in the nav
- **THEN** the browser scrolls smoothly to the `#join` section on the same page; no navigation, no network request, no route change

#### Scenario: Anchor remains focusable and accessible
- **WHEN** a keyboard user tabs to the Join button
- **THEN** it receives focus visibly (gold outline per `focus-visible` rule) and is activated by Enter

### Requirement: Reveal-on-Scroll Behavior Is Preserved

Sections that opt in to reveal-on-scroll MUST animate into view using the same visual behavior as the original HTML: opacity 0 → 1, `translateY(16px)` → 0, over ~0.6s, triggered by `IntersectionObserver` at threshold 0.12. The behavior MUST respect `prefers-reduced-motion: reduce` (no animation in that case). The behavior MUST be implemented as a single client component, reused across sections.

#### Scenario: Section reveals on scroll
- **WHEN** a section marked for reveal scrolls into the viewport
- **THEN** it transitions from invisible+offset to visible+in-place once, then stays in place

#### Scenario: Reduced motion users see no animation
- **WHEN** a user has `prefers-reduced-motion: reduce` set
- **THEN** reveal-on-scroll sections render fully visible immediately, with no transition

### Requirement: Footer Includes Legacy WordPress Link

The footer MUST include a link to the existing WordPress archive. The link label MUST clearly indicate it leads to legacy content (e.g. "Legacy site", "Archive", or similar). The link's `href` MUST point to the WordPress site's homepage URL, which is configured as a constant (not content-managed in this MVP).

#### Scenario: Footer contains the legacy link
- **WHEN** a user views the footer
- **THEN** they see a link to the legacy WordPress site, alongside the existing Club / Visit / Contact columns

### Requirement: Hero Stats Are Content-Managed

The four hero statistics (currently `2×`, `16`, `67`, `6` with their labels) MUST be sourced from `content/stats/index.md`. Each stat MUST have a `value` and `label` field. The order of stats MUST be preserved as authored.

#### Scenario: Editing a stat
- **WHEN** an author changes the `value` of the first stat in `content/stats/index.md`
- **THEN** the home page renders the new value in the corresponding position after the next build

### Requirement: Visual Design Is Faithful to the HTML

The rendered home page MUST match `glostrup-cricket-redesign.html` pixel-for-pixel at desktop breakpoints (≥960px), with no visual regressions in typography, color, spacing, or layout. Mobile breakpoints (≤960px and ≤560px) MUST follow the responsive rules from the original CSS. The design token system (CSS variables in `:root`) MUST be preserved as the single source of design values.

#### Scenario: Comparing rendered page to original HTML
- **WHEN** a reviewer opens both the original HTML and the deployed Next.js site side-by-side at 1280px wide
- **THEN** every section (Topbar through Footer) renders with matching typography, color, spacing, and layout