# Rino.js 🦏

Fast learning, preprocessing, intuitive web framework. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## 📢 Notice

### 🤟 Rino is capable for building website

I have tried to build an electron app and website with Rino. And it is ready to build website or GUI for native application.

For CSS library, I recommend 'Bulma' and material UI design. Tailwind CSS can be used after Rino is finished building the page. But I cannot guarantee it is safe and compatible to use Tailwind CSS because they look like preprocessing as well. Rino won't be supporting Tailwind CSS from core because they use totally different approach. So I am planning to upgrade Rino UI and Rino CSS and implement that system to Rino.

By the way there will be CMS based on Rino. I already started developing a dashboard for rinocms.

### 👍 For people who use version < v0.8.1 and new people

From version 0.8.1, now you can preload javascript and css.

```
{{ @preload.preload, ./test/preloads }}
```

From version 0.9.0, I am plannning to change syntax for component and preload. So be aware that you may need to change update your project.

```
{{ @component, ./test/pcomponents/test.tot }}
{{ @preload, ./test/preloads/preload.tot }}
```

instead of

```
{{ @component.test, ./test/pcomponents}}
{{ @preload.preload, ./test/preloads }}
```

So it will be more making sense that you are passing the path of file for component and preload.

### 🤷‍♂️ About path sensitivity

Rino is very file path sensitive and based on the paths you are passing. So if you use relative path, it can make different result like showing errors, just like other node modules.

### 👎 Removing reactivity and other features from our plan

I am not going to add features for reactivity, store and many others because I've found that those features add more layers to learn. And some of them are appeared after Virtual DOM. Which means they are not really a solution we need and they won't be shortening our development speed or improve our development experience. It may narrow number of ways to perform things. But I cannot agree adding more layers to learn, since we can perform those easily with Javascript. It is about learning better way. So we should stop adding unnecessary steps for our web clients.

## 💪 The things you can do with Rino.js:

```
1. You can compile multiple .tot files and generate web pages for your website. Each compilation generates a single page like html, js and css file.
2. You can compile .tot files and generate a single page like html, js and css file.
3. It is quite flexible. As it helps you replacing plain text like variables and combining html, js and css.
4. You can crete a component and pass JSON property to manipulate the component.
5. You can pass object data to the pages and componenets.
6. Live web development just like other frontend web frameworks.
7. HTML component system which store html as a variable.
8. Preprocessing events syntax. @click -> onclick
```

If you want to know about .tot file format, you can have a look at [totjs repository](https://github.com/opdev1004/totjs).

## ▶️ Installation

```
npm i rinojs
```

### 🛠 Requirements

My setting is Windows 10, so I cannot test other OS. However, it should work as almost everything is written in Javascript.

However, I recommend using LTS version of Node.js and recent version of OS.

## 😎 Tutorial

### 1. Install rino.js

```
npm i rinojs
```

### 2. Set up src/index.js

```
const Rino = require('rinojs');
const path = require('path');

async function main()
{
    let data = {
        title: 'Test Title',
    }

    let rino = new Rino();

    let args = {
        pages: [
            {
                data: data,
                pageFilename: path.resolve("./page/index.tot"),
                distDirname: path.resolve(__dirname, "../dist"),
                filenames: {
                    css: "style.css",
                    js: "main.js"
                }
            }
        ],
        root: path.resolve(__dirname, "../dist"),
        projectDirname: path.resolve(__dirname, "./")
    }

    await rino.dev(args);
}

main();
```

### 3. Create index.tot file src/page/index.tot

```
<d:html>
HTML stuff
</d:html>
<d:js>
Javascript stuff
</d:js>
<d:css>
CSS stuff
</d:css>
```

### 4. Preprocessed event syntax

From version 0.7.0, most of '@'event in html is preprocessed. You can still use 'on'event. But we all love shorter version. So current algorithm find tags first then replace. So it won't affect email addresses or other data. Unless somehow you add that syntax within tags...

```
@click -> onclick
@submit -> onsubmit
```

### 5. How to use data that is passed from index.js

- '@data' indicates that it should be preprocessed data.
- title is name of where you stored data in Object that is passed from index.js file.

```
{{ @data.title }}
```

### 6. How to use props that is passed from parent

In parent:

- '@component' indicates that it should be preprocessed component.
- 'somecomponent' is name of component file which is 'somecomponent.tot'.
- './pcomponents' is directory path of where component file is.
- 'someprops' is the name of props you created, which is '<d:someprops>''.

```
<d:html>
some html...
{{ @component.somecomponent, ./pcomponents, someprops }}
some html...
</d:html>
<d:someprops>
    {
        "somedata":"some data.."
    }
</d:someprops>
```

In child:

- '@props' indicates that it is property data
- 'somedata' is the name of data in JSON you created from parent

```
{{ @props.somedata }}
```

### 7. About client side component

This is different type of component. HTML content will be stored as a variable in JS. You can pass props but you cannot create props or load another component because that is too much nesting which is not good for design.

Now this does not have '@'. Because only preprocessed syntax start with '@'.

- 'component' indicates that it is a non-preprocessed component.
- './components' is directory path of where component file is.
- 'componentHTML' is name of variable. So when you want to use the variable it is 'componentHTML' in this case. Don't use same name.
- The last one is props. So you can pass props as well.

```
{{ component.somecomponent, ./components, componentHTML }}
```

### 8. Javascript import and require

From version 0.7.0, you can import and require Javascript modules. However you should only import and require from entry .tot file. From version 0.8.1, you can preload tot files. So it is much better to place them in the first tot file that is preloading.

- Only use it from starting file. For example: index.tot
- Once loaded it is available from whole scope, every tot file that is connected to entry .tot file

```
import somemodule from "somemodule"
```

### 9. Javascript scope and names

In version 0.7.0, variables and functions that is on global scope (top layer) will be accessible from web browser. Which literally means that there can be replacing same name or causing error if ther are same names. This may change in the future. But I recommend using unique names for your functions and variables.

### 10. Preloading

From version 0.8.1, you can preload javascript and css with tot file. Which means they are going to placed at the very beginning of javascript and css files. Now you better manage importing and anything that has to run first.

```
{{ @preload.preload, ./test/preloads }}
```

### 11. Building full website just like Next, Nuxt and others

Since rino.js generates html, css and javascript file this is possible.

- Serve static files from server
- Multiple buildPage() to build each unique page
- For content pages you can use database or some kind of file storage to generate page automatically
- You won't have SEO problem like Vue and React

So you may need to quite a bit of setup but I am pretty sure Nuxt and Next isn't too differnt as you still need to manually setup pages and url.

## 📖 Example:

### ./src/index.js:

index.js for Live development:

- About dev() function:

```
dev()
arguments: args
args: {
    pages:[
        {
            data: `json data for injecting to the html, css and javascript`,
            pageFilename: `File name for the page, strting .tot file.`,
            distDirname: `This is the directory where the output files will be stored.`,
            filenames: {
                html: `filename for html, default is /index.html`,
                css: `filename for css, default is /style.css`,
                js: `filename for js, default is /main.js`
            }
        }, ... pages continue
    ],
    root: `This is the directory of root where the output files will be stored.`,
    projectDirname: `Where your project files are. src directory path. This is for checking changes.`
}
```

```
const Rino = require('rinojs');
const path = require('path');

async function test()
{
    let data = {
        title: 'Test Title',
        testid: 'test'
    }

    let rino = new Rino();
    let args = {
        pages: [
            {
                data: data,
                pageFilename: path.resolve(__dirname, "./page/index.tot"),
                distDirname: path.resolve(__dirname, "../testdist"),
                filenames: {
                    css: "style.css",
                    js: "main.js"
                }
            }
        ],
        root: path.resolve(__dirname, "../testdist"),
        projectDirname: path.resolve(__dirname, "./")
    }

    await rino.dev(args);
}

test();
```

or index.js for manual build without live development:

- About buildPage() and writeFiles()

```

buildPage()
arguments: args
args: {
    filename: `File name for the page, strting .tot file path.`,
    data: `json data for injecting to the html, css and javascript`,
}

writeFiles()
arguments:
dirname: `This is the directory where the output files will be stored.`,
obj: {
    html: `html content`,
    css: `css content`,
    js: `js content`
},
filenames: {
    html: `filename for html, default is /index.html`,
    css: `filename for css, default is /style.css`,
    js: `filename for js, default is /main.js`
}
```

```
const Rino = require('rinojs');

async function test()
{
    let rino = new Rino();

    let data = {
        title: 'Test Title',
        testid: 'test'
    }

    let page = await rino.buildPage({"path/to/page/index.tot", data});
    await rino.writeFiles("path/to/dist/directory/dist", page, filenames);
}

test();
```

### ./src/page/index.tot:

```
<d:html>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <script src="test-rollup.js"></script>
        <link rel="stylesheet" href="style.css">
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{ @data.title }}</title>
    </head>
    <body>
        <div class="test">
            {{ @component.test, ./test/pcomponents, test }}
        </div>
        <div id="{{ @data.testid }}">
        </div>
        <div>
            it is successfully built and showing the test results!!
        </div>
        <div id="test">asdasdass</div>
        {{ component.comptest, ./test/components, componentHTML }}
        <button @click="addComponent();">Click me to add innerHTML</button>
        <div id="comptesting"></div>
        <script src="main.js"></script>
    </body>
    </html>
</d:html>
<d:css>
    .test {
        font-size: 48px;
        color: #666;
    }
</d:css>
<d:js>
    import { reqworks } from 'reqtest'
    import { add, minus } from 'add'

    function addComponent()
    {
        document.getElementById('comptesting').innerHTML = document.getElementById('comptesting').innerHTML + componentHTML;
    }

    function test() {
        document.getElementById("{{ @data.testid }}").innerHTML = "^ _ ^";
    }

    test()
    console.log("reqworks: " + reqworks());
    console.log("loaded")
    console.log(add(5, 10));
    console.log(minus(5, 10));
</d:js>
<d:test>
    {
        "a":"a",
        "b":"b",
        "c":"c"
    }
</d:test>
```

### .src/pcomponents/test.tot:

```
<d:html>
    <div>
        TEST {{ @props.b }} !!
        {{ @component.temp, ./test/pcomponents/test/ }} test!!
    </div>
</d:html>
<d:js>
    console.log("test");
    console.log("{{ @props.a }}");
</d:js>
<d:css>
</d:css>
```

### .src/components/comptest.tot:

```
<d:html>
    <div>
        This is a component test!
        And if it is successful this should be attached to the one of div.
    </div>
</d:html>
<d:js>
console.log("The component is loaded successfully!");
</d:js>
<d:css>
</d:css>
```

etc.

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/geargom)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

### 🎁 Shop

- [RB Rino Shop](https://www.redbubble.com/shop/ap/149559711)
- [RB Geargom Shop](https://www.redbubble.com/people/Geargom/shop)

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
