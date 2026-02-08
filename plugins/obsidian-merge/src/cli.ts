#!/usr/bin/env bun
import { mergeObsidianSettings } from "./merge";

const args = process.argv.slice(2);

function printUsage() {
	console.log(`
obsidian-merge - Merge two Obsidian .obsidian folders

Usage:
  obsidian-merge <source> <target> [options]

Arguments:
  source    The source .obsidian directory (settings to merge FROM)
  target    The target .obsidian directory (settings to merge INTO)

Options:
  --prefer-target    Keep target files when conflicts occur (default: prefer source)
  --dry-run          Show what would happen without making changes
  --help             Show this help message

Examples:
  # Merge settings from old vault to new vault (prefer old settings)
  obsidian-merge ~/old-vault/.obsidian ~/new-vault/.obsidian

  # Preview what would happen
  obsidian-merge ~/old-vault/.obsidian ~/new-vault/.obsidian --dry-run

  # Keep new vault settings when conflicts occur
  obsidian-merge ~/old-vault/.obsidian ~/new-vault/.obsidian --prefer-target

Notes:
  - Ephemeral files (workspace.json, graph.json) are always skipped
  - Plugin and theme directories are skipped (install fresh instead)
  - By default, source files win when conflicts occur
`);
}

async function main() {
	if (args.includes("--help") || args.length < 2) {
		printUsage();
		process.exit(args.includes("--help") ? 0 : 1);
	}

	const sourcePath = args[0];
	const targetPath = args[1];
	const preferTarget = args.includes("--prefer-target");
	const dryRun = args.includes("--dry-run");

	if (dryRun) {
		console.log("🔍 Dry run mode - no changes will be made\n");
	}

	try {
		const result = await mergeObsidianSettings(sourcePath, targetPath, {
			preferTarget,
			dryRun,
		});

		console.log("📁 Merge Results:\n");

		if (result.copied.length > 0) {
			console.log(`✅ Copied (${result.copied.length}):`);
			for (const file of result.copied) {
				console.log(`   ${file}`);
			}
			console.log();
		}

		if (result.kept.length > 0) {
			console.log(`📌 Kept target version (${result.kept.length}):`);
			for (const file of result.kept) {
				console.log(`   ${file}`);
			}
			console.log();
		}

		if (result.conflicts.length > 0) {
			const action = preferTarget ? "kept target" : "used source";
			console.log(
				`⚠️  Conflicts resolved - ${action} (${result.conflicts.length}):`,
			);
			for (const file of result.conflicts) {
				console.log(`   ${file}`);
			}
			console.log();
		}

		if (result.skipped.length > 0) {
			console.log(`⏭️  Skipped (${result.skipped.length}):`);
			for (const file of result.skipped) {
				console.log(`   ${file}`);
			}
			console.log();
		}

		if (dryRun) {
			console.log(
				"✨ Dry run complete. Run without --dry-run to apply changes.",
			);
		} else {
			console.log("✨ Merge complete!");
		}
	} catch (error) {
		console.error(`❌ Error: ${(error as Error).message}`);
		process.exit(1);
	}
}

main();
