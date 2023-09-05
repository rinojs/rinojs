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

### 👍 For people who use version < v1.5.10

From version v1.5.10, I've added a feature for inline properties.
So from now you can do this:

Parent component:

```
<d:html>
{{ @component, filename, (#222), (<button></button>) }}
</d:html>
```

Child component:

```
<d:html>
{{ @props[1] }};
</d:html>
<d:css>
button {
    color: {{ @props[0] }};
}
</d:css>
```

Result:

```
html:
<button></button>
css:
button {
    color: #222;
}
```

Please use the latest version.

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
