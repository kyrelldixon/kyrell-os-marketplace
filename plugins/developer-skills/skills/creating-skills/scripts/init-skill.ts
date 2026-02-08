#!/usr/bin/env bun

/**
 * init-skill.ts
 * Creates a new skill directory with template SKILL.md
 *
 * Usage:
 *   bun run init-skill.ts <skill-name> [--path <output-dir>]
 *
 * Examples:
 *   bun run init-skill.ts capture-link
 *   bun run init-skill.ts capture-link --path ../
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function isKebabCase(name: string): boolean {
	return KEBAB_CASE_REGEX.test(name);
}

function generateTemplate(skillName: string): string {
	return `---
name: ${skillName}
description: TODO: What it does. USE WHEN [trigger phrases].
---

# ${skillName}

TODO: Brief description of what this skill does.

## How It Works

TODO: Describe the workflow/process.

1. **Step 1** — TODO
2. **Step 2** — TODO
3. **Step 3** — TODO

## Examples

**Example 1: TODO**
\`\`\`
User: "TODO: example input"
→ TODO: what happens
→ TODO: output
\`\`\`

**Example 2: TODO**
\`\`\`
User: "TODO: example input"
→ TODO: what happens
→ TODO: output
\`\`\`
`;
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: bun run init-skill.ts <skill-name> [--path <output-dir>]

Arguments:
  skill-name    Name for the new skill (must be kebab-case)

Options:
  --path        Output directory (default: current directory)
  --help, -h    Show this help message

Examples:
  bun run init-skill.ts capture-link
  bun run init-skill.ts capture-link --path ../
`);
		process.exit(0);
	}

	const skillName = args[0];

	// Validate skill name
	if (!isKebabCase(skillName)) {
		console.error(
			`Error: Skill name must be kebab-case (e.g., "capture-link", "create-content")`,
		);
		console.error(`Got: "${skillName}"`);
		process.exit(1);
	}

	// Parse --path option
	let outputDir = process.cwd();
	const pathIndex = args.indexOf("--path");
	if (pathIndex !== -1 && args[pathIndex + 1]) {
		outputDir = resolve(args[pathIndex + 1]);
	}

	const skillDir = join(outputDir, skillName);
	const skillMdPath = join(skillDir, "SKILL.md");
	const scriptsDir = join(skillDir, "scripts");

	// Check if skill already exists
	if (existsSync(skillDir)) {
		console.error(`Error: Directory already exists: ${skillDir}`);
		process.exit(1);
	}

	// Create directories
	mkdirSync(skillDir, { recursive: true });
	mkdirSync(scriptsDir, { recursive: true });

	// Write template
	const template = generateTemplate(skillName);
	writeFileSync(skillMdPath, template, "utf-8");

	console.log(`✓ Created skill: ${skillName}`);
	console.log(`  ${skillDir}/`);
	console.log("  ├── SKILL.md");
	console.log("  └── scripts/");
	console.log("");
	console.log("Next steps:");
	console.log(`  1. Edit ${skillMdPath}`);
	console.log("  2. Replace TODO markers with actual content");
	console.log(`  3. Run: bun run validate-skill.ts ${skillDir}`);
}

main();
