import { Plugin, MarkdownRenderer, MarkdownView, MarkdownRenderChild } from "obsidian";
import { ProjectsListProcessor } from "./processors/ProjectsListProcessor";

export default class ProjectsListPlugin extends Plugin {
	async onload() {

		this.registerMarkdownCodeBlockProcessor(
			"projects_list__kamyanytsya",
			(source, el, ctx) => {
				const processor = new ProjectsListProcessor(
					this.app,
					el,
					source,
					ctx.sourcePath
				);
				ctx.addChild(processor);
			}
		);

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				setTimeout(() => this.refreshAllTables(), 100);
			})
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				setTimeout(() => this.refreshAllTables(), 100);
			})
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", () => {
				this.refreshAllTables();
			})
		);
	}

	onunload() {}

	private refreshAllTables(): void {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		for (const leaf of leaves) {
			const view = leaf.view as MarkdownView;
			if (view && view.file) {
				const anyView = view as any;
				if (
					anyView.previewMode &&
					typeof anyView.previewMode.rerender === "function"
				) {
					anyView.previewMode.rerender(true);
				}
			}
		}
	}
}

