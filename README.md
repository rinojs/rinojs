# Rino.js 🦏
Serverside/PC Web Page Templating system that is similar to the popular web frameworks. It is "rinojs" because the name rhino, rhinojs and rino are being used by others.

## 📢 Notice
From version 0.1.0 how we load component is different. So if you have used v0.0.1, you need to update your codes.

## 💪 The things you can do with Rino.js:
```
1. You can compile .tot files and generate a single page like html, js and css file.
2. It is quite flexible. As it helps you replacing plain text like variables and combining html, js and css.
3. You can crete a component and pass JSON property to manipulate the component.
4. You can pass object data after you have created them through node.js modules.
```

If you want to know about .tot file format, you can have a look at [totjs repository](https://github.com/opdev1004/totjs).

## ▶️ Installation
```
npm i rinojs
```

## 👍 Example:
### index.js:
```
const Rino = require('rinojs');

async function test()
{
  let rino = new Rino();

  let data = {
      title: 'Test Title',
      testid: 'test'
  }

  // rino.buildPage(pathToTotFile) will build page and components.
  // Properties will be applied to the page as well.
  let page = await rino.buildPage("path/to/page/index.tot");
  // rino.buildData(page object, data object) will build data into the page.
  // You must call buildData() after buildPage()
  page = await rino.buildData(page, data);
  await rino.writeFiles("path/to/dist/directory/dist", page);
}

test();
```
### index.tot:
```
<d:html>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <script src="main.js"></script>
        <link rel="stylesheet" href="style.css">
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{ data.title }}</title>
    </head>
    <body>
        <div class="test">
            <!-- This is how you pass properties. name of component, the path of component, name of properties -->
            {{ components.test, ./components, test }}
        </div>
        <div id="{{ data.testid }}">
        </div>
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
    function test() {
        document.getElementById("{{ data.testid }}").innerHTML = "^ _ ^";
    }

    console.log("loaded")
</d:js>
// The example below is a JSON property that you can pass to a component
// You can have multiple different properties, so you can pass different properties to different components
<d:test>
    {
        "a":"a",
        "b":"b",
        "c":"c"
    }
</d:test>
```

### ./components/test.tot:
```
<d:html>
    <div>
        TEST {{ props.b }}
    </div>
</d:html>
<d:js>
    console.log("test");
    console.log("{{ props.a }}");
</d:js>
<d:css>
</d:css>
```

## 💪 Sponsor 
[Github sponsor page](https://github.com/sponsors/opdev1004)

## 👨‍💻 Author
[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License
MIT, See [LICENSE](./LICENSE).
