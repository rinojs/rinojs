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
### 🎉 Release version v2.15.0
Please use the latest version. Recommended to upgrade version of Rino after at least a day or a week after the release. So you don't have to deal with huge bug with new version. Because it is going to be tested in production level by development team after release.
- Updated content and content list page system. This should support multilingual or multi sub website. See `test-project/content-theme` and `test-project/contents` as an example.
- Updated backoffice for the changes of content system

### 🎉 Release version v2.14.0
- Now list of category path data is available from pages, contents and contents list.

### 🎉 Release version v2.13.3
- Fixed backoffice markdown editor category refereshing
- Fixed uploaded image naming and preventing image overwriting

### 🎉 Release version v2.13.2
- Fixed npmignore which removes cypress config from the package

### 🎉 Release version v2.13.1
- Added error handling for content system
- Added Cypress and Playwright testing for backoffice

### 🎉 Release version v2.13.0
- Added backoffice that works with contents.
- Corrected encoding value for IO.
- Fixed code to skip 404 page from sitemap


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
