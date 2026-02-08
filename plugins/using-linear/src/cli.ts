#!/usr/bin/env bun
import { homedir } from "node:os";
import { join } from "node:path";
import { defineCommand, runMain } from "citty";
import { issueCommand } from "./commands/issue";
import { labelCommand } from "./commands/label";
import { projectCommand } from "./commands/project";
import { syncCommand } from "./commands/sync";
import { teamCommand } from "./commands/team";
import { loadConfig, loadEnv } from "./lib/config";
import { setGlobalConfig } from "./lib/context";
import { initLinearClient } from "./lib/linear";

const main = defineCommand({
	meta: {
		name: "linear",
		description: "CLI for interacting with Linear",
		version: "0.1.0",
	},
	async setup() {
		const configPath = join(homedir(), ".linear-cli", "config.json");
		try {
			const config = await loadConfig(configPath);
			setGlobalConfig(config);
			const env = await loadEnv(config.env_file);
			initLinearClient(env.LINEAR_API_KEY);
		} catch (error) {
			// Allow --help to work without config
			if (!process.argv.includes("--help") && !process.argv.includes("-h")) {
				throw error;
			}
		}
	},
	subCommands: {
		issue: issueCommand,
		label: labelCommand,
		project: projectCommand,
		sync: syncCommand,
		team: teamCommand,
	},
});

runMain(main);
