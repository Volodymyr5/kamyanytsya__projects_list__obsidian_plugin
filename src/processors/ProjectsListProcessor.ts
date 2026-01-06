import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { App } from "obsidian";
import { FileUtils } from "../utils/fileUtils";
import { MetadataService } from "../services/metadataService";
import { ProjectsTable } from "../components/ProjectsTable";
import { ProjectFile } from "../types";

export class ProjectsListProcessor extends MarkdownRenderChild {
	private tableComponent: ProjectsTable | null = null;

	constructor(
		private app: App,
		containerEl: HTMLElement,
		private source: string,
		private filePath: string
	) {
		super(containerEl);
	}

	async onload(): Promise<void> {
		await this.render();

		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file.path === this.filePath) {
					this.refresh();
				}
			})
		);
	}

	private async render(): Promise<void> {
		const fileNames: string[] = [];
		const lines = this.source.split("\n");
		
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			
			const names = trimmed.split(",").map(name => name.trim()).filter(name => name.length > 0);
			fileNames.push(...names);
		}

		if (fileNames.length === 0) {
			this.containerEl.createEl("div", {
				text: "No file names specified",
				cls: "projects-list__error",
			});
			return;
		}

		const fileUtils = new FileUtils(this.app.vault);
		const files = await fileUtils.findFilesByNames(fileNames);

		if (files.length === 0) {
			this.containerEl.createEl("div", {
				text: "No matching files found",
				cls: "projects-list__error",
			});
			return;
		}

		const metadataService = new MetadataService(this.app.vault);
		const projectFiles: ProjectFile[] = [];

		for (const file of files) {
			try {
				const metadata = await metadataService.extractMetadata(file);
				projectFiles.push(metadata);
			} catch (error) {
				console.error(`Error processing file ${file.path}:`, error);
			}
		}

		const tableContainer = this.containerEl.createEl("div", {
			cls: "projects-list__container",
		});

		this.tableComponent = new ProjectsTable(
			this.app,
			tableContainer,
			projectFiles,
			this.filePath
		);
		this.addChild(this.tableComponent);
	}

	public async refresh(): Promise<void> {
		this.containerEl.empty();
		this.tableComponent = null;
		await this.render();
	}
}

