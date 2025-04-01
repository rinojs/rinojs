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
### 🎉 Release version v2.7.0
Please use the latest version. Recommended to upgrade version of Rino after at least a day/a week after the release. So you don't have to deal with huge bug with new version. Because it is going to be tested in production level by development team after release.
- Fixed bug bug for sitemap and feed

#### Including update from v2.4.0 & v2.5.0 & v2.6.0 & v2.7.0
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
- /pages/content.html
- /pages/content-list.html
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
`./pages/content.html`:
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
      <div>
        <a href="{{ content.prevLink }}">{{ content.prevName }}</a>
      </div>
      <div>
        <a href="{{ content.nextLink }}">{{ content.nextName }}</a>
      </div>
    </nav>
  </main>
</body>
</html>
```
`./pages/content-list.html`:
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
      <li><a href="{{ contentList.link1 }}">{{ contentList.name1 }}</a></li>
      <li><a href="{{ contentList.link2 }}">{{ contentList.name2 }}</a></li>
      <li><a href="{{ contentList.link3 }}">{{ contentList.name3 }}</a></li>
      <li><a href="{{ contentList.link4 }}">{{ contentList.name4 }}</a></li>
      <li><a href="{{ contentList.link5 }}">{{ contentList.name5 }}</a></li>
      <li><a href="{{ contentList.link6 }}">{{ contentList.name6 }}</a></li>
      <li><a href="{{ contentList.link7 }}">{{ contentList.name7 }}</a></li>
      <li><a href="{{ contentList.link8 }}">{{ contentList.name8 }}</a></li>
      <li><a href="{{ contentList.link9 }}">{{ contentList.name9 }}</a></li>
      <li><a href="{{ contentList.link10 }}">{{ contentList.name10 }}</a></li>
    </ol>

    <nav>
      <a href="{{ contentList.prevLink }}">← Previous Page</a> |
      <a href="{{ contentList.nextLink }}">Next Page →</a>
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
