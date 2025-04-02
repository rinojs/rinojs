# Rino.js 🦏

```
Fast learning, preprocessing, intuitive web framework.
```

Rino.js is created to fix the complexity matters of web framework.

## ▶️ Installation

The recommended way to start your Rino project:

```
npm create rino@latest
```

For manual setup:

```
npm i rinojs
```

## 📢 Notice
### 🎉 Release version v2.10.0
Please use the latest version. Recommended to upgrade version of Rino after at least a day or a week after the release. So you don't have to deal with huge bug with new version. Because it is going to be tested in production level by development team after release.
- Made content data available in the templating code. They are provided as string from process.argv. Check below code how the content data is used for content pagination.

---

- Fixed bug for sitemap and feed
- Added our logo message
- Fixed development server bug for script, styles and public directory system
- Restructured whole system
  - Better performance
  - Fixed development server problem
- No longer need to create class
```
import { devStaticSite, buildStaticSite } from '../src/index.js';
```
- Removed preloading files
- Added contents feature to static site generation (SSG)
- Updated sitemap to work with contents
- Added RSS/ATOM feed feature

The content feature requires the following:
- /content-theme/content.html
- /content-theme/content-list.html
- /contents/category/content.md

Top of Markdown content can contains data. It must be commented and JSON file format. I recommend to use frontend technology to take care when there's empty data.

`./contents/category/content.md`:
```
<!--
{
  "title": "Title of content",
  "description": "Description of content",
  "published": "1/1/2025"
}

Content body
-->
```
`./content-theme/content.html`:
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ content.title }}</title>
</head>
<body>
  <main>
    <h1>{{ content.title }}</h1>
    <p><em>Published: {{ content.published }}</em></p>
    <article>
      {{ content.body }}
    </article>
    <nav>
    <script @type="js" type="text/javascript">
      const args = process.argv;
      const contentDataString = args[args.length - 1];
      const contentData = JSON.parse(contentDataString);

      if(contentData.prevLink) {
        console.log(`
          <div>
            <a href="{{ content.prevLink }}">{{ content.prevName }}</a>
          </div>
        `);
      }
      if(contentData.nextLink) {
        console.log(`
          <div>
            <a href="{{ content.nextLink }}">{{ content.nextName }}</a>
          </div>
        `);
      }
    </script>
    </nav>
  </main>
</body>
</html>
```
`./content-theme/content-list.html`:
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Content List</title>
</head>
<body>
  <main>
    <h1>Content List Page</h1>
    <ol>
      <script @type="js" type="text/javascript">
        var args = process.argv;
        var contentListDataString = args[args.length - 1];
        var contentListData = JSON.parse(contentListDataString);
        var contentList = contentListData.contentList;

        for (let i = 0; i < contentList.length; i++) {
          const item = contentList[i];
          if (item?.name && item?.link) {
            console.log(`<li><a href="${item.link}">${item.name}</a></li>`);
          }
        }
      </script>
    </ol>

    <nav>
      <script @type="js" type="text/javascript">
        var args = process.argv;
        var contentListDataString = args[args.length - 1];
        var contentListData = JSON.parse(contentListDataString);
        var pagination = contentListData.pagination;

        if(pagination.prevLink) {
          console.log(`
            <div>
              <a href="{{ pagination.prevLink }}">Previous List</a>
            </div>
          `);
        }
        if(pagination.nextLink) {
          console.log(`
            <div>
              <a href="{{ pagination.nextLink }}">Next List</a>
            </div>
          `);
        }
      </script>
    </nav>
  </main>
</body>
</html>
```

### 👍 Releasing Version 2

New version, better development experience and totally different from version 1.

Many syntax is simplified and following html, css and javascript standard. And many things are updated for automation.

Development Build System is changed to the `server side rendering` with memory data management with individual IO update on change. I call this, `build on request`. This is so much faster than version 1.

#### Example of Rino 2

- ./pages/index.html

```
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <component
      @path="button"
      @tag="button"
      type="button"
      onclick="alert('Hello world!')"
    />
    <component @path="footer" @tag="footer" />
    <script @type="md" style="color: red" type="text/markdown">
      ## test

      test

      - test
    </script>
    <script @type="ts" type="text/typescript">
      // This is for templating html content
      let world: string = "Hello world! from typescript";
      console.log(world);
    </script>
    <script @type="js" type="text/javascript">
      // This is for templating html content
      console.log("Hello world! from javascript");
    </script>
  </body>
</html>

```

## 📖 Documentation

[Official Website](https://rinojs.org/)

## 💪 Support Rino!

### 👼 Become a Sponsor

- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 🐱‍🏍 **Sponsors**

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
