#!/usr/bin/env bun

/**
 * evaluate-process.ts
 * Evaluates a process map against the skill-ready rubric
 *
 * Usage:
 *   bun run evaluate-process.ts <path-to-process-map.md>
 *
 * The process map should be a markdown file with sections for:
 * - Trigger
 * - Inputs
 * - Steps
 * - Decision points
 * - Variations
 * - Quality checks
 * - Failure modes
 * - Boundaries
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

interface RubricItem {
	name: string;
	section: string;
	greenIndicators: string[];
	redIndicators: string[];
}

const RUBRIC: RubricItem[] = [
	{
		name: "Trigger",
		section: "trigger",
		greenIndicators: [
			"form",
			"email",
			"message",
			"notification",
			"event",
			"submitted",
			"received",
		],
		redIndicators: ["when needed", "as required", "sometimes"],
	},
	{
		name: "Inputs",
		section: "input",
		greenIndicators: ["from", "source", "provides", "contains", "includes"],
		redIndicators: ["info", "context", "stuff", "things"],
	},
	{
		name: "Steps",
		section: "step",
		greenIndicators: [
			"click",
			"open",
			"send",
			"check",
			"create",
			"update",
			"use",
		],
		redIndicators: ["handle", "process", "deal with", "take care of"],
	},
	{
		name: "Decision points",
		section: "decision",
		greenIndicators: [
			"if",
			"when",
			"threshold",
			"criteria",
			"greater than",
			"less than",
			"equals",
		],
		redIndicators: ["i decide", "i know", "it depends"],
	},
	{
		name: "Variations",
		section: "variation",
		greenIndicators: [
			"unless",
			"except",
			"alternatively",
			"otherwise",
			"in case of",
		],
		redIndicators: ["sometimes", "usually", "often"],
	},
	{
		name: "Quality checks",
		section: "quality",
		greenIndicators: ["verify", "confirm", "check that", "ensure", "validate"],
		redIndicators: ["looks good", "seems right", "feels"],
	},
	{
		name: "Failure modes",
		section: "failure",
		greenIndicators: ["error", "retry", "fallback", "escalate", "notify"],
		redIndicators: ["breaks", "doesn't work", "fails"],
	},
	{
		name: "Boundaries",
		section: "boundar",
		greenIndicators: [
			"manual because",
			"requires judgment",
			"human review",
			"exception",
		],
		redIndicators: [],
	},
];

type Status = "green" | "yellow" | "red";

interface EvaluationResult {
	item: string;
	status: Status;
	reason: string;
}

function findSection(content: string, sectionName: string): string | null {
	// Look for markdown headers containing the section name
	const regex = new RegExp(`##.*${sectionName}[\\s\\S]*?(?=\\n##|$)`, "i");
	const match = content.match(regex);
	return match ? match[0] : null;
}

function evaluateSection(
	content: string,
	rubricItem: RubricItem,
): EvaluationResult {
	const section = findSection(content, rubricItem.section);

	if (!section || section.length < 20) {
		return {
			item: rubricItem.name,
			status: "red",
			reason: `No ${rubricItem.name.toLowerCase()} section found`,
		};
	}

	const lowerSection = section.toLowerCase();

	// Check for red indicators (vague language)
	for (const indicator of rubricItem.redIndicators) {
		if (lowerSection.includes(indicator)) {
			return {
				item: rubricItem.name,
				status: "yellow",
				reason: `Contains vague language: "${indicator}"`,
			};
		}
	}

	// Check for green indicators (specific language)
	let greenCount = 0;
	for (const indicator of rubricItem.greenIndicators) {
		if (lowerSection.includes(indicator)) {
			greenCount++;
		}
	}

	if (greenCount >= 2) {
		return {
			item: rubricItem.name,
			status: "green",
			reason: "Contains specific, actionable language",
		};
	}
	if (greenCount === 1) {
		return {
			item: rubricItem.name,
			status: "yellow",
			reason: "Partially specific - could use more detail",
		};
	}
	return {
		item: rubricItem.name,
		status: "yellow",
		reason: "Section exists but lacks specific indicators",
	};
}

function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: bun run evaluate-process.ts <path-to-process-map.md>

Evaluates a process map against the skill-ready rubric.

The process map should contain sections for:
- Trigger (what starts the process)
- Inputs (what's needed before starting)
- Steps (the actual actions)
- Decision points (where choices are made)
- Variations (exceptions and alternatives)
- Quality checks (how to verify correctness)
- Failure modes (what can go wrong)
- Boundaries (what stays manual)

Output:
  Green  = Complete and specific
  Yellow = Partial or vague
  Red    = Missing

Skill-ready = All green or yellow, no red.
`);
		process.exit(0);
	}

	const filePath = resolve(args[0]);

	if (!existsSync(filePath)) {
		console.error(`Error: File not found: ${filePath}`);
		process.exit(1);
	}

	const content = readFileSync(filePath, "utf-8");

	console.log(`\nEvaluating: ${filePath}\n`);
	console.log("─".repeat(50));

	const results: EvaluationResult[] = [];

	for (const rubricItem of RUBRIC) {
		const result = evaluateSection(content, rubricItem);
		results.push(result);

		const icon =
			result.status === "green" ? "●" : result.status === "yellow" ? "◐" : "○";
		const color =
			result.status === "green"
				? "\x1b[32m"
				: result.status === "yellow"
					? "\x1b[33m"
					: "\x1b[31m";
		const reset = "\x1b[0m";

		console.log(`${color}${icon}${reset} ${result.item}`);
		console.log(`  └─ ${result.reason}`);
	}

	console.log("─".repeat(50));

	const redCount = results.filter((r) => r.status === "red").length;
	const yellowCount = results.filter((r) => r.status === "yellow").length;
	const greenCount = results.filter((r) => r.status === "green").length;

	console.log(
		`\nSummary: ${greenCount} green, ${yellowCount} yellow, ${redCount} red`,
	);

	if (redCount === 0) {
		console.log("\n\x1b[32m✓ Skill-ready! All components present.\x1b[0m");
		if (yellowCount > 0) {
			console.log(
				"\x1b[33m⚠ Consider adding more specificity to yellow items.\x1b[0m",
			);
		}
		process.exit(0);
	} else {
		console.log(
			`\n\x1b[31m✗ Not skill-ready. ${redCount} component(s) missing.\x1b[0m`,
		);
		console.log("Continue extraction to fill gaps before building skill.");
		process.exit(1);
	}
}

main();
