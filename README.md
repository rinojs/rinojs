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

### 🎉 Release version 2.3.0

Please use the latest version. There's a big update for templating script feature and server side rending (SSR) function from `version 2.3.0`.

Now you can use javascript package from templating script from `version 2.3.0`. And if you want to add html content, you have to use `console.log()`. Anything that is printed out as `std.out` from the templating code process will be rendered. And for static site generation, path of page is given as a process argument. So you can perform page specific templating from shared component.

````
<script @type="js" type="text/javascript">
  import os from "os";
  // This is for templating html content
  console.log(os.type());
</script>
````

Now we support server side rendering(SSR) async function called `buildSSRComponent(componentPath, componentsDir, mdDir, args = [])` from `version 2.3.0` with helpful SSR functions: 

```
async function findPort(port),
async function bundleJS(scriptPath, name = "jsbundle"),
async function bundleTS(scriptPath, projectPath, name = "tsbundle"),
async function bundleCSS(cssContent, baseDir),
async function generateSitemap(list),
async function generateSitemapFile(list, filename),
async function generateProjectSitemap(projectPath, config),
function getFilesRecursively(dir, extensions)
```

For `async function buildSSRComponent (componentPath, componentsDir, mdDir, args = [])`, `componentPath` is path of base page html or any html component. And it will grab components and markdown from `componentsDir` and `mdDir`.


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
