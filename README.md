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

### 👍 For people who use version < v1.5.16

In version v1.5.16, i've fixed a serious human error... not returning page data for buildPage() and buildComponent() functions.
This does not affect people who use default development setting. However from this version, people who build something manually can use buildPage() and buildComponent() that is working properly.

### 👍 For people who use version < v1.5.15

In version v1.5.15, I've fixed some bugs.

### 👍 For people who use version < v1.5.14

From version v1.5.14, now data and props are available from coding within template.

```
<d:html>
some html stuffs...
{{(

result = data.title + props[0];
)}}
some html stuffs...
</d:html>
```

### 👍 For people who use version < v1.5.13

From version v1.5.13, i've added sitemap functions. It is up to you which one you use.

```
eg.
rino.generateSitemap(list);

async generateSitemap(list): return sitemap string
async generateSitemapFile(list, filename): create a sitemap file.
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
