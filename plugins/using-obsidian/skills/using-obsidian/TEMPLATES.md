# Obsidian Templates Guide

## The Rule

**NEVER hardcode note formats in application code.** Always use Obsidian templates from the vault's `templates/` directory.

When building pipelines or tools that create vault notes:
1. Create an Obsidian template for the content type
2. Use `obsidian create name="Title" template="Template Name"` to create notes
3. Use `obsidian property:set` to populate frontmatter fields
4. Use `obsidian append` to add body content

## How Templates Work

Templates live in `~/kyrell-os-vault/templates/` as `.md` files. Each template defines:
- **YAML frontmatter** — the metadata fields for that note type
- **Body content** — default structure, headings, embedded queries

### Variable Substitution

Obsidian resolves these variables when a template is applied:
- `{{title}}` — the note's filename
- `{{date:FORMAT}}` — current date in given format (e.g., `{{date:MM-DD-YYYY}}`)
- `{{time:FORMAT}}` — current time

Preview a resolved template:
```bash
obsidian template:read name="Template Name" resolve
```

## Template Conventions

### Frontmatter Patterns

| Field | Format | Example |
|-------|--------|---------|
| `categories` | Array of wikilinks | `["[[Sources]]"]` |
| `author` | Array of wikilinks | `["[[Author Name]]"]` |
| `created` | Backlinked date | `"[[03-17-2026]]"` |
| `published` | Backlinked date | `"[[02-09-2026]]"` |
| `topics` | Array of wikilinks | `["[[AI Agents]]", "[[CLI Tools]]"]` |
| `url` | Plain string | `"https://example.com"` |
| `status` | Plain string | `raw`, `processing`, `done` |
| `tags` | Array of strings | `["article", "reference"]` |

**Key rules:**
- Dates are ALWAYS `MM-DD-YYYY` format, wrapped in `[[backlinks]]`
- People, categories, and topics use `[[wikilinks]]`
- `categories` determines which Obsidian database/base the note appears in
- Arrays start empty (`[]`) in templates — populated when the note is created

### Category = Note Type

The `categories` field determines what kind of note this is. Each category maps to a template:

| Category | Template | Folder |
|----------|----------|--------|
| `[[Sources]]` | Article/content source notes | `sources/` |
| `[[Books]]` | Book notes | root |
| `[[People]]` | People/contacts | `people/` |
| `[[Companies]]` | Company notes | `companies/` |
| `[[YouTubers]]` | YouTuber profiles (subset of People) | `people/` |
| `[[Projects]]` | Project notes | root |
| `[[LLMs]]` | LLM reference notes | root |
| `[[Podcast episodes]]` | Podcast episode notes | root |
| `[[Posts]]` | Blog posts (authored by user) | root |
| `[[Clippings]]` | Quick clippings | root |
| `[[Insights]]` | Personal insights | `insights/` |

### Bases Integration

Some templates embed Obsidian Bases queries for relational views:
```markdown
![[Sources.base#Author]]
```
This creates a live table showing all sources by a given author. Use when a note type has meaningful relationships to other notes.

## Creating New Templates

When you need a template for a new content type:

1. **Check existing templates first:** `obsidian templates` — don't duplicate
2. **Follow the naming convention:** `{Type} Template` (e.g., `GitHub Repo Template`)
3. **Include standard fields:** `categories`, `created`, `topics`, `status`
4. **Add type-specific fields** with empty defaults
5. **Keep body content minimal** — headings and structure only
6. **Create in the vault:** Use `obsidian create` with `path="templates/"` prefix

### Template Design Principles

- **Frontmatter = structured metadata** (queryable, filterable)
- **Body = human content** (notes, summaries, analysis)
- **Don't put content in frontmatter** — summaries, descriptions, and analysis go in the body
- **Empty arrays over omitted fields** — `topics: []` not missing `topics`
- **Use wikilinks for anything you'd want to navigate to** — people, categories, topics, dates

## Programmatic Note Creation

When building tools/pipelines that create vault notes:

### Step 1: Create from template
```bash
obsidian create name="Note Title" template="Template Name" folder="sources"
```

### Step 2: Populate frontmatter
```bash
obsidian property:set name=url value="https://example.com" file="Note Title"
obsidian property:set name=author value="[[Author Name]]" file="Note Title"
obsidian property:set name=status value=raw file="Note Title"
```

### Step 3: Add body content
```bash
obsidian append file="Note Title" content="## Summary\n\nContent goes here..."
```

### Why Not Write Files Directly?

Writing `.md` files directly to the vault bypasses Obsidian:
- Template variables (`{{date}}`, `{{title}}`) won't resolve
- Obsidian's file index won't update immediately
- Link resolution and backlink tracking may lag
- Property type validation is skipped

Use the CLI when Obsidian is running. Only write files directly as a fallback when Obsidian is unavailable (e.g., server-side pipelines where Obsidian isn't running — but even then, match the template format exactly).

## Existing Templates Reference

Run `obsidian templates` to see all available templates. Key ones:

| Template | Category | Key Fields |
|----------|----------|------------|
| Clipping Template | `[[Clippings]]` | author, url, published |
| Post Template | `[[Posts]]` | author (defaults to `[[Me]]`), status |
| Book Template | `[[Books]]` | author, cover, genre, pages, isbn, rating, via |
| YouTuber Template | `[[YouTubers]]` | youtube_url + Sources.base embed |
| Podcast Episode Template | `[[Podcast episodes]]` | show, guests, episode, rating |
| LLM Template | `[[LLMs]]` | provider, models, context_window, pricing, strengths, weaknesses |
| People Template | `[[People]]` | birthday, org, phone, twitter |
| Project Template | `[[Projects]]` | type, org, start, year, url, status |
| Product Template | `[[Products]]` | maker, model, price, acquired |
