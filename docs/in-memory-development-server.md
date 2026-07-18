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
