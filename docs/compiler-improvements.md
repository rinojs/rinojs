# Compiler Improvements

This note documents the current cleanup around XML output, i18n fallback merging, and shared server route helpers.

## XML Output

RSS, Atom, and sitemap generators escape dynamic values before inserting them into XML. Text nodes use XML text escaping, while Atom `href` attributes use attribute escaping.

The helpers live in `src/core/xmlEscape.js`.

## i18n Fallbacks

Localized i18n data is merged over default locale data with recursive object merging. This preserves nested fallback keys while still allowing localized values to replace scalars and arrays.

The helper lives in `src/core/deepMerge.js`.

## Shared Server Helpers

Development and static server routes now share small focused modules under `src/core/server/`:

- `assetRoutes.js` registers script and style routes.
- `contentRoutes.js` registers content and content-list routes.
- `metadataRoutes.js` registers sitemap, RSS, and Atom routes.
- `categoryLinks.js` builds content category links used by routes and static generation.

Page rendering remains in each server entry point because `devStaticSite.js` applies i18n while `staticSiteServer.js` keeps the older non-i18n behavior.

## Static Build Helpers

Static site generation is coordinated by `src/core/buildStaticSite.js`, with focused build phases under `src/core/staticBuild/`:

- `dirs.js` resolves the project directory layout.
- `pages.js` builds HTML pages and localized variants.
- `assets.js` builds JavaScript, TypeScript, and CSS assets.
- `content.js` builds markdown content pages and content-list pages.

The public `buildStaticSite(projectPath)` API remains the entry point.

## Render Diagnostics

Component and SSR component rendering now return explicit diagnostic strings when rendering fails, instead of returning raw error objects. This keeps page output string-based and makes failures easier to identify in generated output.

## CSS Imports

CSS import bundling now keeps import resolution inside a configured root directory and tracks visited imports to avoid circular recursion. Imports outside the root and circular imports are replaced with diagnostic CSS comments.

## Server State

Development and static servers now keep WebSocket/config/i18n data in per-server state objects instead of module globals. The server functions return a small controller with `port`, `server`, `watcher`, `wss`, and `close()`, while preserving the existing startup behavior.

## Template Script Runner

JavaScript and TypeScript template scripts use a reusable isolated child process
instead of spawning `node -e` for every `<script rino-type="js">` or
`<script rino-type="ts">` tag. The parent sends each script to the worker over
IPC, the worker runs it as an ES module, captures `console.log()` output, and
returns that output for insertion into rendered HTML.

Each script still runs as a fresh module evaluation, so top-level variables do
not leak from one template script into the next. The worker temporarily switches
to the requested template working directory for execution, then switches back so
temporary test and build directories are not left locked on Windows. Normal
component rendering, SSR component rendering, development memory builds, and
static generation share this path.
