import { TFile, Vault } from "obsidian";
import { ProjectFile } from "../types";

export class MetadataService {
	constructor(private vault: Vault) {}

	async extractMetadata(file: TFile): Promise<ProjectFile> {
		const content = await this.vault.read(file);
		const stat = file.stat;

		const flag = this.extractFlag(content);
		const priority = this.extractPriority(content);
		const isDraft = this.hasDraftTag(content);
		const { tasksDone, tasksTotal, tasksGroupsCount } = this.countTasks(content);

		const folderName = file.parent?.name || "";
		const folderPath = file.parent?.path || "";

		return {
			file: file.path,
			folderName,
			folderPath,
			flag,
			priority,
			isDraft,
			tasksDone,
			tasksTotal,
			tasksGroupsCount,
			updated: new Date(stat.mtime),
		};
	}

	private extractFlag(content: string): number | null {
		const flagMatch = content.match(/#flag([1-5])/);
		return flagMatch ? parseInt(flagMatch[1], 10) : null;
	}

	private extractPriority(content: string): number | null {
		const priorityMatch = content.match(/#priority([1-5])/);
		return priorityMatch ? parseInt(priorityMatch[1], 10) : null;
	}

	private hasDraftTag(content: string): boolean {
		return /#draft/.test(content);
	}

	private countTasks(content: string): {
		tasksDone: number;
		tasksTotal: number;
		tasksGroupsCount: number;
	} {
		const checkboxRegex = /- \[([ x])\]/g;
		let tasksDone = 0;
		let tasksTotal = 0;
		let match;

		while ((match = checkboxRegex.exec(content)) !== null) {
			tasksTotal++;
			if (match[1] === "x") {
				tasksDone++;
			}
		}

		// Count checkbox groups (consecutive checkboxes)
		const lines = content.split("\n");
		let groupsCount = 0;
		let inGroup = false;

		for (const line of lines) {
			if (/- \[[ x]\]/.test(line)) {
				if (!inGroup) {
					groupsCount++;
					inGroup = true;
				}
			} else {
				inGroup = false;
			}
		}

		return { tasksDone, tasksTotal, tasksGroupsCount: groupsCount };
	}
}

