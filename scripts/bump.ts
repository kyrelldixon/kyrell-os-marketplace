#!/usr/bin/env bun

/**
 * Bump a plugin's version in both plugin.json and marketplace.json.
 *
 * Usage:
 *   bun run scripts/bump.ts <plugin-name> [patch|minor|major]
 *
 * Defaults to "patch" if no bump type specified.
 *
 * Examples:
 *   bun run scripts/bump.ts developer-skills minor   # 0.2.0 -> 0.3.0
 *   bun run scripts/bump.ts using-tmx                # 0.2.0 -> 0.2.1
 *   bun run scripts/bump.ts handoff major             # 0.1.0 -> 1.0.0
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const MARKETPLACE_PATH = join(ROOT, ".claude-plugin/marketplace.json");

type BumpType = "patch" | "minor" | "major";

function bump(version: string, type: BumpType): string {
	const [major, minor, patch] = version.split(".").map(Number);
	switch (type) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
}

function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path: string, data: Record<string, unknown>): void {
	writeFileSync(path, `${JSON.stringify(data, null, "\t")}\n`, "utf-8");
}

function main(): void {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log("Usage: bun run scripts/bump.ts <plugin-name> [patch|minor|major]");
		process.exit(0);
	}

	const pluginName = args[0];
	const bumpType = (args[1] as BumpType) || "patch";

	if (!["patch", "minor", "major"].includes(bumpType)) {
		console.error(`Invalid bump type: "${bumpType}". Use patch, minor, or major.`);
		process.exit(1);
	}

	// 1. Update plugin.json
	const pluginJsonPath = join(ROOT, `plugins/${pluginName}/.claude-plugin/plugin.json`);
	let pluginJson: Record<string, unknown>;
	try {
		pluginJson = readJson(pluginJsonPath);
	} catch {
		console.error(`Plugin not found: plugins/${pluginName}/.claude-plugin/plugin.json`);
		process.exit(1);
	}

	const oldVersion = pluginJson.version as string;
	const newVersion = bump(oldVersion, bumpType);
	pluginJson.version = newVersion;
	writeJson(pluginJsonPath, pluginJson);

	// 2. Update marketplace.json
	const marketplace = readJson(MARKETPLACE_PATH);
	const plugins = marketplace.plugins as Array<Record<string, unknown>>;
	const entry = plugins.find((p) => p.name === pluginName);

	if (!entry) {
		console.error(`Plugin "${pluginName}" not found in marketplace.json`);
		// Revert plugin.json
		pluginJson.version = oldVersion;
		writeJson(pluginJsonPath, pluginJson);
		process.exit(1);
	}

	entry.version = newVersion;
	writeJson(MARKETPLACE_PATH, marketplace);

	console.log(`${pluginName}: ${oldVersion} -> ${newVersion}`);
}

main();
