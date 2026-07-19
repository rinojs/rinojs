# Rino.js 🦏

```
Fast learning, preprocessing, intuitive web framework.
```

Rino.js is created to fix the complexity matters of web framework.

## ▶️ Installation

The recommended way to start your Rino project:

```
npm create rino@latest
```

For manual setup:

```
npm i rinojs
```

## 📢 Notice

### 🎉 Release version v3.0.0

Rino.js version 3 focuses on faster builds, cleaner generated output, and clearer template syntax. This is

- `rino-import` replaces `rino-path` for component and markdown imports. `rino-path` is no longer supported.

```html
<component rino-import="/common/header" rino-tag="header"></component>
<script rino-type="markdown" rino-import="/docs/getting-started"></script>
```

- Inline styles and scripts can now be exported from generated pages and components with `rino-export`. Exported inline tags are removed from the final HTML and written into generated `/styles` or `/scripts` files. Duplicates will be ignored.

```html
<style rino-export="/site.css">
  .example {
    display: block;
  }
</style>

<script rino-export="/site.js">
  console.log("exported javascript");
</script>

<script rino-export="/site.ts" type="text/typescript">
  const message: string = "exported typescript";
  console.log(message);
</script>
```

- Development serving and server-side rendering now serve a committed in-memory distribution instead of rebuilding on every request. File changes are mapped to the affected build scopes, then the memory snapshot is replaced after a successful rebuild.
- Template JavaScript and TypeScript execution is faster. Rino.js now reuses an isolated child-process runner instead of creating a new child process for every template script tag.

## 🕵️ Test

Use the included test project scripts for local checks:

```
npm test
npm run test-generate
npm run test-sitemap
npm run test-feed
npm run test-ssr
npm run test-dev
npm run test-backoffice
```

## 📖 Documentation

[Official Website](https://rinojs.com/)

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 🐱‍🏍 **Sponsors**

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
