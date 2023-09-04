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

### 👍 For people who use version < v1.5.7

From version v1.5.7, inner-data is available now. `@data`, `@tot` and `@props` can be placed in the `{{ }}` for `@component`, `@preload` and `@md`. But you have to use `<>`.

Example:

- Parent component:

```
<d:html>
{{ @component, ./file-path-to-child, parentprop }}
</d:html>
<d:parentprop>
someprop1
</d:parentprop>
```

- Child component:

```
<d:html>
{{ @component, ./file-path-to-other-component, < @props[0] > }}
</d:html>
<d:someprop1>
<button></button>
</d:someprop1>
<d:someprop2>
<div></div>
</d:someprop2>
```

In the example, depends on what you passed into component from parent, you can pass `someprop1` or `someprop2`.

And now you can add comment with preprocessed way. So you don't have to use `html` comment. You can use this within JS and CSS as well.

```
{{ //
    You can comment like this :)
}}
```

For the last, we are minifying CSS from v1.5.7.

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
