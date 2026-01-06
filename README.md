# Projects List

An Obsidian plugin for implementing GTD (Getting Things Done) functionality. It provides a sortable, interactive table view for reviewing all existing projects. This plugin is part of the Kamyanytsya Productivity System.

## Features

- **Sortable table view** — Click column headers to sort by any field (ascending/descending)
- **Flag system** — Use `#flag1` through `#flag5` tags to mark projects with colored indicators (⚪🔵🟡🟠🔴)
- **Priority highlighting** — Use `#priority1` through `#priority5` tags to color-code rows by importance
- **Task tracking** — Automatically counts checkboxes (`- [ ]` and `- [x]`) in each project file
- **Task groups** — Counts separate groups of consecutive checkboxes
- **Draft mode** — Use `#draft` tag to mark work-in-progress projects
- **Completion indicator** — Tasks Done and Tasks Total values turn green when all tasks are completed
- **Pagination** — Built-in pagination with configurable page sizes (25, 50, 100, 300)
- **State persistence** — Remembers sort order and pagination settings per document
- **Dark theme support** — Fully styled for both light and dark Obsidian themes
- **Click to open** — Click any row to open the corresponding project file

## Usage

Create a code block with the `projects_list__kamyanytsya` language identifier and list your project file names (without `.md` extension):

````markdown
```projects_list__kamyanytsya
Project Alpha
Project Beta
My Important Project
```
````

You can also use comma-separated values:

````markdown
```projects_list__kamyanytsya
Project Alpha, Project Beta
My Important Project
```
````

## Tags

Add these tags anywhere in your project files to control their appearance:

| Tag | Description |
|-----|-------------|
| `#flag1` — `#flag5` | Display colored flag indicator (1=⚪, 2=🔵, 3=🟡, 4=🟠, 5=🔴) |
| `#priority1` — `#priority5` | Color-code entire row by priority level |
| `#draft` | Mark project as draft (grayed out row) |

## Table columns

| Column | Description |
|--------|-------------|
| № | Row index |
| Flag | Flag indicator based on `#flagN` tag |
| Name | Project folder name |
| Path | Project folder path |
| Tasks Done | Count of completed checkboxes (`- [x]`) |
| Tasks Total | Total count of checkboxes |
| Tasks Groups Count | Number of separate checkbox groups |
| Draft | Shows ✏️ if project has `#draft` tag |
| Updated | Last modified timestamp |

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins**
2. Select **Browse** and search for "Projects List"
3. Select **Install**, then **Enable**

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/Volodymyr5/kamyanytsya__projects_list__obsidian_plugin/releases)
2. Create folder `<vault>/.obsidian/plugins/kamyanytsya__projects_list__obsidian_plugin/`
3. Copy downloaded files into the folder
4. Restart Obsidian and enable the plugin in **Settings → Community plugins**

## Development

```bash
# Install dependencies
npm install

# Build for development (watch mode)
npm run dev

# Build for production
npm run build
```

## License

[MIT License](LICENSE)

## Author

[Volodymyr5](https://github.com/Volodymyr5)
