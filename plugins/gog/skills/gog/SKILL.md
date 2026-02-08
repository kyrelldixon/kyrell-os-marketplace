---
name: gog
description: Use when accessing Google Docs via CLI. USE WHEN google docs, export doc, read doc, create doc, gog, doc contents.
---

# gog

Google Workspace CLI. Currently configured for Docs.

## Environment

```bash
export GOG_ACCOUNT=your-email@example.com
```

## Docs Commands

```bash
# Print doc contents as plain text
gog docs cat <docId>

# Export to text/pdf/docx
gog docs export <docId> --format txt --out ./doc.txt
gog docs export <docId> --format pdf --out ./doc.pdf

# Get doc metadata
gog docs info <docId>

# Create new doc
gog docs create "My Doc Title"

# Copy a doc
gog docs copy <docId> "Copy Title"
```

## Finding docId

The `<docId>` is the long string in a Google Doc URL:

`https://docs.google.com/document/d/`**`1abc123xyz`**`/edit`

## Notes

- Use `--json` for scripting
- Use `--no-input` for non-interactive runs
- Run `gog docs --help` for full command list

## Examples

**Read a doc's contents:**
```bash
gog docs cat 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

**Export doc to PDF:**
```bash
gog docs export 1aBcDeFgHiJkLmNoPqRsTuVwXyZ --format pdf --out ./report.pdf
```

## Adding Services Later

To add Calendar, Drive, Gmail, etc:

```bash
gog auth add your-email@example.com --services docs,calendar,drive
```
