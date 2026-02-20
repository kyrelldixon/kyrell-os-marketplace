#!/usr/bin/env bun

/**
 * Render graphviz diagrams from a skill's SKILL.md to SVG files.
 *
 * Usage:
 *   bun run render-graphs.ts <skill-directory>           # Render each diagram separately
 *   bun run render-graphs.ts <skill-directory> --combine  # Combine all into one diagram
 *
 * Extracts all ```dot blocks from SKILL.md and renders to SVG.
 * Useful for helping your human partner visualize the process flows.
 *
 * Requires: graphviz (dot) installed on system
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

interface DotBlock {
	name: string;
	content: string;
}

function extractDotBlocks(markdown: string): DotBlock[] {
	const blocks: DotBlock[] = [];
	const regex = /```dot\n([\s\S]*?)```/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(markdown)) !== null) {
		const content = match[1].trim();

		// Extract digraph name
		const nameMatch = content.match(/digraph\s+(\w+)/);
		const name = nameMatch ? nameMatch[1] : `graph_${blocks.length + 1}`;

		blocks.push({ name, content });
	}

	return blocks;
}

function extractGraphBody(dotContent: string): string {
	// Extract just the body (nodes and edges) from a digraph
	const match = dotContent.match(/digraph\s+\w+\s*\{([\s\S]*)\}/);
	if (!match) return "";

	let body = match[1];

	// Remove rankdir (we'll set it once at the top level)
	body = body.replace(/^\s*rankdir\s*=\s*\w+\s*;?\s*$/gm, "");

	return body.trim();
}

function combineGraphs(blocks: DotBlock[], skillName: string): string {
	const bodies = blocks.map((block, i) => {
		const body = extractGraphBody(block.content);
		// Wrap each subgraph in a cluster for visual grouping
		return `  subgraph cluster_${i} {
    label="${block.name}";
    ${body
			.split("\n")
			.map((line) => `  ${line}`)
			.join("\n")}
  }`;
	});

	return `digraph ${skillName}_combined {
  rankdir=TB;
  compound=true;
  newrank=true;

${bodies.join("\n\n")}
}`;
}

function renderToSvg(dotContent: string): string | null {
	try {
		const proc = Bun.spawnSync(["dot", "-Tsvg"], {
			stdin: Buffer.from(dotContent),
		});

		if (proc.exitCode !== 0) {
			console.error("Error running dot:", proc.stderr.toString());
			return null;
		}

		return proc.stdout.toString();
	} catch (err) {
		console.error("Error running dot:", (err as Error).message);
		return null;
	}
}

function main(): void {
	const args = process.argv.slice(2);
	const combine = args.includes("--combine");
	const skillDirArg = args.find((a) => !a.startsWith("--"));

	if (!skillDirArg) {
		console.error("Usage: bun run render-graphs.ts <skill-directory> [--combine]");
		console.error("");
		console.error("Options:");
		console.error("  --combine    Combine all diagrams into one SVG");
		console.error("");
		console.error("Example:");
		console.error("  bun run render-graphs.ts ../test-driven-development");
		console.error("  bun run render-graphs.ts ../test-driven-development --combine");
		process.exit(1);
	}

	const skillDir = resolve(skillDirArg);
	const skillFile = join(skillDir, "SKILL.md");
	const skillName = basename(skillDir).replace(/-/g, "_");

	if (!existsSync(skillFile)) {
		console.error(`Error: ${skillFile} not found`);
		process.exit(1);
	}

	// Check if dot is available
	const whichProc = Bun.spawnSync(["which", "dot"]);
	if (whichProc.exitCode !== 0) {
		console.error("Error: graphviz (dot) not found. Install with:");
		console.error("  brew install graphviz    # macOS");
		console.error("  apt install graphviz     # Linux");
		process.exit(1);
	}

	const markdown = readFileSync(skillFile, "utf-8");
	const blocks = extractDotBlocks(markdown);

	if (blocks.length === 0) {
		console.log("No ```dot blocks found in", skillFile);
		process.exit(0);
	}

	console.log(
		`Found ${blocks.length} diagram(s) in ${basename(skillDir)}/SKILL.md`,
	);

	const outputDir = join(skillDir, "diagrams");
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir);
	}

	if (combine) {
		// Combine all graphs into one
		const combined = combineGraphs(blocks, skillName);
		const svg = renderToSvg(combined);
		if (svg) {
			const outputPath = join(outputDir, `${skillName}_combined.svg`);
			writeFileSync(outputPath, svg);
			console.log(`  Rendered: ${skillName}_combined.svg`);

			// Also write the dot source for debugging
			const dotPath = join(outputDir, `${skillName}_combined.dot`);
			writeFileSync(dotPath, combined);
			console.log(`  Source: ${skillName}_combined.dot`);
		} else {
			console.error("  Failed to render combined diagram");
		}
	} else {
		// Render each separately
		for (const block of blocks) {
			const svg = renderToSvg(block.content);
			if (svg) {
				const outputPath = join(outputDir, `${block.name}.svg`);
				writeFileSync(outputPath, svg);
				console.log(`  Rendered: ${block.name}.svg`);
			} else {
				console.error(`  Failed: ${block.name}`);
			}
		}
	}

	console.log(`\nOutput: ${outputDir}/`);
}

main();
