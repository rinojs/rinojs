# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

```
npm i rinojs
```

## 📢 Notice

### 📖 Documentation

Documentation will be available from [https://rinojs.org/](https://rinojs.org/). And README will be updated once documentation is done.

### 👍 For people who use version < v1.0.1

In version 1.0.1, `<code>` and entities and escaping problem with templating are fixed. Please use the latest version.

Within `<code>` tag, html will be preprocessed so `&`, `<`, `>`, `{{`, `}}` will be replaced with entities. So the code can be displayed as content.

And if you want to include `<d:html></d:html>, <d:css></d:css>, <d:js></d:js>`. Make sure you escape them like this:

```
<\d:html><\/d:html>
<\d:css><\/d:css>
<\d:js><\/d:js>
```

Within string they should be:

```
<\\d:html><\\/d:html>
<\\d:css><\\/d:css>
<\\d:js><\/d:js>
```

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

### 🎁 Shop

- [RB Rino Shop](https://www.redbubble.com/shop/ap/149559711)
- [RB Geargom Shop](https://www.redbubble.com/people/Geargom/shop)

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
