import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import url from 'url';
import chokidar from 'chokidar';
import express from 'express';
import cors from 'cors';
import http from 'http';
import chalk from 'chalk';
import CleanCSS from 'clean-css';
import { findPort } from './core/find-port.js';
import { createWSS } from './core/wss.js';
import { openBrowser } from './core/browser.js';
import { injectReload } from './core/inject-reload.js';
import { bundleJS } from './core/bundleJS.js';
import { bundleCSS } from './core/bundleCSS.js';
import { buildComponent } from './core/component.js'
import { generateSitemap, generateSitemapFile } from './core/sitemap.js';
import { getFilesRecursively } from './core/fileGetter.js';
import { copyFiles } from './core/copyFiles.js';
import { generateProjectSitemap } from './core/projectSitemap.js';

export class Rino
{
    constructor()
    {
        this.defaultMSG = `${ chalk.redBright.bgBlack(`
██████╗ ██╗███╗   ██╗ ██████╗         ██╗███████╗
██╔══██╗██║████╗  ██║██╔═══██╗        ██║██╔════╝
██████╔╝██║██╔██╗ ██║██║   ██║        ██║███████╗
██╔══██╗██║██║╚██╗██║██║   ██║   ██   ██║╚════██║
██║  ██║██║██║ ╚████║╚██████╔╝██╗╚█████╔╝███████║
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝
`) }
${ chalk.white.bold('Become a sponsor & support Rino.js!') }
${ chalk.white('https://ko-fi.com/opdev1004') }
${ chalk.white('https://github.com/sponsors/opdev1004') }
        `;
        this.data = {
            pages: [],
            components: [],
            mds: [],
        };
        this.port = 3000;
        this.wss = undefined;
        this.config = {};
        this.generateSitemap = generateSitemap;
        this.generateSitemapFile = generateSitemapFile;
        this.generateProjectSitemap = generateProjectSitemap;
        this.getFilesRecursively = getFilesRecursively;
    }

    async generate(projectPath)
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
            pages: path.join(projectPath, 'pages'),
            components: path.join(projectPath, 'components'),
            public: path.join(projectPath, 'public'),
            scripts: path.join(projectPath, 'scripts/export'),
            styles: path.join(projectPath, 'styles/export'),
            mds: path.join(projectPath, 'mds'),
            dist: path.resolve(projectPath, this.config.dist),
        };

        if (fs.existsSync(dirs.dist))
        {
            await fse.emptyDir(dirs.dist);
            console.log(chalk.yellow(`Cleared ${ dirs.dist } \n`));
        }

        await copyFiles(dirs.public, dirs.dist);
        await this.loadFiles(dirs.components, ['.html'], 'components');
        await this.loadFiles(dirs.mds, ['.md'], 'mds');

        const pages = getFilesRecursively(dirs.pages, ['.html']);

        for (const pagePath of pages)
        {
            const relativePath = path.relative(dirs.pages, pagePath);
            const distPagePath = path.join(dirs.dist, relativePath);

            const distDir = path.dirname(distPagePath);
            if (!fs.existsSync(distDir))
            {
                fs.mkdirSync(distDir, { recursive: true });
            }

            let pageContent = fs.readFileSync(pagePath, 'utf8');
            pageContent = buildComponent(pageContent, this.data.components, this.data.mds);
            fs.writeFileSync(distPagePath, pageContent);

            console.log(chalk.greenBright(`Page generated: ${ distPagePath }`));
        }

        const scripts = getFilesRecursively(dirs.scripts, ['.js', '.mjs']);

        for (const scriptPath of scripts)
        {
            const relativePath = path.relative(dirs.scripts, scriptPath);
            const distScriptPath = path.join(dirs.dist, 'scripts', relativePath);

            const distDir = path.dirname(distScriptPath);
            if (!fs.existsSync(distDir))
            {
                fs.mkdirSync(distDir, { recursive: true });
            }

            const scriptContent = await bundleJS(scriptPath, path.basename(scriptPath, path.extname(scriptPath)));
            fs.writeFileSync(distScriptPath, scriptContent);

            console.log(chalk.greenBright(`Script generated: ${ distScriptPath }`));
        }

        const styles = getFilesRecursively(dirs.styles, ['.css']);
        const cccs = new CleanCSS();

        for (const stylePath of styles)
        {
            const relativePath = path.relative(dirs.styles, stylePath);
            const distStylePath = path.join(dirs.dist, 'styles', relativePath);

            const distDir = path.dirname(distStylePath);
            if (!fs.existsSync(distDir))
            {
                fs.mkdirSync(distDir, { recursive: true });
            }

            let styleContent = await bundleCSS(await fs.promises.readFile(stylePath, 'utf8'), path.dirname(stylePath));
            styleContent = cccs.minify(styleContent).styles;
            fs.writeFileSync(distStylePath, styleContent);

            console.log(chalk.greenBright(`Style generated: ${ distStylePath }`));
        }

        console.log(chalk.blueBright("\nBuild process completed! \n"));
    }

    async loadConfig(projectPath)
    {
        const configPath = path.join(projectPath, 'rino-config.js');
        if (fs.existsSync(configPath))
        {
            try
            {
                const configModule = await import(url.pathToFileURL(configPath));
                this.config = { ...configModule.default };
                if (!this.config.dist) this.config.dist = "./dist";
                if (!this.config.port) this.config.port = 3000;

                this.port = this.config.port || 3000;

                console.log(chalk.greenBright('Configuration loaded successfully! \n'));
            }
            catch (error)
            {
                console.error(chalk.redBright('Error loading configuration file:'), error);
            }
        }
        else
        {
            if (!this.config.dist) this.config.dist = "./dist";
            if (!this.config.port) this.config.port = 3000;

            console.log(chalk.yellowBright('No rino-config.js found. Using default configuration.'));
        }
    }



    async dev(projectPath)
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
            pages: path.join(projectPath, 'pages'),
            components: path.join(projectPath, 'components'),
            public: path.join(projectPath, 'public'),
            scripts: path.join(projectPath, 'scripts'),
            styles: path.join(projectPath, 'styles'),
            mds: path.join(projectPath, 'mds'),
        };

        await this.loadFiles(dirs.pages, ['.html'], 'pages');
        await this.loadFiles(dirs.components, ['.html'], 'components');
        await this.loadFiles(dirs.mds, ['.md'], 'mds');

        chokidar.watch([dirs.public, dirs.scripts, dirs.styles], { ignoreInitial: true })
            .on('add', filePath => this.handleFileChange(filePath, 'add'))
            .on('change', filePath => this.handleFileChange(filePath, 'change'))
            .on('unlink', filePath => this.handleFileChange(filePath, 'unlink'));

        chokidar.watch([dirs.pages, dirs.components, dirs.mds], { ignoreInitial: true })
            .on('add', filePath => this.handlePageChange(filePath, 'add'))
            .on('change', filePath => this.handlePageChange(filePath, 'change'))
            .on('unlink', filePath => this.handlePageChange(filePath, 'unlink'));
        await this.startServer(projectPath);
        const url = `http://localhost:${ this.port }`
        await openBrowser(url);
    }

    async loadFiles(dirPath, extensions, type)
    {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files)
        {
            const filePath = path.join(dirPath, file.name);

            if (file.isDirectory())
            {
                await this.loadFiles(filePath, extensions, type);
            }
            else if (!extensions || extensions.includes(path.extname(file.name).toLowerCase()))
            {
                const content = fs.readFileSync(filePath, 'utf8');
                this.data[type].push({ path: filePath, content });
            }
        }

        console.log(chalk.cyanBright(`${ type } files loaded!`));
    }

    handleFileChange(filePath, event)
    {
        console.clear();
        console.log(this.defaultMSG);
        console.log(`
Server listening on port ${ this.port }
Development: ${ chalk.blueBright.underline(`http://localhost:` + this.port) }
            `);

        if (event === 'add' || event === 'change')
            console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.blue(`added/changed`) }!`);
        else if (event === 'unlink')
            console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.red(`deleted`) }!`);

        this.wss.clients.forEach((client) =>
        {
            client.send('reload');
        });

        return;
    }

    handlePageChange(filePath, event)
    {
        const ext = path.extname(filePath).toLowerCase();
        const type = filePath.includes('pages') ? 'pages' : 'components';

        if ((type === 'pages' || type === 'components') && ext !== '.html') return;
        else if ((type === 'pages') && ext !== '.html') return;

        console.clear();
        console.log(this.defaultMSG);
        console.log(`Server listening on port ${ this.port }`);
        console.log(`Development: ${ chalk.blueBright.underline(`http://localhost:` + this.port) } \n`);

        if (event === 'add' || event === 'change')
        {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileIndex = this.data[type].findIndex(file => path.normalize(file.path) === path.normalize(filePath));

            if (fileIndex > -1)
            {
                this.data[type][fileIndex].content = content;
            }
            else
            {
                this.data[type].push({ path: filePath, content });
            }

            console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.blue(`added/changed`) }!`);
        }
        else if (event === 'unlink')
        {
            this.data[type] = this.data[type].filter(file => path.normalize(file.path) !== path.normalize(filePath));
            console.log(`${ chalk.bgMagenta(filePath) } is ${ chalk.red(`deleted`) }!`);
        }

        this.wss.clients.forEach((client) =>
        {
            client.send('reload');
        });

        return;
    }

    async startServer(projectPath)
    {
        const app = express();
        this.port = await findPort(this.port);

        app.use(cors({
            origin: ['http://localhost'],
            methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Authorization'],
            maxAge: 86400,
        }));

        app.get('/scripts/*.(js|mjs)', async (req, res) =>
        {
            const requestPath = req.path.replace('/scripts', '');

            const scriptsPath = path.join(projectPath, 'scripts/export', requestPath);
            if (fs.existsSync(scriptsPath) && fs.statSync(scriptsPath).isFile())
            {
                try
                {
                    const scriptContent = await bundleJS(scriptsPath, path.basename(scriptsPath, path.extname(scriptsPath)));
                    res.setHeader('Content-Type', 'application/javascript');
                    res.send(scriptContent);
                    return;
                }
                catch (err)
                {
                    console.error(`Error bundling script: ${ scriptsPath }`, err);
                    res.status(500).send("Internal Server Error");
                    return;
                }
            }

            const publicPath = path.join(projectPath, 'public', requestPath);
            if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile())
            {
                res.sendFile(publicPath);
                return;
            }

            res.status(404).send("File not found");
        });

        app.get('/styles/*.css', async (req, res) =>
        {
            const requestPath = req.path.replace('/styles', '');
            const stylesPath = path.join(projectPath, 'styles/export', requestPath);

            if (fs.existsSync(stylesPath) && fs.statSync(stylesPath).isFile())
            {
                try
                {
                    const styleContent = await bundleCSS(await fs.promises.readFile(stylesPath, 'utf8'), path.dirname(stylesPath));
                    res.setHeader('Content-Type', 'text/css');
                    res.send(styleContent);
                    return;
                } catch (err)
                {
                    console.error(`Error bundling style: ${ stylesPath }`, err);
                    res.status(500).send("Internal Server Error");
                    return;
                }
            }

            const publicPath = path.join(projectPath, 'public', requestPath);
            if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile())
            {
                res.sendFile(publicPath);
                return;
            }

            res.status(404).send("File not found");
        });

        app.get('*', async (req, res) =>
        {
            let requestPath = req.path;

            if (requestPath.endsWith('/'))
            {
                requestPath += 'index.html';
            }

            const page = structuredClone(this.data.pages.find(file =>
                path.normalize(file.path).endsWith(path.normalize(requestPath)) ||
                path.normalize(file.path).endsWith(path.normalize(`${ requestPath }.html`))
            ));

            if (page)
            {
                page.content = await injectReload(page.content, this.port);
                page.content = buildComponent(page.content, this.data.components, this.data.mds);
                res.send(page.content);
                return;
            }

            const publicPath = path.join(projectPath, 'public', requestPath);
            if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile())
            {
                res.sendFile(publicPath);
                return;
            }

            res.status(404).send("Page not found");
        });

        const server = http.createServer(app);

        server.listen(this.port, () =>
        {
            console.log(`
Server listening on port ${ this.port }
Development: ${ chalk.blueBright(`http://localhost:` + this.port) }
            `);
        });

        this.wss = await createWSS(server);
    }

    static generateSitemap = generateSitemap;
    static generateSitemapFile = generateSitemapFile;
    static generateProjectSitemap = generateProjectSitemap;
    static getFilesRecursively = getFilesRecursively;
};