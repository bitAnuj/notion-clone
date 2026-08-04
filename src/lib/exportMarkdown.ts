import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});

export function exportPageAsMarkdown(title: string, html: string) {
  const markdown = turndownService.turndown(html || "");
  const fileContent = `# ${title || "Untitled"}\n\n${markdown}`;

  const blob = new Blob([fileContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${(title || "Untitled").replace(/[^\w\- ]/g, "")}.md`;
  link.click();

  URL.revokeObjectURL(url);
}
