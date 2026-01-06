import { App, Component } from "obsidian";
import { ProjectFile, SortableColumn, TableState } from "../types";
import { SortUtils } from "../utils/SortUtils";
import { FrontmatterUtils } from "../utils/FrontmatterUtils";

const COLUMN_CLASS_MAP: Record<SortableColumn, string> = {
	"№": "projects-list__cell--col-index",
	Flag: "projects-list__cell--col-flag",
	Name: "projects-list__cell--col-name",
	Path: "projects-list__cell--col-path",
	"Tasks Done": "projects-list__cell--col-task-done",
	"Tasks Total": "projects-list__cell--col-task-total",
	"Tasks Groups Count": "projects-list__cell--col-task-groups",
	Draft: "projects-list__cell--col-draft",
	Updated: "projects-list__cell--col-updated",
};

export class ProjectsTable extends Component {
	private tableEl: HTMLElement;
	private currentSort: { column: SortableColumn; direction: "asc" | "desc" } = {
		column: "Updated",
		direction: "desc",
	};
	private currentPageSize = 25;
	private currentPage = 1;
	private allFiles: ProjectFile[] = [];
	private filePath: string;

	constructor(
		private app: App,
		private containerEl: HTMLElement,
		files: ProjectFile[],
		filePath: string
	) {
		super();
		this.allFiles = files;
		this.filePath = filePath;
		this.loadState();
	}

	onload(): void {
		this.render();
	}

	private loadState(): void {
		const frontmatterUtils = new FrontmatterUtils(this.app);
		const state = frontmatterUtils.getTableState(this.filePath);

		if (state?.sort) {
			this.currentSort = {
				column: state.sort.column as SortableColumn,
				direction: state.sort.direction,
			};
		}

		if (state?.pagination) {
			this.currentPageSize = state.pagination.pageSize || 25;
			this.currentPage = state.pagination.currentPage || 1;
		}
	}

	private async saveState(): Promise<void> {
		const frontmatterUtils = new FrontmatterUtils(this.app);
		await frontmatterUtils.saveTableState(this.filePath, {
			sort: this.currentSort,
			pagination: {
				pageSize: this.currentPageSize,
				currentPage: this.currentPage,
			},
		});
	}

	private render(): void {
		this.containerEl.empty();

		const sortedFiles = SortUtils.sort(
			this.allFiles,
			this.currentSort.column,
			this.currentSort.direction
		);

		const totalPages = Math.ceil(sortedFiles.length / this.currentPageSize);
		const startIndex = (this.currentPage - 1) * this.currentPageSize;
		const endIndex = startIndex + this.currentPageSize;
		const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

		this.tableEl = this.containerEl.createEl("table", {
			cls: "projects-list__table",
		});

		this.renderHeader();
		this.renderBody(paginatedFiles, startIndex);
		
		if (sortedFiles.length > this.currentPageSize) {
			this.renderPagination(sortedFiles.length, totalPages);
		}
	}

	private renderHeader(): void {
		const thead = this.tableEl.createEl("thead", {
			cls: "projects-list__header",
		});
		const headerRow = thead.createEl("tr", {
			cls: "projects-list__header-row",
		});

		const columns: SortableColumn[] = [
			"№",
			"Flag",
			"Name",
			"Path",
			"Tasks Done",
			"Tasks Total",
			"Tasks Groups Count",
			"Draft",
			"Updated",
		];

		for (const column of columns) {
			const th = headerRow.createEl("th", {
				text: column,
				cls: "projects-list__header-cell projects-list__header-cell--sortable",
			});
			th.addClass(COLUMN_CLASS_MAP[column]);

			if (this.currentSort.column === column) {
				th.addClass("projects-list__header-cell--sorted");
				th.style.fontWeight = "bold";
				const arrow = this.currentSort.direction === "asc" ? "↑" : "↓";
				th.setText(`${column} ${arrow}`);
			}

			th.addEventListener("click", () => {
				if (this.currentSort.column === column) {
					this.currentSort.direction =
						this.currentSort.direction === "asc" ? "desc" : "asc";
				} else {
					this.currentSort.column = column;
					this.currentSort.direction = "asc";
				}
				this.currentPage = 1;
				this.saveState();
				this.render();
			});
		}
	}

	private renderBody(files: ProjectFile[], startIndex: number): void {
		const tbody = this.tableEl.createEl("tbody", {
			cls: "projects-list__body",
		});

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file) {
				continue;
			}
			const row = tbody.createEl("tr", {
				cls: "projects-list__row",
			});

			if (file.isDraft) {
				row.addClass("projects-list__row--draft");
			} else if (file.priority !== null) {
				row.addClass(`projects-list__row--priority-${file.priority}`);
			}

			const isCompleted = !file.isDraft && file.tasksTotal > 0 && file.tasksDone === file.tasksTotal;

			row.addEventListener("click", () => {
				this.app.workspace.openLinkText(file.file, "", false);
			});

			row.createEl("td", {
				text: String(startIndex + i + 1),
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["№"]}`,
			});

			const cell2 = row.createEl("td", {
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Flag"]}`,
			});
			if (file.flag !== null) {
				cell2.addClass(`projects-list__cell--flag-${file.flag}`);
				const flagIcon = this.getFlagIcon(file.flag);
				cell2.innerHTML = flagIcon;
			}

			row.createEl("td", {
				text: file.folderName,
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Name"]}`,
			});

			const pathCell = row.createEl("td", {
				text: file.folderPath,
				cls: `projects-list__cell projects-list__cell--path ${COLUMN_CLASS_MAP["Path"]}`,
			});

			const tasksDoneCell = row.createEl("td", {
				text: String(file.tasksDone),
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Tasks Done"]}`,
			});
			if (isCompleted) {
				tasksDoneCell.addClass("projects-list__cell--completed");
			}

			const tasksTotalCell = row.createEl("td", {
				text: String(file.tasksTotal),
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Tasks Total"]}`,
			});
			if (isCompleted) {
				tasksTotalCell.addClass("projects-list__cell--completed");
			}

			row.createEl("td", {
				text: String(file.tasksGroupsCount),
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Tasks Groups Count"]}`,
			});

			const draftCell = row.createEl("td", {
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Draft"]}`,
			});
			if (file.isDraft) {
				draftCell.innerHTML = "✏️";
			}

			const updatedText = this.formatDate(file.updated);
			row.createEl("td", {
				text: updatedText,
				cls: `projects-list__cell ${COLUMN_CLASS_MAP["Updated"]}`,
			});
		}
	}

	private renderPagination(totalItems: number, totalPages: number): void {
		const paginationEl = this.containerEl.createEl("div", {
			cls: "projects-list__pagination",
		});

		const pageSizeSelect = paginationEl.createEl("select", {
			cls: "projects-list__page-size-select",
		});

		const sizes = [25, 50, 100, 300];
		for (const size of sizes) {
			const option = pageSizeSelect.createEl("option", {
				text: String(size),
				value: String(size),
			});
			if (size === this.currentPageSize) {
				option.setAttr("selected", "true");
			}
		}

		pageSizeSelect.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			this.currentPageSize = parseInt(target.value, 10);
			this.currentPage = 1;
			this.saveState();
			this.render();
		});

		const pageInfo = paginationEl.createEl("span", {
			cls: "projects-list__page-info",
			text: `Page ${this.currentPage} of ${totalPages} (${totalItems} total)`,
		});

		const navContainer = paginationEl.createEl("div", {
			cls: "projects-list__nav-container",
		});

		const prevButton = navContainer.createEl("button", {
			cls: "projects-list__nav-button",
			text: "←",
		});
		prevButton.disabled = this.currentPage === 1;
		if (prevButton.disabled) {
			prevButton.addClass("projects-list__nav-button--disabled");
		}
		prevButton.addEventListener("click", () => {
			if (this.currentPage > 1) {
				this.currentPage--;
				this.saveState();
				this.render();
			}
		});

		const nextButton = navContainer.createEl("button", {
			cls: "projects-list__nav-button",
			text: "→",
		});
		nextButton.disabled = this.currentPage === totalPages;
		if (nextButton.disabled) {
			nextButton.addClass("projects-list__nav-button--disabled");
		}
		nextButton.addEventListener("click", () => {
			if (this.currentPage < totalPages) {
				this.currentPage++;
				this.saveState();
				this.render();
			}
		});
	}

	private getFlagIcon(flag: number): string {
		const icons = ["⚪", "🔵", "🟡", "🟠", "🔴"];
		return icons[flag - 1] || "";
	}

	private formatDate(date: Date): string {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();

		return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
	}

	public updateFiles(files: ProjectFile[]): void {
		this.allFiles = files;
		this.render();
	}
}

