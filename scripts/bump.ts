#!/usr/bin/env bun

/**
 * Bumps a plugin's version across all manifest files.
 *
 * Usage: bun run bump <plugin-name> [patch|minor|major]
 *
 * Updates version in:
 *   - .claude-plugin/marketplace.json
 *   - plugins/<name>/.claude-plugin/plugin.json
 *   - plugins/<name>/package.json (if it exists)
 */

const ROOT = import.meta.dirname
	? new URL("..", `file://${import.meta.dirname}/`).pathname.replace(/\/$/, "")
	: process.cwd();

const MARKETPLACE_PATH = `${ROOT}/.claude-plugin/marketplace.json`;

type BumpType = "patch" | "minor" | "major";

function bumpVersion(version: string, type: BumpType): string {
	const parts = version.split(".").map(Number);
	if (parts.length !== 3 || parts.some(Number.isNaN)) {
		throw new Error(`Invalid semver: ${version}`);
	}
	const [major, minor, patch] = parts;
	switch (type) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
}

async function readJson(path: string): Promise<Record<string, unknown>> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`File not found: ${path}`);
	}
	return file.json();
}

async function writeJson(path: string, data: unknown): Promise<void> {
	await Bun.write(path, `${JSON.stringify(data, null, "\t")}\n`);
}

async function main() {
	const args = process.argv.slice(2);
	const pluginName = args[0];
	const bumpType = (args[1] || "patch") as BumpType;

	if (!pluginName || ["--help", "-h"].includes(pluginName)) {
		console.log("Usage: bun run bump <plugin-name> [patch|minor|major]");
		console.log("");
		console.log(
			"Bumps version in marketplace.json, plugin.json, and package.json",
		);
		process.exit(pluginName ? 0 : 1);
	}

	if (!["patch", "minor", "major"].includes(bumpType)) {
		console.error(
			`Invalid bump type: ${bumpType} (use patch, minor, or major)`,
		);
		process.exit(1);
	}

	// Read marketplace.json
	const marketplace = await readJson(MARKETPLACE_PATH);
	const plugins = marketplace.plugins as Array<{
		name: string;
		version: string;
	}>;
	const entry = plugins.find((p) => p.name === pluginName);

	if (!entry) {
		const names = plugins.map((p) => p.name).join(", ");
		console.error(`Plugin "${pluginName}" not found. Available: ${names}`);
		process.exit(1);
	}

	const oldVersion = entry.version;
	const newVersion = bumpVersion(oldVersion, bumpType);

	// 1. Bump marketplace.json
	entry.version = newVersion;
	await writeJson(MARKETPLACE_PATH, marketplace);

	// 2. Bump plugin.json
	const pluginJsonPath = `${ROOT}/plugins/${pluginName}/.claude-plugin/plugin.json`;
	const pluginJson = await readJson(pluginJsonPath);
	pluginJson.version = newVersion;
	await writeJson(pluginJsonPath, pluginJson);

	// 3. Bump package.json if it exists
	const packageJsonPath = `${ROOT}/plugins/${pluginName}/package.json`;
	const packageFile = Bun.file(packageJsonPath);
	if (await packageFile.exists()) {
		const packageJson = await packageFile.json();
		packageJson.version = newVersion;
		await writeJson(packageJsonPath, packageJson);
	}

	console.log(`${pluginName}: ${oldVersion} → ${newVersion}`);
}

main();
