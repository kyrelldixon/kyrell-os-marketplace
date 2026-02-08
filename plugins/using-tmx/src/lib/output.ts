import type { SessionInfo, WaitForTextResult } from "./tmux";

export interface OutputOptions {
	json?: boolean;
}

export function formatSession(session: SessionInfo): string {
	const status = session.attached ? "attached" : "detached";
	const windowLabel = session.windows === 1 ? "window" : "windows";
	return `${session.name} (${status}, ${session.windows} ${windowLabel}, created ${session.created})`;
}

export function formatSessionCreated(
	name: string,
	options: OutputOptions = {},
): string {
	if (options.json) {
		return JSON.stringify({ session: name }, null, 2);
	}
	return `Created session: ${name}`;
}

export function formatCapture(
	content: string,
	options: OutputOptions = {},
): string {
	if (options.json) {
		return JSON.stringify({ content }, null, 2);
	}
	return content;
}

export function formatSendKeys(
	target: string,
	options: OutputOptions = {},
): string {
	if (options.json) {
		return JSON.stringify({ target, sent: true }, null, 2);
	}
	return `Sent keys to ${target}`;
}

export function formatWaitResult(
	result: WaitForTextResult,
	options: OutputOptions = {},
): string {
	if (options.json) {
		return JSON.stringify(result, null, 2);
	}

	if (result.matched) {
		return `Matched after ${result.elapsed.toFixed(1)}s: ${result.match}`;
	}

	return `Timed out after ${result.elapsed.toFixed(1)}s. No match found.`;
}

export function formatList<T>(
	items: T[],
	formatter: (item: T) => string,
	options: OutputOptions = {},
): string {
	if (options.json) {
		return JSON.stringify(items, null, 2);
	}

	if (items.length === 0) {
		return "No items found.";
	}

	return items.map(formatter).join("\n");
}
