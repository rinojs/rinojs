# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## ▶️ Installation

```
npm i rinojs
```

## 📢 Notice

### 😎 For new people

Rino is ready for production. You can do static site generation and server side rendering. Build your website that services in multiple language. It is possible with default features like using markdown or [tot](https://github.com/opdev1004/totjs). Make sure you reuse the page and component template instead of creating each page for each language.

### 🤞 About documentation and official website updates

I was working on them. but I need to build rino project starter first. So I can add it to the documentation. It won't take too long.

If you are skilled and you don't mind reading stuffs for your production, then please read the code and the changes (maybe README.md) from github. Because you can use all the new features. It's not that difficult. 😉

### 👍 For people who use version < v1.3.0

In version 1.3.0, I have added features for public directory. Now assets in public directory will be copied and pasted into the dist directory. Also I changed some names and added `public` in the arguments for dev() function.

`/src/index.js`

```
const Rino = require('rinojs');
const path = require('path');
const { pages } = require("./pages.js");

async function build()
{
    let rino = new Rino();
    let args = {
        pages: await pages(),
        distRoot: path.resolve(__dirname, "../dist"),
        src: path.resolve(__dirname, "./"),
        public: path.resolve(__dirname, "../public")
    }

    await rino.dev(args);
}

build();
```

Now dev function will be like this:

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
    public: `public directory where you store asset files.`
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
