# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

```
npm i rinojs
```

## 📢 Notice

### 🎉 Version 1 is up!

I have multiple checked and I can confirm that we can have version 1.0.0. Documentation will be available from [https://rinojs.org/](https://rinojs.org/). And README will be updated once documentation is done.

### 👍 For people who use version < v1.0.0

There are many changes. Please use the latest version.

1. Fixed algorithm to be faster for preprocessing. There was the part where I forgot to place skipping things that already has been read. Now they are skipped properly. Hence now it should be faster than before.
2. The syntax changes. From now, `{{ Name, filename }}` for things that load a file. It is much simpler and making more sense.

Example:

```
{{ component, ./test/components/test.tot }}
{{ @component, ./test/pcomponents/test.tot }}
{{ @preload, ./test/preloads/preload.tot }}
```

3. Now you can call the function that build multiple pages.
4. Apply entities for `<code>` tags. encoding and decoding both are available.
5. Fixed loading order in JS and CSS files. Place import and require at the very first preload. Before the non-preprocessed component was loaded any place. Now it is after preload and before javascript in preprocessed components and pages.

```
preload - component - <d:js></d:js>
```

6. Added JSON loader. So you can work put multiple pages details in JSON file. It is totally up to you though. You can also import it from separated Javascript file.

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
