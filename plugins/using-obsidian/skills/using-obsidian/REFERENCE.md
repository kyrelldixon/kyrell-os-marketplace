# Obsidian CLI Full Reference

Complete command reference for the `obsidian` CLI. See SKILL.md for quick reference and workflows.

## Parameter Syntax

- **Parameters:** `param=value` or `param="value with spaces"`
- **Flags:** Boolean switches, just include to enable (e.g., `open`, `overwrite`, `total`)
- **Multiline:** `\n` for newline, `\t` for tab
- **Output formats:** Many commands support `format=json|csv|tsv|md`
- **Clipboard:** Add `--copy` to any command to copy output

## Daily Notes

```bash
daily                                     # Open daily note
daily:path                                # Get daily note path (even if not created)
daily:read                                # Read daily note contents
daily:append content="text" [inline] [open]   # Append to daily note
daily:prepend content="text" [inline] [open]  # Prepend after frontmatter
```

`inline` flag appends without newline. `open` opens file after adding.

## Files & Folders

```bash
# Info
file [file=<name>|path=<path>]            # Show file info (path, size, dates)
files [folder=<path>] [ext=<ext>] [total] # List files
folder path=<path> [info=files|folders|size]  # Folder info
folders [folder=<path>] [total]           # List folders

# Read & write
read [file=<name>|path=<path>]            # Read file contents
create [name=<name>|path=<path>] [content=<text>] [template=<name>] [overwrite] [open] [newtab]
append [file=<name>|path=<path>] content="text" [inline]
prepend [file=<name>|path=<path>] content="text" [inline]

# Manage
open [file=<name>|path=<path>] [newtab]
move [file=<name>|path=<path>] to=<path>  # Move or rename
rename [file=<name>|path=<path>] name=<name>  # Rename (preserves extension)
delete [file=<name>|path=<path>] [permanent]  # Delete (trash by default)
```

## Search

```bash
search query="text" [path=<folder>] [limit=<n>] [format=text|json] [total] [case]
search:context query="text" [path=<folder>] [limit=<n>] [format=text|json] [case]
search:open [query="text"]                # Open search view in Obsidian
```

`search` returns file paths. `search:context` returns grep-style `path:line: text` output.

## Properties (Frontmatter)

```bash
properties [file=<name>|path=<path>] [name=<name>] [sort=count] [format=yaml|json|tsv] [total] [counts] [active]
property:read name=<name> [file=<name>|path=<path>]
property:set name=<name> value=<value> [type=text|list|number|checkbox|date|datetime] [file=<name>|path=<path>]
property:remove name=<name> [file=<name>|path=<path>]
```

## Tags

```bash
tags [file=<name>|path=<path>] [sort=count] [total] [counts] [format=json|tsv|csv] [active]
tag name=<tag> [total] [verbose]          # Tag info (verbose includes file list)
```

## Tasks

```bash
tasks [file=<name>|path=<path>] [status="<char>"] [total] [done] [todo] [verbose] [format=json|tsv|csv] [active] [daily]
task [ref=<path:line>|file=<name> line=<n>] [toggle] [done] [todo] [status="<char>"] [daily]
```

Examples:
```bash
tasks todo                    # All incomplete tasks
tasks daily                   # Tasks from daily note
tasks verbose                 # Group by file with line numbers
task ref="Recipe.md:8" toggle # Toggle completion
task daily line=3 done        # Mark daily note task done
tasks 'status=?'              # Filter by custom status char
```

## Links

```bash
backlinks [file=<name>|path=<path>] [counts] [total] [format=json|tsv|csv]
links [file=<name>|path=<path>] [total]
unresolved [total] [counts] [verbose] [format=json|tsv|csv]
orphans [total]               # Files with no incoming links
deadends [total]              # Files with no outgoing links
```

## Outline

```bash
outline [file=<name>|path=<path>] [format=tree|md|json] [total]
```

## Templates

```bash
templates [total]
template:read name=<name> [title=<title>] [resolve]
template:insert name=<name>              # Insert into active file
```

`resolve` processes `{{date}}`, `{{time}}`, `{{title}}` variables.

## Bookmarks

```bash
bookmarks [total] [verbose] [format=json|tsv|csv]
bookmark [file=<path>] [folder=<path>] [search=<query>] [url=<url>] [title=<title>]
```

## Aliases

```bash
aliases [file=<name>|path=<path>] [total] [verbose] [active]
```

## Word Count

```bash
wordcount [file=<name>|path=<path>] [words] [characters]
```

## Vault

```bash
vault [info=name|path|files|folders|size]
vaults [total] [verbose]      # List known vaults (verbose includes paths)
```

## Workspace & Tabs

```bash
workspace [ids]               # Show workspace tree
workspaces [total]            # List saved workspaces
workspace:save [name=<name>]
workspace:load name=<name>
workspace:delete name=<name>
tabs [ids]                    # List open tabs
tab:open [group=<id>] [file=<path>] [view=<type>]
recents [total]               # Recently opened files
```

## Sync

```bash
sync [on|off]                 # Pause/resume sync
sync:status                   # Show sync status and usage
sync:history [file=<name>|path=<path>] [total]
sync:read [file=<name>|path=<path>] version=<n>
sync:restore [file=<name>|path=<path>] version=<n>
sync:deleted [total]          # List deleted files in sync
```

## File History (Local)

```bash
diff [file=<name>|path=<path>] [from=<n>] [to=<n>] [filter=local|sync]
history [file=<name>|path=<path>]
history:list                  # All files with local history
history:read [file=<name>|path=<path>] [version=<n>]
history:restore [file=<name>|path=<path>] version=<n>
```

## Commands & Hotkeys

```bash
commands [filter=<prefix>]    # List available command IDs
command id=<command-id>       # Execute an Obsidian command
hotkeys [total] [verbose] [format=json|tsv|csv]
hotkey id=<command-id> [verbose]
```

## Plugins

```bash
plugins [filter=core|community] [versions] [format=json|tsv|csv]
plugins:enabled [filter=core|community] [versions] [format=json|tsv|csv]
plugin id=<plugin-id>         # Plugin info
plugin:enable id=<id> [filter=core|community]
plugin:disable id=<id> [filter=core|community]
plugin:install id=<id> [enable]
plugin:uninstall id=<id>
plugin:reload id=<id>         # For developers
plugins:restrict [on|off]     # Toggle restricted mode
```

## Bases

```bash
bases                         # List .base files
base:views [file=<name>|path=<path>]
base:create [file=<name>|path=<path>] [view=<name>] [name=<name>] [content=<text>] [open] [newtab]
base:query [file=<name>|path=<path>] [view=<name>] [format=json|csv|tsv|md|paths]
```

## Developer Commands

```bash
devtools                      # Toggle dev tools
eval code="javascript"        # Execute JS in Obsidian
dev:screenshot [path=<file>]  # Take screenshot
dev:console [limit=<n>] [level=log|warn|error|info|debug] [clear]
dev:errors [clear]
dev:css selector="css" [prop=<name>]
dev:dom selector="css" [attr=<name>] [css=<prop>] [total] [text] [inner] [all]
dev:debug [on|off]
dev:cdp method="CDP.method" [params=<json>]
dev:mobile [on|off]
```

## General

```bash
help [<command>]
version
reload                        # Reload app window
restart                       # Restart app
```

## Publish

```bash
publish:site                  # Show publish site info
publish:list [total]
publish:status [total] [new] [changed] [deleted]
publish:add [file=<name>|path=<path>] [changed]
publish:remove [file=<name>|path=<path>]
publish:open [file=<name>|path=<path>]
```

## Random Notes

```bash
random [folder=<path>] [newtab]
random:read [folder=<path>]   # Read random note (includes path)
```

## Web Viewer

```bash
web url=<url> [newtab]
```

## Unique Notes

```bash
unique [name=<text>] [content=<text>] [open]
```
