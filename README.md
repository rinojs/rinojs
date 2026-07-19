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

### 🚀 Planning to go version v3.0.0

Rino.js is going to be version 3.0.0 after some of new features and bugs are sorted.
I know my versioning style is not that great.
But I want Rino.js version 3 to be more completed than beginning of version 2.

### 🎉 Release version v2.22.0

Cleared outdated packages and checked bugs. Which caused some changes. Please report any problem.

### 🎉 Release version v2.19.0

#### 1. Deprecation of `@`

Now from version 2.19.0 we need to `rino-` instead of `@` for attributes.

```
<component rino-import="/common/head" />
<component rino-import="/common/header" rino-tag="header"></component>
<script rino-type="markdown" rino-import="/docs/getting-started.md"></script>
```

#### 2. Added escape to i18n system.

Input:

```
\<lang>head.title\</lang>
<p><lang>head.title</lang></p>
<p><lang>missing.value</lang></p>
```

Output:

```
<lang>head.title</lang>
<p>Translated Title Here</p>
<p><lang>missing.value</lang></p>
```

### 3. Added i18n pages' urls to project sitemap system

Now i18n pages are going to be included in project sitemap generation.

### 🎉 Release version v2.18.0

Rino.js now has a fully-featured, flexible, and developer-friendly JSON-based internationalization system for both dev server and static generation.
Localization is now deeply integrated into the compiler pipeline while staying simple and intuitive to use.

#### Example structure:

```
pages/
  index.html
  about.html

i18n/
  en/
    index.json
    about.json
  ko/
    index.json
    about.json
```

Each `<lang>...</lang>` tag in your HTML will map to a key inside the corresponding JSON file:

#### index.html:

```
<h1><lang>header.title</lang></h1>
<p><lang>body.content.top[0]</lang></p>
```

#### i18n/en/index.json:

```
{
  "header": { "title": "Welcome" },
  "body": {
    "content": { "top": ["First content block"] }
  }
}
```

#### rino-config:

You can explicitly define which locales should be built and served.
Only "en" and "ko" directories under `/i18n/` are used.
All other locale folders are ignored (safe, predictable output).
defaultLocale is applied to root pages (e.g. `/index.html`).
Localized pages will be generated under `/dist/<locale>/` automatically.

```
    i18n: {
        defaultLocale: "en",
        locales: ["en", "ko"]
    }
```

#### Other things to note for i18n feature:

- Supports nested objects
- Supports array indexing (e.g. items[0].label)
- Missing keys gracefully fallback to default locale if configured

### 👍 Releasing Version 2

New version, better development experience and totally different from version 1.

Many syntax is simplified and following html, css and javascript standard. And many things are updated for automation.

The development and SSR servers build the complete website into memory before
listening, then serve the committed output like a static website. File changes
trigger atomic rebuilds of related page, content, asset, public, or metadata
scopes before connected browsers reload. Static generation uses the same build
producers with a disk-backed output store. The `public` directory is served
directly from disk by development and SSR servers, while an ephemeral in-memory
dependency graph targets pages and content themes affected by component or
Markdown changes.

#### Example of Rino 2

- ./pages/index.html

```
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <component
      @path="button"
      @tag="button"
      type="button"
      onclick="alert('Hello world!')"
    />
    <component @path="footer" @tag="footer" />
    <script @type="md" style="color: red" type="text/markdown">
      ## test

      test

      - test
    </script>
    <script @type="ts" type="text/typescript">
      // This is for templating html content
      let world: string = "Hello world! from typescript";
      console.log(world);
    </script>
    <script @type="js" type="text/javascript">
      // This is for templating html content
      console.log("Hello world! from javascript");
    </script>
  </body>
</html>

```

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

[Official Website](https://rinojs.org/)

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 🐱‍🏍 **Sponsors**

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
