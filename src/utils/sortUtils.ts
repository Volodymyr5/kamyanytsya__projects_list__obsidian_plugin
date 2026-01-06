import { ProjectFile, SortableColumn } from "../types";

export class SortUtils {
	static sort(
		files: ProjectFile[],
		column: SortableColumn,
		direction: "asc" | "desc"
	): ProjectFile[] {
		const sorted = [...files].sort((a, b) => {
			let comparison = 0;

			switch (column) {
				case "№":
					comparison = 0;
					break;
				case "Flag":
					comparison = (a.flag ?? 0) - (b.flag ?? 0);
					break;
				case "Name":
					comparison = a.folderName.localeCompare(b.folderName);
					break;
				case "Path":
					comparison = a.folderPath.localeCompare(b.folderPath);
					break;
				case "Tasks Done":
					comparison = a.tasksDone - b.tasksDone;
					break;
				case "Tasks Total":
					comparison = a.tasksTotal - b.tasksTotal;
					break;
				case "Tasks Groups Count":
					comparison = a.tasksGroupsCount - b.tasksGroupsCount;
					break;
				case "Draft":
					comparison = (a.isDraft ? 1 : 0) - (b.isDraft ? 1 : 0);
					break;
				case "Updated":
					comparison = a.updated.getTime() - b.updated.getTime();
					break;
			}

			return direction === "asc" ? comparison : -comparison;
		});

		return sorted;
	}
}

