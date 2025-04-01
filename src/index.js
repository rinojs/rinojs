import fs from "fs";
import fse from "fs-extra";
import fsp from "fs/promises";
import path from "path";
import url from "url";
import chokidar from "chokidar";
import express from "express";
import cors from "cors";
import http from "http";
import chalk from "chalk";
import CleanCSS from "clean-css";
import { findPort } from "./core/find-port.js";
import { createWSS } from "./core/wss.js";
import { openBrowser } from "./core/browser.js";
import { injectReload } from "./core/inject-reload.js";
import { bundleJS } from "./core/bundleJS.js";
import { bundleTS } from "./core/bundleTS.js";
import { bundleCSS } from "./core/bundleCSS.js";
import { buildComponent } from "./core/component.js";
import { generateSitemap, generateSitemapFile } from "./core/sitemap.js";
import { generateProjectSitemap } from "./core/projectSitemap.js";
import { generateRSSFeed, generateRSSFeedFile } from "./core/rssFeed.js";
import { generateAtomFeed, generateAtomFeedFile } from "./core/atomFeed.js";
import { generateContentFeeds } from './core/projectFeed.js';
import { getFilesRecursively } from "./core/fileGetter.js";
import { copyFiles } from "./core/copyFiles.js";
import { buildSSRComponent } from "./core/ssr/ssrComponent.js";
import { fileExists } from "./core/fsHelper.js";
import { buildContent } from "./core/content.js";
import { buildContentList } from "./core/contentList.js";


export class Rino
{
  constructor ()
  {
    this.defaultMSG = `${chalk.redBright.bgBlack(`
██████╗ ██╗███╗   ██╗ ██████╗         ██╗███████╗
██╔══██╗██║████╗  ██║██╔═══██╗        ██║██╔════╝
██████╔╝██║██╔██╗ ██║██║   ██║        ██║███████╗
██╔══██╗██║██║╚██╗██║██║   ██║   ██   ██║╚════██║
██║  ██║██║██║ ╚████║╚██████╔╝██╗╚█████╔╝███████║
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝
`)}
${chalk.white.bold("Become a sponsor & support Rino.js!")}
${chalk.white("https://github.com/sponsors/opdev1004")}
        `;
    this.port = 3000;
    this.wss = undefined;
    this.config = {};
    this.getFilesRecursively = getFilesRecursively;
    this.generateSitemap = generateSitemap;
    this.generateSitemapFile = generateSitemapFile;
    this.generateProjectSitemap = generateProjectSitemap;
    this.generateRSSFeed = generateRSSFeed;
    this.generateRSSFeedFile = generateRSSFeedFile;
    this.generateAtomFeed = generateAtomFeed;
    this.generateAtomFeedFile = generateAtomFeedFile;
    this.generateContentFeeds = generateContentFeeds;
  }

  async generate (projectPath)
  {
    if (!projectPath)
    {
      console.error(`Project path does not exist.`);
      return;
    }

    console.clear();
    console.log(this.defaultMSG);

    await this.loadConfig(projectPath);

    const dirs = {
      pages: path.join(projectPath, "pages"),
      components: path.join(projectPath, "components"),
      public: path.join(projectPath, "public"),
      scripts: path.join(projectPath, "scripts/export"),
      styles: path.join(projectPath, "styles/export"),
      mds: path.join(projectPath, "mds"),
      contents: path.join(projectPath, "contents"),
      dist: this.config.dist ? path.resolve(projectPath, this.config.dist) : path.resolve(projectPath, "./dist"),
    };

    if (fs.existsSync(dirs.dist))
    {
      await fse.emptyDir(dirs.dist);
      console.log(chalk.red(`Cleared ${dirs.dist} \n`));
    }

    await copyFiles(dirs.public, dirs.dist);
    console.log(chalk.blue(`
Public files are copied to ${dirs.dist}
    `));

    const pages = getFilesRecursively(dirs.pages, [".html"]);

    for (const pagePath of pages)
    {
      const relativePath = path.relative(dirs.pages, pagePath);
      const distPagePath = path.join(dirs.dist, relativePath);
      const distDir = path.dirname(distPagePath);

      if (!fs.existsSync(distDir))
      {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const pageContent = await buildComponent(
        pagePath,
        dirs.components,
        dirs.mds,
        [pagePath]
      );
      fs.writeFileSync(distPagePath, pageContent);

      console.log(chalk.greenBright(`Page generated: ${distPagePath}`));
    }

    const scripts = getFilesRecursively(dirs.scripts, [".js", ".mjs"]);

    for (const scriptPath of scripts)
    {
      const relativePath = path.relative(dirs.scripts, scriptPath);
      const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
      const distDir = path.dirname(distScriptPath);

      if (!fs.existsSync(distDir))
      {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const scriptContent = await bundleJS(
        scriptPath,
        path.basename(scriptPath, path.extname(scriptPath))
      );
      fs.writeFileSync(distScriptPath, scriptContent);

      console.log(chalk.greenBright(`Script generated: ${distScriptPath}`));
    }

    const tsScripts = getFilesRecursively(dirs.scripts, [".ts"]);

    for (const scriptPath of tsScripts)
    {
      const relativePath = path.relative(dirs.scripts, scriptPath);
      const distScriptPath = path.join(dirs.dist, "scripts", relativePath);
      const distDir = path.dirname(distScriptPath);

      if (!fs.existsSync(distDir))
      {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const scriptContent = await bundleTS(
        scriptPath,
        projectPath,
        path.basename(scriptPath, path.extname(scriptPath))
      );
      fs.writeFileSync(distScriptPath.replace(".ts", ".js"), scriptContent);

      console.log(chalk.greenBright(`Typescript compiled: ${distScriptPath}`));
    }

    const styles = getFilesRecursively(dirs.styles, [".css"]);
    const cccs = new CleanCSS();

    for (const stylePath of styles)
    {
      const relativePath = path.relative(dirs.styles, stylePath);
      const distStylePath = path.join(dirs.dist, "styles", relativePath);
      const distDir = path.dirname(distStylePath);

      if (!fs.existsSync(distDir))
      {
        fs.mkdirSync(distDir, { recursive: true });
      }

      let styleContent = await bundleCSS(
        await fs.promises.readFile(stylePath, "utf8"),
        path.dirname(stylePath)
      );
      styleContent = cccs.minify(styleContent).styles;
      fs.writeFileSync(distStylePath, styleContent);

      console.log(chalk.greenBright(`Style generated: ${distStylePath}`));
    }



    if (fs.existsSync(dirs.contents))
    {
      const contentTemplatePath = path.join(dirs.pages, "content.html");
      const contentListTemplatePath = path.join(dirs.pages, "content-list.html");

      if (fs.existsSync(contentTemplatePath))
      {
        const contentFiles = getFilesRecursively(dirs.contents, [".md"]);

        for (const mdPath of contentFiles)
        {
          const relativePath = path.relative(dirs.contents, mdPath);
          const category = relativePath.split(path.sep)[0];
          const pagePath = path.join(dirs.pages, "content.html");

          const html = await buildContent(mdPath, pagePath, dirs.components, dirs.mds, [pagePath]);

          const outputPath = path.join(
            dirs.dist,
            "contents",
            relativePath.replace(/\.md$/, ".html")
          );

          await fse.ensureDir(path.dirname(outputPath));
          await fsp.writeFile(outputPath, html, "utf-8");

          console.log(chalk.greenBright(`Content generated: ${outputPath}`));
        }
      }
      else
      {
        console.warn(chalk.yellow("Skipped content page generation: content.html not found."));
      }

      if (fs.existsSync(contentListTemplatePath))
      {
        const categoryDirs = (await fsp.readdir(dirs.contents, { withFileTypes: true }))
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const category of categoryDirs)
        {
          const categoryDir = path.join(dirs.contents, category);
          const files = (await fsp.readdir(categoryDir)).filter(f => f.endsWith(".md"));
          const pageCount = Math.ceil(files.length / 10);
          const listTemplatePath = path.join(dirs.pages, "content-list.html");

          for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++)
          {
            const contentListPath = `${category}-${pageIndex}`;
            const html = await buildContentList(
              contentListPath,
              dirs.contents,
              listTemplatePath,
              dirs.components,
              dirs.mds,
              10,
              [listTemplatePath]
            );

            const outputPath = path.join(
              dirs.dist,
              "contents-list",
              category,
              `${contentListPath}.html`
            );

            await fse.ensureDir(path.dirname(outputPath));
            await fsp.writeFile(outputPath, html, "utf-8");

            console.log(chalk.greenBright(`Content list generated: ${outputPath}`));
          }
        }
      }
      else
      {
        console.warn(chalk.yellow("Skipped content list generation: content-list.html not found."));
      }
    }
    else
    {
      console.warn(chalk.yellow("Skipped content and content list generation: contents/ folder not found."));
    }

    console.log(chalk.blueBright("\nBuild process completed! \n"));
  }

  async loadConfig (projectPath)
  {
    const configPath = path.join(projectPath, "rino-config.js");
    if (fs.existsSync(configPath))
    {
      try
      {
        const configModule = await import(url.pathToFileURL(configPath));
        this.config = { ...configModule.default };
        if (!this.config.dist) this.config.dist = "./dist";
        if (!this.config.port) this.config.port = 3000;

        this.port = this.config.port || 3000;

        console.log(chalk.greenBright("Configuration loaded successfully! \n"));
      } catch (error)
      {
        console.error(
          chalk.redBright("Error loading configuration file:"),
          error
        );
      }
    } else
    {
      if (!this.config.dist) this.config.dist = "./dist";
      if (!this.config.port) this.config.port = 3000;

      console.log(
        chalk.yellowBright(
          "No rino-config.js found. Using default configuration."
        )
      );
    }
  }

  async dev (projectPath)
  {
    if (!projectPath)
    {
      console.error(`Project path does not exist.`);
      return;
    }

    console.clear();
    console.log(this.defaultMSG);

    await this.loadConfig(projectPath);

    const dirs = {
      pages: path.join(projectPath, "pages"),
      components: path.join(projectPath, "components"),
      public: path.join(projectPath, "public"),
      scripts: path.join(projectPath, "scripts"),
      styles: path.join(projectPath, "styles"),
      mds: path.join(projectPath, "mds"),
    };

    chokidar
      .watch([dirs.pages, dirs.components, dirs.mds, dirs.public, dirs.scripts, dirs.styles], { ignoreInitial: true })
      .on("add", (filePath) => this.handleFileChange(filePath, "add"))
      .on("change", (filePath) => this.handleFileChange(filePath, "change"))
      .on("unlink", (filePath) => this.handleFileChange(filePath, "unlink"));

    await this.startServer(projectPath);
    const url = `http://localhost:${this.port}`;
    await openBrowser(url);
  }

  handleFileChange (filePath, event)
  {
    console.clear();
    console.log(this.defaultMSG);
    console.log(`
Server listening on port ${this.port}
Development: ${chalk.blueBright.underline(`http://localhost:` + this.port)}
            `);

    if (event === "add" || event === "change")
      console.log(
        `${chalk.bgMagenta(filePath)} is ${chalk.blue(`added/changed`)}!`
      );
    else if (event === "unlink")
      console.log(`${chalk.bgMagenta(filePath)} is ${chalk.red(`deleted`)}!`);

    this.wss.clients.forEach((client) =>
    {
      client.send("reload");
    });

    return;
  }

  async startServer (projectPath)
  {
    const app = express();
    this.port = await findPort(this.port);

    app.use(
      cors({
        origin: ["http://localhost"],
        methods: ["GET", "POST", "DELETE", "UPDATE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
        maxAge: 86400,
      })
    );

    app.get("/scripts/*.(js|mjs)", async (req, res) =>
    {
      const requestPath = req.path.replace("/scripts", "");
      const scriptsPath = path.join(projectPath, "scripts/export", requestPath);

      if (fs.existsSync(scriptsPath) && fs.statSync(scriptsPath).isFile())
      {
        try
        {
          const scriptContent = await bundleJS(
            scriptsPath,
            path.basename(scriptsPath, path.extname(scriptsPath))
          );
          res.setHeader("Content-Type", "application/javascript");
          res.send(scriptContent);
          return;
        } catch (err)
        {
          console.error(`Error bundling script: ${scriptsPath}`, err);
          res.status(500).send("Internal Server Error");
          return;
        }
      }

      const tsPath = path.join(
        projectPath,
        "scripts/export",
        requestPath.replace(".js", ".ts")
      );

      if (fs.existsSync(tsPath) && fs.statSync(tsPath).isFile())
      {
        try
        {
          const scriptContent = await bundleTS(
            tsPath,
            projectPath,
            path.basename(tsPath, path.extname(tsPath))
          );
          res.setHeader("Content-Type", "application/javascript");
          res.send(scriptContent);
          return;
        } catch (err)
        {
          console.error(`Error bundling script: ${tsPath}`, err);
          res.status(500).send("Internal Server Error");
          return;
        }
      }

      const publicPath = path.join(projectPath, "public", requestPath);

      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile())
      {
        res.sendFile(publicPath);
        return;
      }

      res.status(404).send("File not found");
    });

    app.get("/styles/*.css", async (req, res) =>
    {
      const requestPath = req.path.replace("/styles", "");
      const stylesPath = path.join(projectPath, "styles/export", requestPath);

      if (fs.existsSync(stylesPath) && fs.statSync(stylesPath).isFile())
      {
        try
        {
          const styleContent = await bundleCSS(
            await fs.promises.readFile(stylesPath, "utf8"),
            path.dirname(stylesPath)
          );
          res.setHeader("Content-Type", "text/css");
          res.send(styleContent);
          return;
        } catch (err)
        {
          console.error(`Error bundling style: ${stylesPath}`, err);
          res.status(500).send("Internal Server Error");
          return;
        }
      }

      const publicPath = path.join(projectPath, "public", requestPath);
      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile())
      {
        res.sendFile(publicPath);
        return;
      }

      res.status(404).send("File not found");
    });

    app.get("/contents/*", async (req, res) =>
    {
      const slug = req.path.replace(/^\/contents\//, "");
      const [category, ...rest] = slug.split("/");
      const rawName = decodeURIComponent(rest.join("/"));
      const fileName = rawName + ".md";
      const mdPath = path.join(projectPath, "contents", category, fileName);

      if (!await fileExists(mdPath))
      {
        res.status(404).send("Content not found");
        return;
      }

      const pagePath = path.join(projectPath, "pages", "content.html");
      const componentsDir = path.join(projectPath, "components");
      const mdsDir = path.join(projectPath, "mds");

      try
      {
        const html = await buildContent(mdPath, pagePath, componentsDir, mdsDir, [pagePath]);
        res.send(html);
      } catch (err)
      {
        console.error("Error rendering content:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/contents-list/*", async (req, res) =>
    {
      const slug = req.path.replace(/^\/contents-list\//, "");
      const [category, categoryPage] = slug.split("/");
      const contentListPath = categoryPage;
      const contentsDir = path.join(projectPath, "contents");
      const pagePath = path.join(projectPath, "pages", "content-list.html");
      const componentsDir = path.join(projectPath, "components");
      const mdsDir = path.join(projectPath, "mds");

      try
      {
        const html = await buildContentList(contentListPath, contentsDir, pagePath, componentsDir, mdsDir, 10, [pagePath]);
        res.send(html);
      } catch (err)
      {
        console.error("Error rendering content list:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("*", async (req, res) =>
    {
      let requestPath = req.path;

      if (requestPath.endsWith("/"))
      {
        requestPath += "index.html";
      }

      let pageFilePath = requestPath.endsWith(".html") ? path.join(projectPath, "pages", path.normalize(requestPath)) : path.join(projectPath, "pages", path.normalize(requestPath) + ".html");

      if (await fileExists(pageFilePath))
      {
        const componentsDir = path.join(projectPath, "components");
        const mdsDir = path.join(projectPath, "mds");
        let pageContent = await buildComponent(
          pageFilePath,
          componentsDir,
          mdsDir,
          [pageFilePath]
        );
        pageContent = await injectReload(pageContent, this.port);

        res.send(pageContent);
        return;
      }

      const publicPath = path.join(projectPath, "public", requestPath);

      if (await fileExists(publicPath))
      {
        res.sendFile(publicPath);
        return;
      }

      const publicHTMLPath = path.join(
        projectPath,
        "public",
        requestPath + ".html"
      );

      if (await fileExists(publicHTMLPath))
      {
        let htmlContent = await fsp.readFile(publicHTMLPath, "utf-8");
        htmlContent = await injectReload(htmlContent, this.port);
        res.send(htmlContent);
        return;
      }

      if (!requestPath.endsWith("/") && !path.extname(requestPath))
      {
        return res.redirect(301, requestPath + "/");
      }

      const pages404path = path.join(projectPath, "pages", "404.html");
      const public404path = path.join(projectPath, "public", "404.html");

      if (await fileExists(pages404path))
      {
        const componentsDir = path.join(projectPath, "components");
        const mdsDir = path.join(projectPath, "mds");
        let pageContent = await buildComponent(
          pages404path,
          componentsDir,
          mdsDir,
          [pages404path]
        );
        pageContent = await injectReload(pageContent, this.port);

        res.send(pageContent);
        return;
      }
      else if (await fileExists(public404path))
      {
        let pageContent = await fsp.readFile(public404path, "utf-8");
        pageContent = await injectReload(pageContent, this.port);

        res.send(pageContent);
        return;
      }
      else
      {
        res.status(404).send("Page not found");
      }
    });

    const server = http.createServer(app);

    server.listen(this.port, () =>
    {
      console.log(`
Server listening on port ${this.port}
Development: ${chalk.blueBright(`http://localhost:` + this.port)}
            `);
    });

    this.wss = await createWSS(server);
  }

  static generateSitemap = generateSitemap;
  static generateSitemapFile = generateSitemapFile;
  static generateProjectSitemap = generateProjectSitemap;
  static getFilesRecursively = getFilesRecursively;
  static generateRSSFeed = generateRSSFeed;
  static generateRSSFeedFile = generateRSSFeedFile;
  static generateAtomFeed = generateAtomFeed;
  static generateAtomFeedFile = generateAtomFeedFile;
  static generateContentFeeds = generateContentFeeds;
}

export
{
  findPort,
  buildSSRComponent,
  bundleJS,
  bundleTS,
  bundleCSS,
  getFilesRecursively,
  generateSitemap,
  generateSitemapFile,
  generateProjectSitemap,
  generateRSSFeed,
  generateRSSFeedFile,
  generateAtomFeed,
  generateAtomFeedFile,
  generateContentFeeds
}