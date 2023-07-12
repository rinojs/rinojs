const { dev } = require('./core/dev');
const { rebuild } = require('./core/rebuild');
const { buildPage } = require('./core/page');
const { buildComponent } = require('./core/pcomponent');
const { writeFiles } = require('./core/write-files');
const { findPort, isPortInUse } = require('./core/find-port');

module.exports = class Rino
{
    constructor()
    {
    }


    /*
    dev()
    arguments: args
    args: {
        data: `json data for injecting to the html, css and javascript`,
        pageFilename: `File name for the page, strting .tot file.`,
        projectDirname: `Where your project files are. src directory path. This is for checking changes.`
        distDirname: `This is the directory where the output files will be stored.`,
        filenames: {
            html: `filename for html, default is /index.html`,
            css: `filename for css, default is /style.css`,
            js: `filename for js, default is /main.js`
        }
    }
    */
    async dev(args)
    {
        await dev(args);
    }

    /* 
    rebuild()
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
    async rebuild(args)
    {
        await rebuild(args);
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
    buildComponent()
    arguments: args
    args: {
        dirname: `This is the directory path. The directory where the component .tot file is.`,
        name: `file name of tot file without .tot extension`,
        data: `json data for injecting to the html, css and javascript`,
        props: `json string data for injecting to the html, css and javascript`
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
}