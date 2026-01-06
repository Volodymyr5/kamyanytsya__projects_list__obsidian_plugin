export interface ProjectFile {
	file: string;
	folderName: string;
	folderPath: string;
	flag: number | null;
	priority: number | null;
	isDraft: boolean;
	tasksDone: number;
	tasksTotal: number;
	tasksGroupsCount: number;
	updated: Date;
}

export interface SortConfig {
	column: string;
	direction: "asc" | "desc";
}

export interface PaginationConfig {
	pageSize: number;
	currentPage: number;
}

export interface TableState {
	sort?: SortConfig;
	pagination?: PaginationConfig;
}

export type SortableColumn = 
	| "№"
	| "Flag"
	| "Name"
	| "Path"
	| "Tasks Done"
	| "Tasks Total"
	| "Tasks Groups Count"
	| "Draft"
	| "Updated";

