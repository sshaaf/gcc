## ADDED Requirements

### Requirement: WordPress Import Workflow

The system MUST support importing posts from a WordPress WXR export into the `content/news/` directory. The import is performed by an external script; the resulting Markdown files are committed to the repo. The script's responsibilities are: parse WXR, extract per-post frontmatter, remap fields, generate excerpts when missing, clean up WordPress shortcodes in body content, and rewrite image references from relative paths to absolute paths under `/wp-images/<YYYY>/<MM>/`.

#### Scenario: Importing a typical post
- **WHEN** the import script processes a WXR `<item>` of `wp:post_type=post` with `<wp:status>publish`
- **THEN** the script writes `content/news/<wp:post_name>.md` with frontmatter `title`, `date`, `tag`, `excerpt`, and the rendered Markdown body

#### Scenario: Skipping drafts
- **WHEN** the import script encounters a WXR `<item>` with `<wp:status>` other than `publish` (e.g. `draft`, `private`, `trash`)
- **THEN** the script skips the item and does not write a content file

#### Scenario: Skipping non-post types
- **WHEN** the import script encounters a WXR `<item>` of `wp:post_type=attachment` or `wp:post_type=revision`
- **THEN** the script skips the item

### Requirement: Frontmatter Remapping From WordPress

During import, WordPress frontmatter fields MUST be remapped to the site's news schema as follows: `wp:post_title` → `title`; `wp:post_date` (YYYY-MM-DD) → `date`; `categories` (first element) → `tag`. If the first category is `ikke-kategoriseret` (Danish for "uncategorized"), the tag MUST fall back to `"Club News"`.

#### Scenario: Standard post with one category
- **WHEN** a post has frontmatter `categories: ["1-holdet"]`
- **THEN** the imported frontmatter has `tag: "1-holdet"`

#### Scenario: Uncategorized post
- **WHEN** a post has frontmatter `categories: ["ikke-kategoriseret"]`
- **THEN** the imported frontmatter has `tag: "Club News"`

#### Scenario: Multi-category post
- **WHEN** a post has multiple categories
- **THEN** only the first is used as `tag` (the site schema supports a single tag)

### Requirement: Excerpt Generation From First Paragraph

When a WordPress post has no `<excerpt:encoded>` element, the import script MUST generate an excerpt from the first paragraph of the body (after shortcode cleanup). The excerpt MUST be at most 200 characters and SHOULD end at a sentence boundary if one exists within the limit.

#### Scenario: No excerpt in WXR
- **WHEN** a post has no `<excerpt:encoded>` element
- **THEN** the imported frontmatter has `excerpt` containing the first paragraph of the cleaned body, trimmed to 200 chars max

#### Scenario: Excerpt already present
- **WHEN** a post has `<excerpt:encoded>` with non-empty content
- **THEN** the imported frontmatter has `excerpt` set to that content

### Requirement: Caption Shortcode Cleanup

The import script MUST convert WordPress `[caption]` shortcodes to standard Markdown image syntax with the caption text as italicized text on the following line. The `[caption]...[/caption]` wrapper is removed; the embedded image link is preserved; the caption text becomes a Markdown italic paragraph.

#### Scenario: Standard caption shortcode
- **WHEN** the body contains `[caption id="277" align="aligncenter" width="584"][![](images/photo.jpg)](url) Caption text[/caption]`
- **THEN** the cleaned body contains `![](images/photo.jpg)\n\n*Caption text*`

#### Scenario: Caption without image (malformed)
- **WHEN** the body contains `[caption]text only[/caption]` with no image
- **THEN** the script preserves the text as italic and removes the shortcode wrapper

### Requirement: Image References Rewritten to Absolute Paths

During import, image references in post bodies MUST be rewritten from relative paths (`images/<file>`) to absolute paths (`/wp-images/<YYYY>/<MM>/<file>`) where `<YYYY>/<MM>` is the year and month of the post's date. The corresponding image files MUST be copied from the import source to `public/wp-images/<YYYY>/<MM>/`.

#### Scenario: Image reference in body
- **WHEN** a post body contains `![](images/Senior-2018.jpg)` and the post is dated 2018-09-09
- **THEN** the cleaned body contains `![](/wp-images/2018/09/Senior-2018.jpg)` and the file `public/wp-images/2018/09/Senior-2018.jpg` exists in the repo