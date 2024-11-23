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

### 🎉 Release version 2.0.6

Please use the latest version, until 2.0.6 minor bugs are fixed.

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
      @name="button"
      @type="button"
      type="button"
      onclick="alert('Hello world!')"
    />
    <component @name="footer" @type="footer" />

    {{ result = "Hello World!"; }}

    <md style="color: red"> ## Markdown </md>
  </body>
</html>

```

- ./dist/index.html

```
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <button type="button" onclick="alert('Hello world!')">message</button>
    <footer>This is footer</footer>
    Hello World!
    <div style="color: red"><h2>Markdown</h2></div>
  </body>
</html>
```

## 📖 Documentation

- This is going to be reworked and updated later for version 2

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 🐱‍🏍 **Sponsors**

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
