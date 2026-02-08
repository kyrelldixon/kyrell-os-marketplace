#!/usr/bin/env bun

/**
 * validate-skill.ts
 * Validates a skill meets all requirements including TDD/CSO compliance
 *
 * Usage:
 *   bun run validate-skill.ts <path-to-skill>
 *
 * Examples:
 *   bun run validate-skill.ts ../mapping-processes
 *   bun run validate-skill.ts /path/to/skill
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const MAX_DESCRIPTION_CHARS = 500;
const MAX_SKILL_WORDS = 500;

// Patterns that suggest workflow summary in description (bad)
// These indicate the description is explaining HOW the skill works, not WHEN to use it
const WORKFLOW_PATTERNS = [
	/scaffolds?/i,
	/validates? (the|your|a)/i, // "validates the structure" but not "Use when validating"
	/runs? (the )?tdd/i,
	/creates? (and|then)/i,
	/steps?:/i,
	/first.*then/i,
	/the workflow/i, // "the workflow" but not "mapping workflows"
	/this process/i, // "this process" but not "documenting processes"
];

interface ValidationResult {
	check: string;
	passed: boolean;
	message?: string;
	severity?: "error" | "warning";
}

function isKebabCase(name: string): boolean {
	return KEBAB_CASE_REGEX.test(name);
}

function countWords(text: string): number {
	return text
		.replace(/```[\s\S]*?```/g, "") // Remove code blocks
		.replace(/---[\s\S]*?---/g, "") // Remove frontmatter
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

function parseFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;

	const frontmatter: Record<string, string> = {};
	const lines = match[1].split("\n");

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex !== -1) {
			const key = line.slice(0, colonIndex).trim();
			const value = line.slice(colonIndex + 1).trim();
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

function hasWorkflowSummary(description: string): boolean {
	return WORKFLOW_PATTERNS.some((pattern) => pattern.test(description));
}

function validateSkill(skillPath: string): ValidationResult[] {
	const results: ValidationResult[] = [];
	const resolvedPath = resolve(skillPath);
	const dirName = basename(resolvedPath);
	const skillMdPath = join(resolvedPath, "SKILL.md");

	// Check 1: SKILL.md exists
	if (!existsSync(skillMdPath)) {
		results.push({
			check: "SKILL.md exists",
			passed: false,
			message: `File not found: ${skillMdPath}`,
			severity: "error",
		});
		return results;
	}
	results.push({ check: "SKILL.md exists", passed: true });

	const content = readFileSync(skillMdPath, "utf-8");
	const frontmatter = parseFrontmatter(content);

	// Check 2: Has frontmatter
	if (!frontmatter) {
		results.push({
			check: "Has frontmatter",
			passed: false,
			message: "No YAML frontmatter found (must start with ---)",
			severity: "error",
		});
		return results;
	}
	results.push({ check: "Has frontmatter", passed: true });

	// Check 3: Has name field
	if (!frontmatter.name) {
		results.push({
			check: "Has 'name' field",
			passed: false,
			message: "Frontmatter missing 'name' field",
			severity: "error",
		});
	} else {
		results.push({ check: "Has 'name' field", passed: true });
	}

	// Check 4: Has description field
	if (!frontmatter.description) {
		results.push({
			check: "Has 'description' field",
			passed: false,
			message: "Frontmatter missing 'description' field",
			severity: "error",
		});
	} else {
		results.push({ check: "Has 'description' field", passed: true });
	}

	// Check 5: Description starts with "Use when"
	if (frontmatter.description) {
		const startsWithUseWhen = frontmatter.description
			.toLowerCase()
			.startsWith("use when");
		results.push({
			check: "Description starts with 'Use when'",
			passed: startsWithUseWhen,
			message: startsWithUseWhen
				? undefined
				: "Description should start with 'Use when...' (CSO format)",
			severity: "error",
		});
	}

	// Check 6: Description does NOT have workflow summary
	if (frontmatter.description) {
		const hasWorkflow = hasWorkflowSummary(frontmatter.description);
		results.push({
			check: "Description has no workflow summary",
			passed: !hasWorkflow,
			message: hasWorkflow
				? "Description appears to summarize workflow. Use triggers only, no workflow."
				: undefined,
			severity: "warning",
		});
	}

	// Check 7: Description under character limit
	if (frontmatter.description) {
		const underLimit = frontmatter.description.length <= MAX_DESCRIPTION_CHARS;
		results.push({
			check: `Description under ${MAX_DESCRIPTION_CHARS} chars`,
			passed: underLimit,
			message: underLimit
				? undefined
				: `Description is ${frontmatter.description.length} chars (max ${MAX_DESCRIPTION_CHARS})`,
			severity: "warning",
		});
	}

	// Check 8: Name is kebab-case
	if (frontmatter.name) {
		const isKebab = isKebabCase(frontmatter.name);
		results.push({
			check: "Name is kebab-case",
			passed: isKebab,
			message: isKebab
				? undefined
				: `Name should be kebab-case, got: "${frontmatter.name}"`,
			severity: "error",
		});
	}

	// Check 9: Directory name matches skill name
	if (frontmatter.name) {
		const matches = dirName === frontmatter.name;
		results.push({
			check: "Directory name matches skill name",
			passed: matches,
			message: matches
				? undefined
				: `Directory "${dirName}" should match skill name "${frontmatter.name}"`,
			severity: "error",
		});
	}

	// Check 10: SKILL.md under word limit (token budget)
	const wordCount = countWords(content);
	const underWordLimit = wordCount <= MAX_SKILL_WORDS;
	results.push({
		check: `SKILL.md under ${MAX_SKILL_WORDS} words`,
		passed: underWordLimit,
		message: underWordLimit
			? undefined
			: `SKILL.md is ${wordCount} words (max ${MAX_SKILL_WORDS}). Move heavy reference to separate files.`,
		severity: "warning",
	});

	// Check 11: Has Examples section
	const hasExamplesSection = content.includes("## Examples");
	results.push({
		check: "Has '## Examples' section",
		passed: hasExamplesSection,
		message: hasExamplesSection ? undefined : "Missing '## Examples' section",
		severity: "error",
	});

	// Check 12: Examples section has content (not just TODOs)
	if (hasExamplesSection) {
		const examplesMatch = content.match(/## Examples\n([\s\S]*?)(?=\n## |$)/);
		const examplesContent = examplesMatch ? examplesMatch[1] : "";
		const hasTodos = examplesContent.includes("TODO");
		const hasActualContent = examplesContent.trim().length > 50 && !hasTodos;

		results.push({
			check: "Examples section has real content",
			passed: hasActualContent,
			message: hasActualContent
				? undefined
				: hasTodos
					? "Examples section still has TODO placeholders"
					: "Examples section appears empty or too short",
			severity: "error",
		});
	}

	// Check 13: No TODO markers remaining in critical sections
	const hasTodosInDescription = frontmatter.description?.includes("TODO");
	results.push({
		check: "No TODOs in description",
		passed: !hasTodosInDescription,
		message: hasTodosInDescription
			? "Description still contains TODO"
			: undefined,
		severity: "error",
	});

	return results;
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: bun run validate-skill.ts <path-to-skill>

Arguments:
  path-to-skill    Path to the skill directory to validate

Options:
  --help, -h       Show this help message

Checks:
  - SKILL.md exists with valid frontmatter
  - Description starts with "Use when..." (CSO format)
  - Description has no workflow summary (triggers only)
  - Description under ${MAX_DESCRIPTION_CHARS} characters
  - SKILL.md under ${MAX_SKILL_WORDS} words (token budget)
  - Name is kebab-case, matches directory
  - Examples section with real content
  - No TODO markers in critical fields

Examples:
  bun run validate-skill.ts ../mapping-processes
  bun run validate-skill.ts /path/to/skill
`);
		process.exit(0);
	}

	const skillPath = args[0];

	if (!existsSync(skillPath)) {
		console.error(`Error: Path does not exist: ${skillPath}`);
		process.exit(1);
	}

	console.log(`Validating skill: ${resolve(skillPath)}\n`);

	const results = validateSkill(skillPath);
	let hasErrors = false;
	let hasWarnings = false;

	for (const result of results) {
		const icon = result.passed ? "✓" : result.severity === "error" ? "✗" : "⚠";
		const color = result.passed
			? "\x1b[32m"
			: result.severity === "error"
				? "\x1b[31m"
				: "\x1b[33m";
		const reset = "\x1b[0m";

		console.log(`${color}${icon}${reset} ${result.check}`);
		if (result.message) {
			console.log(`  └─ ${result.message}`);
		}

		if (!result.passed) {
			if (result.severity === "error") hasErrors = true;
			else hasWarnings = true;
		}
	}

	console.log("");

	if (hasErrors) {
		const errorCount = results.filter(
			(r) => !r.passed && r.severity === "error",
		).length;
		console.log(
			`\x1b[31m✗ ${errorCount} error(s) - must fix before use\x1b[0m`,
		);
		process.exit(1);
	} else if (hasWarnings) {
		const warnCount = results.filter(
			(r) => !r.passed && r.severity === "warning",
		).length;
		console.log(`\x1b[33m⚠ ${warnCount} warning(s) - consider fixing\x1b[0m`);
		console.log("\x1b[32m✓ All required checks passed!\x1b[0m");
		process.exit(0);
	} else {
		console.log("\x1b[32m✓ All checks passed!\x1b[0m");
		process.exit(0);
	}
}

main();
