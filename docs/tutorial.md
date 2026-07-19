# Rino.js Tutorial

This tutorial explains how to build a Rino.js project using the current v3 syntax. The examples follow the same shape as `test-project`, which is close to the boilerplate a user receives when starting a Rino site.

## What Rino.js Builds

Rino.js takes files from a project folder and produces a static website in `dist` by default. It can also serve the same generated output from memory during development.

The main systems are:

- HTML pages from `pages/`
- reusable HTML components from `components/`
- Markdown snippets from `mds/`
- Markdown content collections from `contents/`
- content templates from `content-theme/`
- public static files from `public/`
- bundled JavaScript and TypeScript from `scripts/export/`
- bundled CSS from `styles/export/`
- inline exported CSS and JS from `<style rino-export>` and `<script rino-export>`
- optional i18n from `i18n/`
- sitemap, RSS, and Atom feed generation
- optional backoffice server for content and image tooling

## Install

Install Rino.js in a Node.js ESM project:

```bash
npm install rinojs
```

Your `package.json` should use ESM:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node dev.js",
    "generate": "node generate.js",
    "sitemap": "node sitemap.js",
    "feed": "node feed.js",
    "backoffice": "node backoffice.js"
  },
  "dependencies": {
    "rinojs": "^3.0.0"
  }
}
```

## Project Structure

A complete project can use this structure:

```text
my-site/
  rino-config.js
  dev.js
  generate.js
  sitemap.js
  feed.js
  backoffice.js
  pages/
    index.html
    about.html
    subdir/
      index.html
  components/
    header.html
    footer.html
    button.html
  public/
    favicon.ico
    images/
      photo.webp
  scripts/
    export/
      app.js
      dashboard.ts
  styles/
    export/
      app.css
  mds/
    intro.md
  contents/
    en/
      blog/
        1-first-post.md
  content-theme/
    en/
      content.html
      content-list.html
  i18n/
    en/
      index.json
    ko/
      index.json
```

Only the folders you use are required.

## Configuration

Create `rino-config.js` in the project root:

```js
export default {
  dist: "./dist",
  port: 3000,
  site: {
    url: "https://example.com",
  },
  sitemap: ["https://example.com/custom-page"],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
  },
};
```

Config fields:

- `dist`: output directory, relative to the project root.
- `port`: preferred dev server port. Rino.js finds the next open port if it is busy.
- `site.url`: base URL used for sitemap and feeds.
- `sitemap`: extra absolute URLs to include in the generated sitemap.
- `i18n.defaultLocale`: locale used for the root pages.
- `i18n.locales`: locales to generate from `i18n/`.

If `rino-config.js` is missing, Rino.js uses default values.

## Project Scripts

Create a development server script:

```js
import { devStaticSite } from "rinojs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await devStaticSite(path.resolve(__dirname, "./"));
```

Create a static generation script:

```js
import { buildStaticSite } from "rinojs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await buildStaticSite(path.resolve(__dirname, "./"));
```

Create a sitemap script:

```js
import { generateProjectSitemapFile } from "rinojs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./rino-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await generateProjectSitemapFile(path.resolve(__dirname, "./"), config);
```

Create a feed script:

```js
import { generateProjectFeedFiles } from "rinojs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./rino-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await generateProjectFeedFiles(path.resolve(__dirname, "./"), config);
```

Run the project:

```bash
npm run dev
npm run generate
npm run sitemap
npm run feed
```

## Pages

Files in `pages/` become HTML pages in the output.

```text
pages/index.html         -> dist/index.html
pages/about.html         -> dist/about.html
pages/subdir/index.html  -> dist/subdir/index.html
```

Example page:

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="/styles/app.css" />
    <script src="/scripts/app.js"></script>
  </head>
  <body>
    <component rino-import="header"></component>
    <main>
      <h1><lang>title</lang></h1>
      <script rino-type="md" rino-import="intro" rino-tag="section"></script>
    </main>
    <component rino-import="footer" rino-tag="footer"></component>
  </body>
</html>
```

## Components

Components live in `components/`. Use `<component>` to insert one component into a page or another component.

```html
<component rino-import="footer"></component>
```

`rino-import` points to a file in `components/` without the `.html` extension:

```html
<component rino-import="layout/header"></component>
```

This loads:

```text
components/layout/header.html
```

Use `rino-tag` to wrap the rendered component in an HTML element:

```html
<component
  rino-import="button"
  rino-tag="button"
  type="button"
  class="button"
></component>
```

If `components/button.html` contains:

```html
Save
```

The output becomes:

```html
<button type="button" class="button">Save</button>
```

Attributes other than `rino-import` and `rino-tag` are copied to the wrapper tag.

Use `rino-import`, not `rino-path`. The old `rino-path` syntax is not supported in v3.

## Markdown Snippets

Markdown snippets live in `mds/`.

```text
mds/intro.md
```

Render a Markdown file:

```html
<script
  rino-type="md"
  rino-import="intro"
  rino-tag="section"
  class="intro"
></script>
```

This reads `mds/intro.md` and outputs:

```html
<section class="intro">...</section>
```

Render inline Markdown:

```html
<script
  rino-type="markdown"
  rino-tag="section"
  class="copy"
  type="text/markdown"
>
  ## Hello

  This is **Markdown** inside the HTML file.
</script>
```

Supported Markdown types:

- `rino-type="md"`
- `rino-type="markdown"`

The default wrapper tag is `div` when `rino-tag` is not provided.

## Template Scripts

Template scripts run during generation and print HTML into the page. They are not browser scripts. Use them for server-side HTML generation.

JavaScript template script:

```html
<script rino-type="js" type="text/javascript">
  console.log("<ul>");
  for (const item of ["Home", "Blog", "About"]) {
    console.log(`<li>${item}</li>`);
  }
  console.log("</ul>");
</script>
```

TypeScript template script:

```html
<script rino-type="ts" type="text/typescript">
  const message: string = "Generated with TypeScript";
  console.log(`<p>${message}</p>`);
</script>
```

Supported template script types:

- `rino-type="js"`
- `rino-type="javascript"`
- `rino-type="ts"`
- `rino-type="typescript"`

Template scripts can import Node.js modules:

```html
<script rino-type="js" type="text/javascript">
  import os from "os";
  console.log(`<p>Built on ${os.type()}</p>`);
</script>
```

During page builds, Rino.js passes build data as JSON in `process.argv[1]`.

```html
<script rino-type="js" type="text/javascript">
  const args = JSON.parse(process.argv[1]);
  const categoryLinks = args.categoryLinks;

  console.log("<nav><ul>");
  for (const [category, link] of Object.entries(categoryLinks)) {
    console.log(`<li><a href="${link}">${category}</a></li>`);
  }
  console.log("</ul></nav>");
</script>
```

Content templates also receive content data as the last process argument. See the content section below.

## Browser Scripts

Normal browser scripts are written as standard HTML:

```html
<script src="/scripts/app.js"></script>
```

Put source files in `scripts/export/` to bundle them into `dist/scripts/`.

```text
scripts/export/app.js  -> dist/scripts/app.js
scripts/export/app.ts  -> dist/scripts/app.js
```

Example JavaScript file:

```js
import confetti from "canvas-confetti";

document.querySelector("button")?.addEventListener("click", () => {
  confetti();
});
```

Example TypeScript file:

```ts
const button = document.querySelector<HTMLButtonElement>("button");

button?.addEventListener("click", () => {
  console.log("Clicked");
});
```

JavaScript and TypeScript are bundled with Rollup. Output is minified, but client-side code should not be treated as secret.

## CSS

Put source CSS files in `styles/export/`.

```text
styles/export/app.css -> dist/styles/app.css
```

Example:

```css
@import "../shared/tokens.css";

body {
  font-family: system-ui, sans-serif;
}
```

Rino.js resolves local `@import` rules, skips circular imports, skips URL imports, and minifies the output.

Reference bundled CSS from a page:

```html
<link rel="stylesheet" href="/styles/app.css" />
```

## Public Files

Files in `public/` are copied to the output root.

```text
public/favicon.ico       -> dist/favicon.ico
public/images/photo.webp -> dist/images/photo.webp
```

Use root-relative URLs in HTML:

```html
<img src="/images/photo.webp" alt="Photo" />
<link rel="icon" href="/favicon.ico" />
```

## Inline Exports

Use `rino-export` when a component or page owns small CSS or JS that should be moved into an output file.

Exported tags are removed from the final HTML. Their content is collected, deduplicated, and written to `/styles/...` or `/scripts/...`.

### Export CSS

```html
<section class="callout">
  <h2>Exported CSS</h2>
</section>

<style rino-export="/site.css">
  .callout {
    border: 1px solid #ccc;
    padding: 1rem;
  }
</style>
```

The output CSS path is:

```text
dist/styles/site.css
```

Reference it from your page:

```html
<link rel="stylesheet" href="/styles/site.css" />
```

### Export JavaScript

```html
<script rino-export="/site.js">
  console.log("Exported browser script");

  window.openMenu = function () {
    document.body.classList.toggle("menu-open");
  };
</script>
```

The output JS path is:

```text
dist/scripts/site.js
```

Reference it from your page:

```html
<script src="/scripts/site.js"></script>
```

`rino-type` is optional for JavaScript exports. These are equivalent:

```html
<script rino-export="/site.js"></script>
<script rino-export="/site.js" rino-type="js"></script>
<script rino-export="/site.js" rino-type="javascript"></script>
```

### Export TypeScript

Use a `.ts` export path or an explicit TypeScript `rino-type`.

```html
<script rino-export="/site.ts" type="text/typescript">
  const message: string = "Exported TypeScript";
  console.log(message);

  (window as any).showMessage = function (): void {
    alert(message);
  };
</script>
```

This writes:

```text
dist/scripts/site.js
```

These forms are treated as TypeScript:

```html
<script rino-export="/site.ts"></script>
<script rino-export="/site.js" rino-type="ts"></script>
<script rino-export="/site.js" rino-type="typescript"></script>
```

To call a function from outside an exported script, attach it to `window`:

```html
<script rino-export="/site.js">
  window.testExport = function () {
    console.log("Called from outside");
  };
</script>
```

Then call it from browser HTML or another browser script:

```html
<button onclick="window.testExport()">Run</button>
```

Top-level function declarations inside bundled scripts are scoped by the bundle wrapper, so attach public functions to `window` when the page needs global access.

## Inline Export Paths

Rino.js roots export paths by tag type:

```html
<style rino-export="/app.css"></style>
```

writes:

```text
/styles/app.css
```

```html
<script rino-export="/app.js"></script>
```

writes:

```text
/scripts/app.js
```

Relative-looking paths are also rooted by type:

```html
<style rino-export="./app.css"></style>
<script rino-export="./app.js"></script>
```

These also write to:

```text
/styles/app.css
/scripts/app.js
```

`..` is not allowed in `rino-export` paths because exported assets cannot escape their output directory.

Multiple tags can export to the same file. Rino.js appends unique blocks and ignores exact duplicate blocks.

## i18n

Use `<lang>key</lang>` in pages and components:

```html
<h1><lang>name</lang></h1>
<p><lang>body.hero.copy</lang></p>
```

Create locale JSON files under `i18n/{locale}/` matching the page path:

```text
pages/index.html
i18n/en/index.json
i18n/ko/index.json

pages/about.html
i18n/en/about.json
i18n/ko/about.json
```

Example `i18n/en/index.json`:

```json
{
  "name": "Rino.js",
  "body": {
    "hero": {
      "copy": "Simple static websites from HTML."
    }
  }
}
```

Nested values use dot paths:

```html
<lang>body.hero.copy</lang>
```

Array values use bracket paths:

```json
{
  "items": [{ "title": "First item" }]
}
```

```html
<lang>items[0].title</lang>
```

Escape a language tag when you want it to remain literal:

```html
\<lang>name\</lang>
```

Output behavior:

- The default locale is written to the normal page path, such as `/index.html`.
- Other locales are written under the locale prefix, such as `/ko/index.html`.
- Missing keys stay as `<lang>key</lang>` instead of breaking the build.
- Non-default locales merge over default-locale JSON as fallback data.

## Content Collections

Use `contents/` for Markdown content such as blog posts.

The folder shape is:

```text
contents/{theme}/{category}/{number-title}.md
```

Example:

```text
contents/en/blog/1-first-post.md
```

Markdown files can start with a JSON comment:

```md
<!--
{
  "title": "Welcome to the Blog",
  "time": "2025-04-12T10:26:00.000Z",
  "description": "The first post on our blog."
}
-->

# Hello World

This is the **first** post.
```

Rino.js renders this to:

```text
dist/contents/en/blog/1-first-post.html
```

The URL is:

```text
/contents/en/blog/1-first-post
```

## Content Templates

Each content theme needs:

```text
content-theme/{theme}/content.html
content-theme/{theme}/content-list.html
```

Example `content-theme/en/content.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>{{ content.title }}</title>
    <link rel="stylesheet" href="/styles/content.css" />
  </head>
  <body>
    <main>
      <h1>{{ content.title }}</h1>
      <p><time>{{ content.time }}</time></p>
      <article>{{ content.body }}</article>
    </main>
  </body>
</html>
```

Available content values:

- `content.body`: rendered Markdown HTML.
- `content.urlPath`: generated URL path for the current content item.
- `content.nearby`: nearby content metadata from the same category.
- Any key from the JSON comment, such as `content.title` or `content.description`.

Use dot or bracket paths:

```html
{{ content.title }} {{ content.nearby[0].title }}
```

For loops or conditional output, use a template script:

```html
<nav>
  <script rino-type="js" type="text/javascript">
    const args = process.argv;
    const contentData = JSON.parse(args[args.length - 1]);

    if (Array.isArray(contentData.nearby)) {
      console.log("<ul>");
      for (const post of contentData.nearby) {
        console.log(`<li><a href="${post.link}">${post.title}</a></li>`);
      }
      console.log("</ul>");
    }
  </script>
</nav>
```

## Content List Templates

Rino.js creates paginated content list pages for each theme/category.

For:

```text
contents/en/blog/*.md
```

Rino.js creates:

```text
dist/contents-list/en/blog/blog-1.html
dist/contents-list/en/blog/blog-2.html
```

There are 10 posts per content list page.

Example `content-theme/en/content-list.html`:

```html
<!doctype html>
<html lang="en">
  <body>
    <main>
      <h1>Blog</h1>
      <ol>
        <script rino-type="js" type="text/javascript">
          const args = process.argv;
          const listData = JSON.parse(args[args.length - 1]);

          for (const item of listData.contentList) {
            console.log(`<li><a href="${item.link}">${item.title}</a></li>`);
          }
        </script>
      </ol>
    </main>
  </body>
</html>
```

Available content list data:

- `contentList`: array of content metadata for the current page.
- `pagination.prevLink`: previous list page URL or an empty string.
- `pagination.nextLink`: next list page URL or an empty string.

Simple replacements are also supported:

```html
{{ contentList[0].title }}
```

For arrays, template scripts are usually clearer.

## Category Links

Pages and content templates receive `categoryLinks` in their template script args.

```html
<script rino-type="js" type="text/javascript">
  const args = JSON.parse(process.argv[1]);
  const categoryLinks = args.categoryLinks;

  console.log("<nav><ul>");
  for (const [category, link] of Object.entries(categoryLinks)) {
    console.log(`<li><a href="${link}">${category}</a></li>`);
  }
  console.log("</ul></nav>");
</script>
```

This is useful for generating category navigation from `contents/`.

## Sitemap

Rino.js can generate a sitemap from:

- files in `pages/`
- localized pages from `i18n.locales`
- content pages from `contents/`
- extra URLs in `config.sitemap`

Script:

```js
import { generateProjectSitemapFile } from "rinojs";
import config from "./rino-config.js";

await generateProjectSitemapFile(process.cwd(), config);
```

Output:

```text
dist/sitemap.xml
```

The development server can also serve metadata routes from memory.

## RSS and Atom Feeds

Feeds are generated from Markdown content under `contents/`.

Script:

```js
import { generateProjectFeedFiles } from "rinojs";
import config from "./rino-config.js";

await generateProjectFeedFiles(process.cwd(), config);
```

Output:

```text
dist/rss.xml
dist/atom.xml
dist/rss-en.xml
dist/atom-en.xml
```

Theme-specific files are created for each content theme with content.

## Server-Side Rendering Components

Rino.js also exports `buildSSRComponent` for server-side component rendering. It supports the same component, Markdown, JavaScript template script, and TypeScript template script syntax.

```js
import { buildSSRComponent } from "rinojs";
import path from "path";

const html = await buildSSRComponent(
  path.resolve("components/card.html"),
  path.resolve("components"),
  path.resolve("mds"),
  [JSON.stringify({ name: "Rino" })],
);
```

Use this when you want to render a component yourself from Node.js.

## Backoffice

Start the backoffice server:

```js
import { startBackofficeServer } from "rinojs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await startBackofficeServer(path.resolve(__dirname, "./"));
```

The backoffice serves browser assets from Rino.js and can work with project content and public files. It uses the next available port starting at `3100`.

## Development Server

`devStaticSite(projectPath)` starts a development server and watches the project. It builds output in memory and serves it without writing the full distribution on every request.

Important behavior:

- Page, content, asset, and metadata output is built into an in-memory distribution.
- File changes rebuild the affected scope.
- Live reload is injected into served HTML.
- Browser requests use the same generated output model as static generation.
- Template scripts run in a preloaded isolated code runner instead of starting a new process for every script tag.

## Static Generation

`buildStaticSite(projectPath)` writes the generated site to the configured `dist` directory.

The build includes:

- copied `public/` files
- bundled files from `scripts/export/`
- bundled files from `styles/export/`
- rendered pages from `pages/`
- rendered content and content lists from `contents/` and `content-theme/`
- inline `rino-export` assets collected from pages and content output

Run:

```bash
npm run generate
```

## Full Page Example

```html
<!doctype html>
<html>
  <head>
    <title><lang>name</lang></title>
    <link rel="stylesheet" href="/styles/site.css" />
    <script src="/scripts/site.js"></script>
  </head>
  <body>
    <component rino-import="header"></component>

    <main>
      <h1><lang>name</lang></h1>

      <script rino-type="md" rino-import="intro" rino-tag="section"></script>

      <script rino-type="js" type="text/javascript">
        const args = JSON.parse(process.argv[1]);
        console.log(`<p>Current page: ${args.pagePath}</p>`);
      </script>
    </main>

    <component rino-import="footer" rino-tag="footer"></component>

    <style rino-export="/site.css">
      main {
        max-width: 72rem;
        margin: 0 auto;
        padding: 2rem;
      }
    </style>

    <script rino-export="/site.ts" type="text/typescript">
      const readyMessage: string = "Site script loaded";
      console.log(readyMessage);
    </script>
  </body>
</html>
```

## Common Mistakes

Use `rino-import`, not `rino-path`:

```html
<!-- Correct -->
<component rino-import="footer"></component>

<!-- Incorrect in v3 -->
<component rino-path="footer"></component>
```

Do not expect template scripts to run in the browser:

```html
<!-- Runs during generation -->
<script rino-type="js">
  console.log("<p>Generated HTML</p>");
</script>

<!-- Runs in the browser -->
<script src="/scripts/site.js"></script>
```

Do not use a plain function declaration when you need a browser global from a bundled export:

```html
<!-- Use this -->
<script rino-export="/site.js">
  window.doThing = function () {
    console.log("Public function");
  };
</script>
```

Use `.ts` or `rino-type="ts"` for TypeScript exports:

```html
<script rino-export="/site.ts"></script>
<script rino-export="/site.js" rino-type="ts"></script>
```

Reference exported files from the generated root paths:

```html
<link rel="stylesheet" href="/styles/site.css" />
<script src="/scripts/site.js"></script>
```
