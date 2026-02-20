# CLI Patterns Reference

Patterns for building CLIs with Bun + TypeScript + citty.

## Project Setup

### package.json

```json
{
  "name": "cli-name",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "cli-name": "./src/cli.ts"
  },
  "scripts": {
    "dev": "bun run src/cli.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write ."
  },
  "dependencies": {
    "citty": "^0.1.6",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@types/bun": "latest",
    "typescript": "^5.9.3"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun-types"],
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true },
  "formatter": {
    "indentStyle": "tab",
    "lineWidth": 120
  }
}
```

## citty Patterns

### Single command CLI

```typescript
#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: { name: "cli-name", description: "What it does", version: "0.1.0" },
  args: {
    target: { type: "positional", required: true, description: "The target" },
    json: { type: "boolean", description: "Output as JSON" },
  },
  async run({ args }) {
    // Implementation
  },
});

runMain(main);
```

### Multi-command CLI with subcommands

```typescript
#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";

const list = defineCommand({
  meta: { name: "list", description: "List items" },
  args: {
    status: { type: "string", description: "Filter by status" },
    json: { type: "boolean", description: "Output as JSON" },
  },
  async run({ args }) { /* ... */ },
});

const create = defineCommand({
  meta: { name: "create", description: "Create item" },
  args: {
    name: { type: "positional", required: true },
  },
  async run({ args }) { /* ... */ },
});

const main = defineCommand({
  meta: { name: "cli-name", version: "0.1.0" },
  subCommands: { list, create },
});

runMain(main);
```

### Setup hooks (auth-skipping pattern)

From the linear CLI — skip config loading for commands that don't need it:

```typescript
const main = defineCommand({
  meta: { name: "cli-name" },
  async setup() {
    const isAuth = process.argv.includes("auth");
    const isHelp = process.argv.includes("--help");
    if (isAuth || isHelp) return;

    const config = await loadConfig();
    initClient(config);
  },
  subCommands: { auth, list, create },
});
```

### Common flag definitions

```typescript
args: {
  // Output
  json: { type: "boolean", description: "Output as JSON", default: false },

  // Pagination
  limit: { type: "string", default: "100", description: "Max results" },

  // Filtering
  status: { type: "string", description: "Filter by status" },

  // Targeting
  id: { type: "positional", required: true, description: "Resource ID" },
}
```

## Authentication

### Environment variable (preferred for simple cases)

```typescript
const token = process.env.SERVICE_TOKEN;
if (!token) {
  error("cli-name", "SERVICE_TOKEN not set", "AUTH_REQUIRED",
    "Set SERVICE_TOKEN environment variable: export SERVICE_TOKEN=your-token");
}
```

### Config file (for multiple values)

```typescript
import { homedir } from "node:os";
import { join } from "node:path";

const configDir = join(homedir(), ".cli-name");
const configPath = join(configDir, "config.json");

async function loadConfig(): Promise<Config> {
  const file = Bun.file(configPath);
  if (!(await file.exists())) {
    error("cli-name", "Not configured", "CONFIG_MISSING",
      `Run 'cli-name auth' to set up configuration`);
  }
  return file.json();
}

async function saveConfig(config: Config): Promise<void> {
  await Bun.write(configPath, JSON.stringify(config, null, 2));
}
```

### Auth command pattern

```typescript
const auth = defineCommand({
  meta: { name: "auth", description: "Configure authentication" },
  args: {
    token: { type: "string", description: "API token" },
  },
  async run({ args }) {
    const configDir = join(homedir(), ".cli-name");
    await mkdir(configDir, { recursive: true });
    await Bun.write(join(configDir, "config.json"), JSON.stringify({
      api_key: args.token,
    }, null, 2));
    success("cli-name auth", { configured: true }, [
      { command: "cli-name list", description: "List items to verify auth" },
    ]);
  },
});
```

## HTTP / API Patterns

### fetch with auth

```typescript
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json();
}
```

### Pagination

```typescript
async function fetchAll<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
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

### GraphQL (from linear CLI)

```typescript
import { LinearClient } from "@linear/sdk";

let client: LinearClient;

function initClient(apiKey: string) {
  client = new LinearClient({ apiKey });
}

// SDK methods return typed objects
const issues = await client.issues({ first: 50 });
```

## Validation

### Zod 4 for input validation

```typescript
import { z } from "zod";

const CreateInput = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["none", "urgent", "high", "medium", "low"]).optional(),
});

// Parse with actionable errors
function parseInput<T>(schema: z.ZodSchema<T>, data: unknown, command: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    error(command, `${issue.path.join(".")}: ${issue.message}`, "VALIDATION_ERROR",
      `Fix the ${issue.path.join(".")} field and retry`);
  }
  return result.data;
}
```

### Actionable error messages

Never dump raw Zod errors. Transform them:

```typescript
// Bad: ZodError: Expected string, received undefined at "title"
// Good: "title: Required. Provide a title as the first positional argument."
```

## Installability

### Development — bun link

```bash
# In the CLI project directory
bun link

# Now available globally during development
cli-name --help
```

### Distribution — compile to binary

```bash
# Build standalone binary
bun build src/cli.ts --compile --outfile cli-name

# Install to PATH
cp cli-name ~/.bun/bin/
```

### Shebang for direct execution

First line of `src/cli.ts`:
```typescript
#!/usr/bin/env bun
```

This lets the file run directly when the `bin` field points to it and it's linked via `bun link`.
