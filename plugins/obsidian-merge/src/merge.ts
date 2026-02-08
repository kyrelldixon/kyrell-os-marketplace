import { join } from "node:path";
import { stat, mkdir } from "node:fs/promises";

export interface MergeOptions {
	/** Prefer target files when conflicts occur (default: prefer source) */
	preferTarget?: boolean;
	/** Dry run - don't actually copy files */
	dryRun?: boolean;
}

export interface MergeResult {
	copied: string[];
	skipped: string[];
	conflicts: string[];
	kept: string[];
}

/** Files that are ephemeral and should be skipped */
const EPHEMERAL_FILES = new Set([
	"workspace.json",
	"workspace-mobile.json",
	"graph.json",
]);

/** Directories that should be installed fresh, not merged */
const SKIP_DIRECTORIES = new Set(["plugins", "themes", ".trash"]);

/**
 * Check if a path exists (file or directory)
 */
async function exists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a path is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
	try {
		const s = await stat(path);
		return s.isDirectory();
	} catch {
		return false;
	}
}

/**
 * Get all files in a directory recursively using Bun.Glob
 */
async function getFiles(
	dir: string,
): Promise<{ path: string; relativePath: string }[]> {
	const files: { path: string; relativePath: string }[] = [];

	if (!(await exists(dir))) {
		return files;
	}

	// Use Glob to get all files
	const glob = new Bun.Glob("**/*");

	for await (const relativePath of glob.scan({ cwd: dir, onlyFiles: true })) {
		const pathParts = relativePath.split("/");
		const filename = pathParts[pathParts.length - 1];
		const topDir = pathParts[0];

		// Skip ephemeral files
		if (EPHEMERAL_FILES.has(filename)) {
			continue;
		}

		// Skip files in directories we shouldn't merge
		if (SKIP_DIRECTORIES.has(topDir)) {
			continue;
		}

		files.push({
			path: join(dir, relativePath),
			relativePath,
		});
	}

	return files;
}

/**
 * Copy a file using Bun
 */
async function copyFile(source: string, target: string): Promise<void> {
	const content = await Bun.file(source).arrayBuffer();
	await Bun.write(target, content);
}

/**
 * Create directory recursively
 */
async function mkdirRecursive(path: string): Promise<void> {
	await mkdir(path, { recursive: true });
}

/**
 * Get directory entries using Bun.Glob
 */
async function getDirectoryEntries(
	dir: string,
): Promise<{ name: string; isDirectory: boolean }[]> {
	const entries: { name: string; isDirectory: boolean }[] = [];
	const seen = new Set<string>();

	// Get files
	const fileGlob = new Bun.Glob("*");
	for await (const name of fileGlob.scan({ cwd: dir, onlyFiles: true })) {
		if (!seen.has(name)) {
			seen.add(name);
			entries.push({ name, isDirectory: false });
		}
	}

	// Get directories
	const dirGlob = new Bun.Glob("*/");
	for await (const name of dirGlob.scan({ cwd: dir, onlyFiles: false })) {
		const cleanName = name.replace(/\/$/, "");
		if (!seen.has(cleanName)) {
			seen.add(cleanName);
			entries.push({ name: cleanName, isDirectory: true });
		}
	}

	return entries;
}

/**
 * Merge two .obsidian directories
 *
 * @param sourcePath - The source .obsidian directory (settings to merge FROM)
 * @param targetPath - The target .obsidian directory (settings to merge INTO)
 * @param options - Merge options
 */
export async function mergeObsidianSettings(
	sourcePath: string,
	targetPath: string,
	options: MergeOptions = {},
): Promise<MergeResult> {
	const { preferTarget = false, dryRun = false } = options;

	const result: MergeResult = {
		copied: [],
		skipped: [],
		conflicts: [],
		kept: [],
	};

	// Validate paths
	if (!(await exists(sourcePath))) {
		throw new Error(`Source path does not exist: ${sourcePath}`);
	}

	if (!(await isDirectory(sourcePath))) {
		throw new Error(`Source path is not a directory: ${sourcePath}`);
	}

	// Create target if it doesn't exist
	if (!(await exists(targetPath))) {
		if (!dryRun) {
			await mkdirRecursive(targetPath);
		}
	}

	// Get all files from source
	const sourceFiles = await getFiles(sourcePath);

	for (const { path: sourceFilePath, relativePath } of sourceFiles) {
		const targetFilePath = join(targetPath, relativePath);
		const targetExists = await exists(targetFilePath);

		if (targetExists) {
			// Conflict - file exists in both
			result.conflicts.push(relativePath);

			if (preferTarget) {
				// Keep target's version
				result.kept.push(relativePath);
			} else {
				// Prefer source - copy over
				if (!dryRun) {
					// Ensure parent directory exists
					const parentDir = join(targetPath, relativePath, "..");
					await mkdirRecursive(parentDir);
					await copyFile(sourceFilePath, targetFilePath);
				}
				result.copied.push(relativePath);
			}
		} else {
			// No conflict - copy from source
			if (!dryRun) {
				// Ensure parent directory exists
				const parentDir = join(targetPath, relativePath, "..");
				await mkdirRecursive(parentDir);
				await copyFile(sourceFilePath, targetFilePath);
			}
			result.copied.push(relativePath);
		}
	}

	// Track skipped files (ephemeral + directories)
	const allSourceEntries = await getDirectoryEntries(sourcePath);
	for (const entry of allSourceEntries) {
		if (EPHEMERAL_FILES.has(entry.name)) {
			result.skipped.push(`${entry.name} (ephemeral)`);
		}
		if (entry.isDirectory && SKIP_DIRECTORIES.has(entry.name)) {
			result.skipped.push(`${entry.name}/ (install fresh)`);
		}
	}

	return result;
}
