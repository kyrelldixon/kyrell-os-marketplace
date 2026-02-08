# CLI Patterns Reference

Common patterns for building CLIs with Bun + TypeScript + citty.

## Authentication Patterns

### Environment Variable (Preferred)

```typescript
const token = process.env.SERVICE_TOKEN;
if (!token) {
  console.error("Error: SERVICE_TOKEN environment variable required");
  process.exit(1);
}
```

### Config File (For multiple values)

```typescript
import { homedir } from "os";
import { join } from "path";

const configPath = join(homedir(), ".config", "cli-name", "config.json");
const config = await Bun.file(configPath).json().catch(() => ({}));
```

## HTTP Request Patterns

### Basic fetch with auth

```typescript
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json();
}
```

### Pagination

```typescript
async function fetchAll(endpoint: string) {
  const results = [];
  let cursor: string | undefined;

  do {
    const url = cursor ? `${endpoint}?cursor=${cursor}` : endpoint;
    const { data, nextCursor } = await apiRequest(url);
    results.push(...data);
    cursor = nextCursor;
  } while (cursor);

  return results;
}
```

## Output Formatting

### JSON output (for piping)

```typescript
if (args.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
```

### Human-readable table

```typescript
function printTable(items: Array<Record<string, unknown>>, columns: string[]) {
  // Header
  console.log(columns.join("\t"));
  console.log(columns.map(() => "---").join("\t"));

  // Rows
  for (const item of items) {
    console.log(columns.map(col => item[col] ?? "").join("\t"));
  }
}
```

## Error Handling

### Graceful error exit

```typescript
try {
  await main();
} catch (error) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("Unknown error occurred");
  }
  process.exit(1);
}
```

### Network error handling

```typescript
try {
  const data = await apiRequest("/endpoint");
} catch (error) {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    console.error("Network error: Could not connect to API");
  } else {
    throw error;
  }
}
```

## citty Command Structure

### Single command CLI

```typescript
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: { name: "cli-name", description: "What it does" },
  args: {
    target: { type: "positional", required: true, description: "The target" },
    verbose: { type: "boolean", alias: "v", description: "Verbose output" },
    format: { type: "string", default: "table", description: "Output format" },
  },
  async run({ args }) {
    // Implementation
  },
});

runMain(main);
```

### Multi-command CLI (subcommands)

```typescript
import { defineCommand, runMain } from "citty";

const list = defineCommand({
  meta: { name: "list", description: "List items" },
  async run() { /* ... */ },
});

const create = defineCommand({
  meta: { name: "create", description: "Create item" },
  args: { name: { type: "positional", required: true } },
  async run({ args }) { /* ... */ },
});

const main = defineCommand({
  meta: { name: "cli-name" },
  subCommands: { list, create },
});

runMain(main);
```

## Common Flags

```typescript
args: {
  // Output control
  json: { type: "boolean", description: "Output as JSON" },
  quiet: { type: "boolean", alias: "q", description: "Suppress output" },
  verbose: { type: "boolean", alias: "v", description: "Verbose output" },

  // Pagination
  limit: { type: "string", default: "100", description: "Max results" },

  // Filtering
  status: { type: "string", description: "Filter by status" },

  // Targeting
  id: { type: "positional", required: true, description: "Resource ID" },
}
```
