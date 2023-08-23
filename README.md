# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

```
npm i rinojs
```

## 📢 Notice

### 👍 For people who use version < v1.1.1

In version 1.1.1, I removed entity for `&` in `<code></code>`

### 👍 For people who use version < v1.1.0

In version 1.1.0, we have added and changed some stuffs.

1. Added `{{ @tot.tagname, .tot file path }}`, now you can dynamically add data from tot files. Which means @data isn't the only way to pass some data into pages now. You can use it for reuseable data. It all applies to HTML, CSS and Javascript.

2. Added `loadTot(filename, encoding="utf8")` function. You can use it for passing data of other languages. So now this is official way of supporting localization in Rino. This will help you reuse page structure. If you are using pages.js, Now you can load data from tot file and pass it to page like this:

#### `/src/index.js`

```
const Rino = require('../src/index.js');
const path = require('path');
const { pages } = require("./pages.js");

async function main()
{
    let rino = new Rino();
    let args = {
        pages: await pages(),
        root: path.resolve(__dirname, "../dist"),
        projectDirname: path.resolve(__dirname, "./")
    }

    await rino.dev(args);
}

main();
```

#### `/src/pages.js`

```
const path = require('path');
const Rino = require('../src/index.js');

async function pages()
{
    const rino = new Rino();

    return [
        {
            data: {
                title: 'Test Title',
                testid: 'test',
                i18n: await rino.loadTot("./tot/data.tot")
            },
            pageFilename: path.resolve(__dirname, "./page/index.tot"),
            distDirname: path.resolve(__dirname, "../dist"),
            filenames: {
                css: "style.css",
                js: "main.js"
            }
        },
        {
            data: {
                title: 'Page2!',
            },
            pageFilename: path.resolve(__dirname, "./page/page2.tot"),
            distDirname: path.resolve(__dirname, "../dist"),
            filenames: {
                html: "page2.html",
                css: "page2-style.css",
                js: "page2-main.js"
            }
        }
    ];
}

module.exports = { pages }
```

3. Now the functions will show their arguments properly, if you have javascript extensions installed from your code editor. Because I setup the default values for all the functions.

4. I removed path.resolve() from core of Rino. I am not sure if there are more. However they are unnecessary and removed.

5. I fixed some of minor bugs that I found during the test.

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
