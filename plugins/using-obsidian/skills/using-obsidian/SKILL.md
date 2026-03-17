---
name: using-obsidian
description: Interact with Obsidian vault via CLI. USE WHEN obsidian, vault, note, daily note, create note, read note, search vault, find note, add to daily, append note, templates, tags, tasks, backlinks, properties, open note, /obsidian.
---

# using-obsidian

Read, create, search, and manage notes in the Obsidian vault using the `obsidian` CLI. The CLI connects to the running Obsidian app.

**Vault:** `~/kyrell-os-vault/`

For full command reference, see REFERENCE.md.

## Commands Quick Reference

```bash
# Daily notes
obsidian daily                                    # Open today's daily note
obsidian daily:read                               # Read daily note contents
obsidian daily:append content="- [ ] Task"        # Append to daily note
obsidian daily:prepend content="## Morning"       # Prepend after frontmatter

# Read & write files
obsidian read file=<name>                         # Read by name (wikilink resolution)
obsidian read path="folder/note.md"               # Read by exact path
obsidian create name=<name> content="text"        # Create a note
obsidian create name=<name> template=<template>   # Create from template
obsidian append file=<name> content="text"        # Append to note
obsidian prepend file=<name> content="text"       # Prepend after frontmatter

# Search
obsidian search query="text"                      # Search vault, return file paths
obsidian search:context query="text"              # Search with matching line context

# File management
obsidian open file=<name>                         # Open in Obsidian
obsidian move file=<name> to="folder/"            # Move/rename file
obsidian rename file=<name> name="new name"       # Rename file
obsidian delete file=<name>                       # Delete (to trash)

# Properties (frontmatter)
obsidian property:read name=<prop> file=<name>    # Read a property value
obsidian property:set name=<prop> value=<val> file=<name>  # Set a property
obsidian property:remove name=<prop> file=<name>  # Remove a property

# Tags & tasks
obsidian tags counts                              # List all tags with counts
obsidian tags file=<name>                         # Tags for specific file
obsidian tasks todo                               # List incomplete tasks
obsidian tasks daily                              # Tasks from daily note
obsidian task ref="path.md:8" toggle              # Toggle task completion

# Links & structure
obsidian backlinks file=<name>                    # List backlinks to file
obsidian links file=<name>                        # List outgoing links
obsidian outline file=<name>                      # Show headings
obsidian files folder=<path>                      # List files in folder
obsidian folders                                  # List all folders

# Templates
obsidian templates                                # List available templates
obsidian template:read name=<template> resolve    # Read with variables resolved
```

## When to Use What

| Situation | Command |
|-----------|---------|
| Read a note by name | `read file=<name>` |
| Read a note by path | `read path="folder/note.md"` |
| Add to daily note | `daily:append content="text"` |
| Create a note from template | `create name="Title" template=<name>` |
| Create a note with content | `create name="Title" content="# Heading\n\nBody"` |
| Find notes about a topic | `search query="topic"` |
| Find with context | `search:context query="topic"` |
| Check what links to a note | `backlinks file=<name>` |
| See a note's structure | `outline file=<name>` |
| List incomplete tasks | `tasks todo` |
| Set frontmatter property | `property:set name=status value=done file=<name>` |
| Browse a folder | `files folder=people` |
| Get vault stats | `vault` |

## File Targeting

Two ways to target files — most commands accept both:

- **`file=<name>`** — Wikilink-style resolution. Matches by filename without path or extension. Use for most operations.
- **`path=<path>`** — Exact path from vault root (e.g., `people/Kyrell Dixon.md`). Use when names are ambiguous.

If neither is provided, commands default to the active file in Obsidian.

**Quoting:** Wrap values with spaces in quotes: `file="Kyrell Dixon"` or `path="plans/my plan.md"`

**Multiline content:** Use `\n` for newlines, `\t` for tabs.

## Vault Structure

```
~/kyrell-os-vault/
  daily/              # Daily notes (MM-DD-YYYY.md)
  people/             # Contact notes
  companies/          # Company notes
  artifacts/          # Produced reference docs
  plans/              # Plan documents
  insights/           # Personal insights
  proposals/          # Client proposals
  sources/            # External content notes
  templates/          # Obsidian templates
  docs/               # System documentation
  RW-Ops/             # RealWork operational docs
  _attachments/       # Images, PDFs
```

## Conventions

- **Dates:** MM-DD-YYYY format, backlinked as `[[01-09-2026]]`
- **Templates:** Native Obsidian templates using `{{date:MM-DD-YYYY}}` and `{{title}}`
- **Links:** Wikilinks (`[[Note Name]]`), not markdown links
- **Properties:** YAML frontmatter for metadata
- **Categories:** Array of wikilinks that determine note type (e.g., `["[[Sources]]"]`)

## Templates

**NEVER hardcode note formats.** Always use Obsidian templates from the vault's `templates/` directory.

When creating structured notes:
1. `obsidian templates` — check what exists
2. `obsidian template:read name="Template Name" resolve` — preview the template
3. `obsidian create name="Title" template="Template Name"` — create from template
4. `obsidian property:set` — populate frontmatter fields
5. `obsidian append` — add body content

When building pipelines or tools that create vault notes, read **TEMPLATES.md** for the full guide on template conventions, frontmatter patterns, and programmatic note creation.

## Process

When working with the vault:

1. Use `search` or `files` to find relevant notes
2. Use `read` to examine content before editing
3. Use `append`/`prepend` to add content (prefer over overwriting)
4. Use `create` with templates when creating structured notes
5. Always quote file names that contain spaces
6. When creating new note types, create a template first (see TEMPLATES.md)

## Notes

- **Obsidian must be running.** The CLI connects to the running app. First command launches it if needed.
- **`--copy` flag:** Add to any command to copy output to clipboard.
- **Active file:** When no file is specified, commands target the currently open file in Obsidian.
- **Templates resolve variables:** Use `template:read name=X resolve` to preview with `{{date}}`, `{{title}}` resolved.
- **Trash, not delete:** `delete` moves to trash by default. Add `permanent` flag for permanent deletion.
- **Link updates:** `move` and `rename` automatically update internal links if enabled in vault settings.
