#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import { capturePaneCommand } from "./commands/capture-pane";
import { killSessionCommand } from "./commands/kill-session";
import { listSessionsCommand } from "./commands/list-sessions";
import { newSessionCommand } from "./commands/new-session";
import { sendKeysCommand } from "./commands/send-keys";
import { waitForTextCommand } from "./commands/wait-for-text";

const main = defineCommand({
	meta: {
		name: "tmx",
		description:
			"tmux wrapper for agent use — familiar commands with reliability fixes",
		version: "0.1.0",
	},
	subCommands: {
		"list-sessions": listSessionsCommand,
		"new-session": newSessionCommand,
		"kill-session": killSessionCommand,
		"send-keys": sendKeysCommand,
		"capture-pane": capturePaneCommand,
		"wait-for-text": waitForTextCommand,
	},
});

runMain(main);
