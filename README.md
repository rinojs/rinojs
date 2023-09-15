# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

The recommended way to start your Rino project:

```
npm create rino
```

For manual setup:

```
npm i rinojs
```

## 📢 Notice

### 👍 For people who use version < v1.5.13

From version v1.5.13, i've added sitemap functions. It is up to you which one you use.

```
eg.
rino.generateSitemap(list);

async generateSitemap(list): return sitemap string
async generateSitemapFile(list, filename): create a sitemap file.
```

### 👍 For people who use version < v1.5.12

From version v1.5.12, I have added code preprocessed coding syntax.
You can use javascript to generate very complex preprocessed component or html elements.
It is only available for html.
You must put anything that need to be displayed at the end to be in the `result`.
`result` is available globally within the code syntax.
From v1.6.0, you many need to pass `__dirname` to `dev()`, `build()` and other functions.

Any some-page.tot or some-component.tot:

```
<d:html>
some html stuffs...
{{(
const path = require('path');

result = 7;
)}}
some html stuffs...
</d:html>
```

Result:

```
some html stuffs...
7
some html stuffs...
```

## 📖 Documentation

- [Rino.js Introduction](https://rinojs.org/documents/introduction.html)
- [Rinokit Introduction](https://rinojs.org/documents/rinokit.html)
- [Installation & Setup](https://rinojs.org/documents/installation.html)

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

### 🎁 Shop

- [RB Rino Shop](https://www.redbubble.com/shop/ap/149559711)
- [RB Geargom Shop](https://www.redbubble.com/people/Geargom/shop)

## 👨‍👩‍👧‍👦 **Sponsors**

### 🔥 **IMMORTAL SUPPORTER**

### 👼 **DIVINE SUPPORTER**

### 🎻 **ANCIENT SUPPORTER**

### ⚔ **LEGEND SUPPORTER**

### 🌲 **ARCHON SUPPORTER**

### 🍀 Crusader Supporter

### ☘ Guardian Supporter

### 🌱 Herald Supporter

## 💪 Support Rino!

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
