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

Development Build System is changed to the `server side rendering` with memory data management with individual IO update on change. I call this, `build on request`. This is so much faster than version 1.

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

### E2E Test

Right now end to end testing is implemented for test backoffice website with cypresss and playright.
Both can be used to test backoffice website by:

#### Cypress:

```
npm run test-cp
```

Which is `npx cypress open`

#### Playwright

```
npm run test-pw
```

Which is `npx playwright test`

### Unit Test

I am thinking of using `jest`.

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
