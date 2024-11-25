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

### 🎉 Release version 2.2.0

Please use the latest version, now typescript is available for script and from templating code as well.

Attribute names have changed to be more clear.

```
@name -> @path
@type -> @tag
```

So for component, it would be like this:

```
<component @path="footer" @tag="footer" />
```

Bug from Markdown feature is fixed. And Markdown feature is moved into script tag.

```
<script @type="md" @tag="div" @path="test.md" type="text/markdown"></script>
```

Or

```
<script @type="md" type="text/markdown">
# Some markdown title
Some markdownn content
</script>
```

Script templating syntax is changed from `{{}}` to:

```
<script @type="js" type="text/javascript">
result="";
</script>
```

Typescript:

```
<script @type="ts" type="text/typescript">
result="";
</script>
```

They all run in Node.js VM.

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
