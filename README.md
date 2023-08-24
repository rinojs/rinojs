# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

```
npm i rinojs
```

## 📢 Notice

### 👍 For people who use version < v1.2.0

In version 1.2.0, I have added markdown support and more .tot file support + fixed minor bugs.

1. How to add markdown:

```
{{ @md, ./md/test.md }}
```

2. How to add markdown or .tot to data object:

`./src/pages.js`

```
const path = require('path');

async function pages()
{
    return [
        {
            data: {
                title: 'Test Title',
                testid: 'test',
            },
            tots: [
                {
                    name: 'test',
                    filename: './tot/data.tot'
                }
            ],
            mds: [
                {
                    name: 'test',
                    filename: './md/test.md'
                }
            ],
            pageFilename: path.resolve(__dirname, "./page/index.tot"),
            distDirname: path.resolve(__dirname, "../testdist"),
            filenames: {
                css: "style.css",
                js: "main.js"
            }
        }, ... more pages
    ];
}

module.exports = { pages }
```

`./src/page/index.tot`

```
some html...
{{ @data.tot.test.test }}
{{ @data.md.test }}
some html...
```

Rino is going to go through the list of markdown and tot files. And it is going to add data from files into the data object with name your provided.

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
