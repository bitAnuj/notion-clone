import type { Page } from "../types/page";

const gettingStartedContent = `
<h1>Welcome to VicharHub 👋</h1>
<p>This is your first page. Here's a quick tour of what you can do.</p>

<h2>Try the slash menu</h2>
<p>Type <code>/</code> anywhere to open a menu of block types — headings, lists, images, code, and more.</p>

<h2>Checklists work too</h2>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Try checking this box</p></div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Create a sub-page using the + button in the sidebar</p></div></li>
  <li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Type <code>@</code> to link to another page</p></div></li>
</ul>

<div data-type="callout" data-emoji="💡"><p>Select any text to see the formatting toolbar pop up — try making something <strong>bold</strong>.</p></div>

<h2>Code looks nice too</h2>
<pre><code>function greet(name) {
  return "Hello, " + name + "!";
}</code></pre>

<p>Have fun building your workspace!</p>
`;


export const pages: Page[] = [
  {
    id: crypto.randomUUID(),
    title: "Getting Started",
    content: gettingStartedContent,
    icon: "📄",
    cover: "",
    favorite: false,
    trashed: false,

    parentId: null,
    isExpanded: true,

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
