import { TFile, Vault } from "obsidian";

export class FileUtils {
	constructor(private vault: Vault) {}

	async findFilesByNames(fileNames: string[]): Promise<TFile[]> {
		const allFiles = this.vault.getMarkdownFiles();
		const foundFiles: TFile[] = [];

		for (const fileName of fileNames) {
			const trimmedName = fileName.trim();
			if (!trimmedName) continue;

			const matchingFiles = allFiles.filter((file) => {
				const nameWithoutExt = file.basename;
				return nameWithoutExt === trimmedName;
			});

			foundFiles.push(...matchingFiles);
		}

		return foundFiles;
	}

	getFolderName(file: TFile): string {
		if (!file.parent) return "";
		return file.parent.name;
	}

	getFolderPath(file: TFile): string {
		if (!file.parent) return "";
		return file.parent.path;
	}
}

