import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mergeObsidianSettings } from "../src/merge";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rm, mkdir, stat } from "node:fs/promises";

const TEST_DIR = join(tmpdir(), "obsidian-merge-tests");

async function exists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function createTestFile(dir: string, filename: string, content: string) {
	const filePath = join(dir, filename);
	const parentDir = join(filePath, "..");
	await mkdir(parentDir, { recursive: true });
	await Bun.write(filePath, content);
}

async function readTestFile(path: string): Promise<string> {
	return Bun.file(path).text();
}

describe("mergeObsidianSettings", () => {
	let sourcePath: string;
	let targetPath: string;

	beforeEach(async () => {
		// Clean up and create fresh test directories
		await rm(TEST_DIR, { recursive: true, force: true });
		sourcePath = join(TEST_DIR, "source");
		targetPath = join(TEST_DIR, "target");
		await mkdir(sourcePath, { recursive: true });
		await mkdir(targetPath, { recursive: true });
	});

	afterEach(async () => {
		await rm(TEST_DIR, { recursive: true, force: true });
	});

	test("copies files from source to empty target", async () => {
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');
		await createTestFile(sourcePath, "appearance.json", '{"theme": "dark"}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.copied).toContain("app.json");
		expect(result.copied).toContain("appearance.json");
		expect(result.conflicts).toHaveLength(0);

		const appContent = await readTestFile(join(targetPath, "app.json"));
		expect(appContent).toBe('{"vimMode": true}');
	});

	test("prefers source files on conflict by default", async () => {
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');
		await createTestFile(targetPath, "app.json", '{"vimMode": false}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.conflicts).toContain("app.json");
		expect(result.copied).toContain("app.json");
		expect(result.kept).toHaveLength(0);

		const content = await readTestFile(join(targetPath, "app.json"));
		expect(content).toBe('{"vimMode": true}');
	});

	test("prefers target files on conflict with preferTarget option", async () => {
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');
		await createTestFile(targetPath, "app.json", '{"vimMode": false}');

		const result = await mergeObsidianSettings(sourcePath, targetPath, {
			preferTarget: true,
		});

		expect(result.conflicts).toContain("app.json");
		expect(result.kept).toContain("app.json");
		expect(result.copied).not.toContain("app.json");

		const content = await readTestFile(join(targetPath, "app.json"));
		expect(content).toBe('{"vimMode": false}');
	});

	test("skips ephemeral files (workspace.json)", async () => {
		await createTestFile(sourcePath, "workspace.json", '{"layout": "test"}');
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.skipped).toContain("workspace.json (ephemeral)");
		expect(result.copied).toContain("app.json");
		expect(await exists(join(targetPath, "workspace.json"))).toBe(false);
	});

	test("skips workspace-mobile.json", async () => {
		await createTestFile(sourcePath, "workspace-mobile.json", '{"mobile": true}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.skipped).toContain("workspace-mobile.json (ephemeral)");
		expect(await exists(join(targetPath, "workspace-mobile.json"))).toBe(false);
	});

	test("skips graph.json", async () => {
		await createTestFile(sourcePath, "graph.json", '{"graph": "data"}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.skipped).toContain("graph.json (ephemeral)");
	});

	test("skips plugins directory", async () => {
		await createTestFile(sourcePath, "plugins/test-plugin/main.js", "code");
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.skipped).toContain("plugins/ (install fresh)");
		expect(await exists(join(targetPath, "plugins"))).toBe(false);
		expect(result.copied).toContain("app.json");
	});

	test("skips themes directory", async () => {
		await createTestFile(sourcePath, "themes/my-theme/manifest.json", "{}");

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.skipped).toContain("themes/ (install fresh)");
		expect(await exists(join(targetPath, "themes"))).toBe(false);
	});

	test("dry run does not modify files", async () => {
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');

		const result = await mergeObsidianSettings(sourcePath, targetPath, {
			dryRun: true,
		});

		expect(result.copied).toContain("app.json");
		expect(await exists(join(targetPath, "app.json"))).toBe(false);
	});

	test("handles nested directories correctly", async () => {
		await createTestFile(sourcePath, "snippets/custom.css", ".test { }");

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.copied).toContain(join("snippets", "custom.css"));
		const content = await readTestFile(join(targetPath, "snippets", "custom.css"));
		expect(content).toBe(".test { }");
	});

	test("throws error if source does not exist", async () => {
		await expect(
			mergeObsidianSettings("/nonexistent/path", targetPath),
		).rejects.toThrow("Source path does not exist");
	});

	test("creates target directory if it does not exist", async () => {
		const newTargetPath = join(TEST_DIR, "new-target");
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');

		await mergeObsidianSettings(sourcePath, newTargetPath);

		expect(await exists(newTargetPath)).toBe(true);
		expect(await exists(join(newTargetPath, "app.json"))).toBe(true);
	});

	test("handles multiple file types", async () => {
		await createTestFile(sourcePath, "app.json", '{"vimMode": true}');
		await createTestFile(sourcePath, "appearance.json", '{"theme": "dark"}');
		await createTestFile(sourcePath, "core-plugins.json", '["daily-notes"]');
		await createTestFile(sourcePath, "community-plugins.json", '["dataview"]');
		await createTestFile(sourcePath, "hotkeys.json", '{}');
		await createTestFile(sourcePath, "daily-notes.json", '{"folder": "daily"}');
		await createTestFile(sourcePath, "templates.json", '{"folder": "templates"}');

		const result = await mergeObsidianSettings(sourcePath, targetPath);

		expect(result.copied).toHaveLength(7);
		expect(result.copied).toContain("app.json");
		expect(result.copied).toContain("appearance.json");
		expect(result.copied).toContain("core-plugins.json");
		expect(result.copied).toContain("community-plugins.json");
		expect(result.copied).toContain("hotkeys.json");
		expect(result.copied).toContain("daily-notes.json");
		expect(result.copied).toContain("templates.json");
	});

	test("only copies new files when target has some files", async () => {
		await createTestFile(sourcePath, "app.json", '{"source": true}');
		await createTestFile(sourcePath, "new-file.json", '{"new": true}');
		await createTestFile(targetPath, "app.json", '{"target": true}');

		const result = await mergeObsidianSettings(sourcePath, targetPath, {
			preferTarget: true,
		});

		expect(result.copied).toContain("new-file.json");
		expect(result.kept).toContain("app.json");

		// app.json should still have target content
		const appContent = await readTestFile(join(targetPath, "app.json"));
		expect(appContent).toBe('{"target": true}');

		// new-file.json should be copied
		const newContent = await readTestFile(join(targetPath, "new-file.json"));
		expect(newContent).toBe('{"new": true}');
	});
});
