import { App, TFile } from "obsidian";
import { TableState } from "../types";

export class FrontmatterUtils {
	constructor(private app: App) {}

	getTableState(filePath: string): TableState | null {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file) {
			return null;
		}

		const cache = this.app.metadataCache.getFileCache(file as TFile);
		if (!cache?.frontmatter) {
			return null;
		}

		const sortStr = cache.frontmatter["projects-list-sort"];
		const paginationStr = cache.frontmatter["projects-list-pagination"];

		if (!sortStr && !paginationStr) {
			return null;
		}

		let sort: TableState["sort"];
		let pagination: TableState["pagination"];

		try {
			if (sortStr) {
				sort = typeof sortStr === "string" ? JSON.parse(sortStr) : sortStr;
			}
			if (paginationStr) {
				pagination =
					typeof paginationStr === "string"
						? JSON.parse(paginationStr)
						: paginationStr;
			}
		} catch (e) {
			console.error("Error parsing frontmatter state:", e);
			return null;
		}

		return { sort, pagination };
	}

	async saveTableState(filePath: string, state: TableState): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file || !(file instanceof TFile)) {
			return;
		}

		let content = await this.app.vault.read(file);
		const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;

		let frontmatterObj: Record<string, any> = {};
		let hasFrontmatter = false;

		if (frontmatterRegex.test(content)) {
			hasFrontmatter = true;
			const match = content.match(frontmatterRegex);
			if (match && match[1]) {
				const frontmatterText = match[1];
				const lines = frontmatterText.split("\n");

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed || trimmed.startsWith("#")) continue;

					const colonIndex = trimmed.indexOf(":");
					if (colonIndex > 0) {
						const key = trimmed.substring(0, colonIndex).trim();
						let value = trimmed.substring(colonIndex + 1).trim();

						if (
							(value.startsWith('"') && value.endsWith('"')) ||
							(value.startsWith("'") && value.endsWith("'"))
						) {
							value = value.slice(1, -1);
						}

						if (
							key !== "projects-list-sort" &&
							key !== "projects-list-pagination"
						) {
							frontmatterObj[key] = value;
						}
					}
				}
			}
		}

		if (state.sort) {
			frontmatterObj["projects-list-sort"] = JSON.stringify(state.sort);
		}
		if (state.pagination) {
			frontmatterObj["projects-list-pagination"] = JSON.stringify(
				state.pagination
			);
		}

		const frontmatterLines = Object.entries(frontmatterObj).map(
			([key, value]) => {
				if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
					return `${key}: "${value.replace(/"/g, '\\"')}"`;
				}
				if (typeof value === "string" && (value.includes(":") || value.includes(" "))) {
					return `${key}: "${value}"`;
				}
				return `${key}: ${value}`;
			}
		);

		const newFrontmatter = `---\n${frontmatterLines.join("\n")}\n---\n`;

		if (hasFrontmatter) {
			content = content.replace(frontmatterRegex, newFrontmatter);
		} else {
			if (content && !content.startsWith("\n")) {
				content = "\n" + content;
			}
			content = newFrontmatter + content;
		}

		await this.app.vault.modify(file, content);
	}
}

