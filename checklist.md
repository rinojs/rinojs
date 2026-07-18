# Rino.js Compiler Improvement Checklist

## Previous Compiler Improvements

- [x] Escape dynamic XML values in RSS, Atom, and sitemap output.
- [x] Replace shallow i18n fallback merging with deep object merging.
- [x] Extract duplicated server route helpers into focused modules.
- [x] Split static build orchestration into focused helpers.
- [x] Return explicit component render diagnostics.
- [x] Add bounded CSS import resolution with cycle and root checks.
- [x] Remove module-global server state.
- [x] Add focused tests and compiler documentation.

## In-Memory Development and SSR System

### Design and contracts

- [x] Define SSR as pre-rendered server-side memory output and document the
  boundary for genuinely request-dependent routes.
- [x] Preserve the public signatures of `devStaticSite`, `staticSiteServer`, and
  `buildStaticSite`.
- [x] Define startup as build, commit, listen, then open the browser.
- [x] Define failed incremental builds to retain the last committed snapshot.
- [x] Use subsystem-level dependency scopes for a generalized, reliable first
  implementation instead of adding case-specific import parsing.

### Focused compiler modules

- [x] Add a normalized `MemoryOutputStore` with immutable entries, snapshots,
  atomic replacement, deterministic listing, and byte accounting.
- [x] Add a `DiskOutputStore` so static generation shares compiler producers.
- [x] Separate page, content, asset, public-file, and metadata producers.
- [x] Support strings and binary buffers with appropriate content types.
- [x] Make optional source directories produce an empty output set.
- [x] Detect duplicate URLs generated inside one compiler scope.
- [x] Preserve static output precedence across public files and generated pages.

### Initial build and static memory serving

- [x] Load config, directories, i18n, and category links into one site context.
- [x] Build the complete website into staging entries before server startup.
- [x] Commit the complete initial snapshot before accepting requests.
- [x] Serve pages, localized pages, content, content lists, compiled assets,
  metadata, and arbitrary public files from memory.
- [x] Support root indexes, directory indexes, explicit files, and extensionless
  HTML URLs.
- [x] Return 404 without falling back to source compilation.
- [x] Apply reload injection as a development response transform so committed
  and production output remains clean.
- [x] Support HEAD requests and development `no-cache` responses.
- [x] Open the browser only after a usable initial build and listening socket.
- [x] Report initial output count, memory bytes, and build duration.

### Incremental rebuilds

- [x] Map public, asset, page, component/Markdown, content, theme, i18n, config,
  and unknown changes to related build scopes.
- [x] Treat shared components and component Markdown conservatively by rebuilding
  all page and content dependants.
- [x] Recompute category links, localization indexes, and metadata when their
  source scopes change.
- [x] Coalesce editor save bursts into one change batch.
- [x] Serialize rebuilds so stale transactions cannot commit out of order.
- [x] Stage rebuilt scopes and atomically replace their prior URLs.
- [x] Remove outputs that disappeared from a rebuilt scope, including deleted
  pages, assets, localized variants, and obsolete list pages.
- [x] Retain all prior outputs and build ID when a rebuild throws.
- [x] Reload WebSocket clients only after a successful commit.
- [x] Keep the existing plain `reload` protocol for compatibility.
- [x] Release watcher, WebSocket, and HTTP resources through the existing server
  controller.

### Shared server and static generation

- [x] Add one shared memory server used by development and static SSR serving.
- [x] Keep watching/reloading and browser opening as explicit server options.
- [x] Make `buildStaticSite` use the same output producers through the disk store.
- [x] Remove build-on-request page, content, CSS, JS, TS, and metadata routes from
  both server entry points.
- [x] Keep source files organized into small modules under `src/core/memory` and
  `src/core/server`.

### Tests and validation

- [x] Test memory snapshot replacement, URL normalization, and route candidates.
- [x] Test source-to-scope invalidation rules.
- [x] Test full in-memory compilation of HTML, CSS, and a binary public asset.
- [x] Test component changes rebuild related scopes and update committed HTML.
- [x] Test failed rebuild rollback and stable build IDs.
- [x] Test the HTTP server continues serving prebuilt HTML after its source file
  has been removed.
- [x] Test HTTP 404 behavior.
- [x] Keep all generated test fixtures and temporary data under `./temp`.
- [x] Run the complete unit test suite.
- [x] Run representative static generation with the shared compiler producers.
- [x] Run whitespace/error checks and review the final diff.

### Documentation

- [x] Add the architecture, lifecycle, invalidation policy, routing behavior,
  SSR boundary, compatibility notes, and troubleshooting guidance under `docs`.
- [x] Explain that scope-level invalidation is deliberately conservative and can
  later be refined without changing the server contract.
- [x] Update the README description of the old build-on-request development
  system.

## Public Asset and Template Dependency Improvements

### Public assets on disk

- [x] Exclude `public` files from initial and incremental server memory builds.
- [x] Mount the project's `public` directory as direct Express static middleware
  before memory-generated routes.
- [x] Preserve existing server precedence when a public URL collides with a
  compiled output URL (`public` wins).
- [x] Keep public-file copying in disk static generation without retaining those
  files in the server memory store.
- [x] Keep watching public files and reload the browser without running a
  compiler transaction.
- [x] Wait for the initial watcher scan before returning the server controller
  or opening the browser, so early public-file edits are not missed.
- [x] Debounce public and compiler watcher events into one reload per save burst.
- [x] Test that large/binary public files are served from disk and absent from
  the memory output store.
- [x] Test through WebSocket that a public-file content change emits exactly one
  browser reload.
- [x] Inject the development reload client into requested public `.html` and
  directory-index files without loading other public assets into memory.
- [x] Test that nested public HTML responses contain the WebSocket reload client.

### Ephemeral template dependency graph

- [x] Discover page and content-theme HTML entry templates at server startup.
- [x] Parse component references and external `mds` references from templates.
- [x] Follow nested component references transitively with cycle protection.
- [x] Build reverse component/Markdown-to-entry edges entirely in memory.
- [x] Do not read or write dependency tracking data outside process memory.
- [x] Resolve a component or `mds` change to only affected page entries and
  content themes.
- [x] Rebuild all pages/content only when an added or previously unresolved
  dependency cannot be mapped safely.
- [x] Refresh dependency edges after template/component/Markdown add, change,
  delete, and rename events.
- [x] Atomically replace only outputs owned by affected page/theme build units.
- [x] Preserve full-scope invalidation for page, content, i18n, config, and
  category-link changes where it remains the clearest safe policy.
- [x] Test direct, nested, shared, unrelated, cyclic, deleted, and newly added
  component/Markdown dependency behavior at a generalized template level.

### Documentation and validation

- [x] Update architecture documentation with direct public serving, middleware
  precedence, graph lifecycle, invalidation fallbacks, and memory-only storage.
- [x] Update README and console memory reporting where needed.
- [x] Run focused tests, the complete test suite, representative static
  generation, and whitespace/error checks.

## Possible Future Refinements

- Reuse Rollup cache/module metadata between asset builds.
- Replace stylesheets in the browser without a full-page reload.
- Add a hybrid disk/memory policy for exceptionally large public assets.
- Add ETag support and production-specific HTTP caching policies.

## Inline Script and Style Exports

- [x] Parse `rino-export` on generated `<style>` and `<script>` elements.
- [x] Normalize leading `/` and `./` values beneath `/styles` or `/scripts` and
  reject paths that escape those output roots.
- [x] Aggregate exports only after page and content rendering so nested/shared
  component output is included.
- [x] Deduplicate identical element content targeting the same output file.
- [x] Append unique blocks deterministically when several elements target one
  output and append to an existing compiled asset entry when present.
- [x] Recompute derived exports from current generated HTML after full and
  targeted builds so rebuilds never accumulate duplicate content.
- [x] Preserve original inline elements and their behavior in rendered HTML.
- [x] Include derived exports in memory SSR/dev serving and disk static output.
- [x] Keep public HTML outside compiler export processing.
- [x] Add focused parser, deduplication, append, traversal, memory-build, and
  static-generation tests.
- [x] Document export paths, append/deduplication behavior, and limitations.
- [x] Run the complete test suite, representative static generation, and diff
  validation.
