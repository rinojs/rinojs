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

### 👍 For people who use version < v1.5.5

From version v1.5.5, @props is back! But it is different from before it was removed. From this version @props is based on list. And you can only pass props to only one depth below. With this feature now you can build preprocessed UI kit for Rino.

You can do something like this now:

- From parent:

```
<d:html>
some html...
{{ @component, ./file-path, button-component, color }}
some html...
</d:html>
<d:button-component>
{{ @component, ./file-path/button.tot }}
</d:button-component>
<d:color>
some color css or value
</d:color>
```

- From child component:

```
<d:html>
some html...
{{ @props[0] }}
</d:html>
<d:css>
{{ @props[1] }}
</d:css>
```

Now the system will go through `@tot`, `@data` and `@props` first. Which means if you place `@component`, `@md`, `@preload` within `@tot`, `@data` and `@props`, they are going to be rendered. The build process can be slightly slower than before because of this. However there's an improvement as well. I removed some variable initialization from loop, which should be improving the speed of build.

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
