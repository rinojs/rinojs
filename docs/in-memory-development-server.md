# In-Memory Development and SSR Server

## Purpose

Rino.js now builds the complete site before it starts listening, stores the
generated outputs in memory, and serves requests as static lookups. Files in
`public` remain on disk and are served directly by Express, avoiding memory use
for potentially large assets. Development
file changes rebuild related output scopes and atomically replace the previous
snapshot before the browser reloads.

In this design, "SSR server" means serving pre-rendered HTML from a server-side
memory snapshot. Pages whose output depends on a request's cookies, headers,
authentication, query parameters, or other per-request state must remain a
separate dynamic route; they cannot safely share one site-wide output entry.

## Architecture

The system is split into focused layers:

- `memory/build*.js` modules produce pages, content, assets, public files, and
  metadata without knowing how those outputs will be served.
- `MemoryOutputStore` holds immutable generated entries and swaps complete
  snapshots. `DiskOutputStore` lets static generation use the same producers.
- `MemoryBuildEngine` owns build state, serializes rebuild transactions, and
  retains the previous snapshot after a compiler failure.
- `invalidation.js` maps source roots to related output scopes.
- `memoryServer.js` connects the build engine to Express, Chokidar, WebSocket,
  and the existing server controller.

No request handler invokes a page renderer, Markdown renderer, CSS compiler, or
JavaScript bundler. HTML reload injection is a development response transform,
so it does not modify the committed output or production static files.

## Lifecycle

1. Load configuration, localization data, and content category links.
2. Build compiled assets, pages, content, and metadata into staging entries.
3. Commit the complete memory snapshot.
4. Start the HTTP server and then open the browser in development mode.
5. Wait for Chokidar's initial scan before returning the server controller or
   opening the browser. This prevents early edits from being suppressed as
   initial discovery events.
6. Coalesce watcher events with a short debounce and map changed files to build
   scopes or affected template entries.
7. Build those scopes into staging entries and atomically commit them.
8. Send one reload message after a successful commit, or directly after a
   debounced `public` change that requires no compilation.

Requests made during a rebuild continue reading the previous complete snapshot.
If rebuilding fails, the previous outputs remain available and the error is
reported in the development console.

## Invalidation Policy

The system combines reliable scope-level invalidation with targeted template
dependency edges:

| Changed source | Rebuilt scopes |
| --- | --- |
| `public` | no compilation; reload only |
| `scripts`, `styles` | compiled assets |
| `pages`, `i18n` | pages and metadata |
| `components`, `mds` | affected page entries and content themes |
| `content-theme` | content |
| `contents` | pages, content, and metadata |
| configuration or unknown path | complete site |

Component and external Markdown dependencies use a finer in-memory graph. On
startup, Rino.js scans page and content-theme entry templates, follows nested
component references transitively, and records reverse edges to each entry.
Cycle protection prevents recursive templates from hanging discovery. Missing
referenced files are also recorded, so creating them later invalidates the entry
that expected them. A component or `mds` change rebuilds only affected pages and
content themes. The graph is reconstructed from current source and is never
persisted, because dependency state from a previous process may already be
stale. Other source types continue to use the conservative scope table above.

## Routing

Express static middleware serves `public` before the memory handler, preserving
the development server's existing public-file precedence on URL collisions.
In watch mode, a small middleware intercepts only requested public `.html` files
and directory indexes, injects the same WebSocket reload client used by generated
HTML, and then sends the response. Other public files continue through Express
static serving without entering the memory store.
The memory handler supports `/` as `/index.html`, directory indexes, explicit
files, and extensionless HTML routes. Output URLs are normalized before lookup.
Generated text entries include a charset, development responses use `no-cache`,
and unsupported URLs return 404 without invoking a compiler. Public assets use
Express streaming and are not copied into the memory store.

## Compatibility and Migration

`devStaticSite(projectPath)`, `staticSiteServer(projectPath, port)`, and
`buildStaticSite(projectPath)` retain their public signatures. Both server APIs
watch and incrementally rebuild; only the development API opens a browser.
Static generation still copies public files through the shared public producer
and disk store; only the long-running server avoids retaining them in memory.

The main behavior change is startup timing: the server becomes reachable only
after a successful full build. This prevents the browser from racing the first
compilation. Large sites trade a longer startup for compilation-free requests.
The startup console reports output count, byte size, and duration so memory and
build cost remain visible.

To diagnose stale output, restart the server; startup always performs a complete
build. Compiler failures intentionally retain the last successful snapshot.

## Inline Script and Style Exports

Generated page and content HTML may export inline blocks with `rino-export`:

```html
<style rino-export="/kimchi.css">.kimchi { color: red; }</style>
<script rino-export="./kimchi.js">console.log("kimchi");</script>
<script rino-export="./kimchi.ts">
const message: string = "kimchi";
console.log(message);
</script>
```

Style paths are relative to `/styles` and script paths are relative to
`/scripts`, so both leading `/` and `./` forms above produce
`/styles/kimchi.css` and `/scripts/kimchi.js`. Parent traversal with `..` is
rejected.

Exports are derived after all generated pages and content templates render.
Identical blocks targeting the same file are included once, even when a shared
component appears on multiple pages or localized variants. Different blocks are
appended in deterministic build order. If an ordinary compiled asset already
owns the target URL, exported blocks are appended to that build entry.
Script exports are bundled with the same default Rollup/Terser settings used
for JavaScript assets before they are written to `/scripts`. JavaScript is the
default script export type and may also be declared with `rino-type="js"` or
`rino-type="javascript"`. TypeScript exports are inferred from export paths
ending in `.ts`, `.mts`, `.cts`, or `.tsx`, or may be declared with
`rino-type="ts"` or `rino-type="typescript"`. TypeScript exports are
transpiled before bundling and written with a `.js` extension.

After export collection, the original exporting inline element is removed from
rendered compiler HTML. Use normal `<link>` or `<script src>` elements when a
page should load the generated file. Public HTML is not compiler input and
therefore does not produce exports or have export tags removed by the compiler.

Every full or targeted memory build derives these files again from current raw
HTML. Export data is not appended to the previous snapshot, preventing repeated
rebuilds from accumulating duplicate content. Static generation uses the same
derivation before writing its disk snapshot.
