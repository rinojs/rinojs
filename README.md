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

### 😎 For new people

Rino is ready for production. You can do static site generation and server side rendering. Build your website that services in multiple language. It is possible with default features like using markdown or [tot](https://github.com/opdev1004/totjs). Make sure you reuse the page and component template instead of creating each page for each language.

### 👍 For people who use version < v1.4.0

1. From version 1.4.0, we removed entity support for the `<code>` tags. Because it was breaking. Now the recommended and safe way is using markdown. And you can reuse it again just like a component. Less typing than entities.

```
{{ @md, ./src/mds/somecode.md }}
```

./src/mds/somecode.md: \`\`\`Some code\`\`\`

2. We have changed markdown package. The one in version < 1.4.0 was generating weird html output. Now you will get better result for using markdown.

3. dev() function's `public` argument is changed to `publicDirname`. I have changed it because it may matter when we need packed version of Rino.

```
    /*
dev()
arguments:
{
    pages:[
        {
            pageFilename: `File name for the page, the entry .tot file.`,
            distDirname: `This is the directory where the output files will be stored.`,
            tots: [{name: `name of this`, filename: `File path of .tot file`}, ...],
            mds: [{nname: `name of this`, filename: `File path of .md file`}, ...],
            data: `json data for injecting to the html, css and javascript`,
            filenames: {
                html: `filename for html, default is /index.html`,
                css: `filename for css, default is /style.css`,
                js: `filename for js, default is /main.js`
            }
        }, ... pages continue
    ],
    distRoot: `This is the directory of root where the output files will be stored.`,
    src: `Where your project files are. src directory path. This is for checking changes.`,
    publicDirname: `public directory where you store asset files.`
}
*/
```

## 📖 Documentation

- [Introduction](https://rinojs.org/documents/introduction.html)
- [Installation & Setup](https://rinojs.org/documents/installation.html)

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
