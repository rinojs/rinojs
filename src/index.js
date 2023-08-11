const { dev } = require('./core/dev');
const { build } = require('./core/build');
const { buildMultiple } = require('./core/build-multiple');
const { buildPage } = require('./core/page');
const { buildPComponent } = require('./core/pcomponent');
const { buildComponent } = require('./core/component');
const { writeFiles } = require('./core/write-files');
const { findPort, isPortInUse } = require('./core/find-port');
const { encodeCode, decodeCode } = require('./core/entities');
const { loadJSON } = require('./core/json-loader');

module.exports = class Rino
{
    constructor()
    {
    }


    /* 
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
    */
    async dev(args)
    {
        await dev(args);
    }

    /* 
    build()
    arguments: args
    args: {
        data: `json data for injecting to the html, css and javascript`,
        pageFilename: `File name for the page, strting .tot file.`,
        distDirname: `This is the directory where the output files will be stored.`,
        filenames: {
            html: `filename for html, default is /index.html`,
            css: `filename for css, default is /style.css`,
            js: `filename for js, default is /main.js`
        }
    }
    */
    async build(args)
    {
        await build(args);
    }

    /*
    buildMultiple()
    arguments: pages
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
    ]
    */
    async buildMultiple(pages)
    {
        await buildMultiple(pages);
    }

    /* 
    buildPage()
    arguments: args
    args: {
        filename: `File name for the page, strting .tot file path.`,
        data: `json data for injecting to the html, css and javascript`,
    }
    */
    async buildPage(args)
    {
        await buildPage(args);
    }


    /* 
    buildPComponent()
    arguments: args
    args: {
        filename: `This is the file path of tot file.`,
        data: `json data for injecting to the html, css and javascript`,
        props: properties that is passed from the parent.
    }
    */
    async buildPComponent(args)
    {
        await buildPComponent(args);
    }

    /* 
    buildComponent()
    arguments: args
    args: {
        filename: `This is the file path of tot file.`,
        data: `json data for injecting to the html, css and javascript`,
        props: `properties that is passed from the parent.`,
        htmlName: `Name of the variable for html content.`,
    }
    */
    async buildComponent(args)
    {
        await buildComponent(args);
    }

    /*
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
    */
    async writeFiles(dirname, obj, filenames = undefined)
    {
        await writeFiles(dirname, obj, filenames);
    }

    async findPort(port)
    {
        return await findPort(port);
    }

    async isPortInUse(port)
    {
        return await isPortInUse(port);
    }

    // For entity
    async encodeCode(page)
    {
        return await encodeCode(page);
    }

    // For entity
    async decodeCode(page)
    {
        return await decodeCode(page);
    }

    // For manage data of pages in JSON.
    async loadJSON(filename, encoding = "utf8")
    {
        return await loadJSON(filename, encoding);
    }
}