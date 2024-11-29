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

### 🎉 Release version 2.2.3

Please use the latest version, another escaping is added for using markdown in HTML. Because html entity would not work within `<code>`.

````
<script @type="md" type="text/markdown">
  \``` without \ for actual use...
  <script>
    test
  <\/script>
  \``` without for in actual use...
  v2.2.2 escaping <\/script> -> </script>
  v2.2.3 escaping <\\/script> -> <\/script>
</script>
````

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
      result = world;
    </script>
    <script @type="js" type="text/javascript">
      // This is for templating html content
      result = "Hello world! from javascript";
    </script>
  </body>
</html>

```

## 📖 Documentation

[Official Website](https://rino.opdev1004.com/)

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 🐱‍🏍 **Sponsors**

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
