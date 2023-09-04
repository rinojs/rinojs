const { dev } = require('./core/dev');
const { build } = require('./core/build');
const { buildMultiple } = require('./core/build-multiple');
const { buildPage } = require('./core/page');
const { buildComponent } = require('./core/component');
const { writeFiles } = require('./core/write-files');
const { findPort, isPortInUse } = require('./core/find-port');
const { loadJSON, loadTot } = require('./core/obj-handler');

module.exports = class Rino
{
    constructor()
    {
    }

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
        publicDirname: `public directory where you store asset files.`
    }
    */
    async dev(args = { pages: [{ data: null, pageFilename: "", filenames: { html: "", css: "", js: "" } }], distRoot: "", src: "", publicDirname: "" })
    {
        await dev(args.pages, args.distRoot, args.src, args.publicDirname);
    }

    /* 
    build()
    arguments: args
    args: {
        pageFilename: `File name for the page, the entry .tot file.`,
        distDirname: `This is the directory where the output files will be stored.`,
        tots: [{name: `name of this`, filename: `File path of .tot file`}, ...],
        mds: [{nname: `name of this`, filename: `File path of .md file`}, ...],
        data: `js object, json data for injecting to the html, css and javascript`,
        filenames: {
            html: `filename for html, default is /index.html`,
            css: `filename for css, default is /style.css`,
            js: `filename for js, default is /main.js`
        }
    }
    */
    async build(args = { pageFilename: "", distDirname: "", tots: [{ name: "", filename: "" }], mds: [{ name: "", filename: "" }], data: null, filenames: { html: "", css: "", js: "" } })
    {
        await build(args.pageFilename, args.distDirname, args.tots, args.mds, args.data, args.filenames);
    }

    /* 
    buildMultiple()
    argument:
    [
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
    ]
    */
    async buildMultiple(pages = [{ pageFilename: "", distDirname: "", tots: [{ name: "", filename: "" }], mds: [{ name: "", filename: "" }], data: null, filenames: { html: "", css: "", js: "" } }])
    {
        await buildMultiple(pages);
    }

    /* 
    buildPage()
    arguments: args
    args: {
        filename: `File name for the page, strting .tot file path.`,
        data: `js object, json data for injecting to the html, css and javascript`,
    }
    */
    async buildPage(args = { filename: "", data: null })
    {
        await buildPage(args.filename, args.data);
    }


    /* 
    buildComponent()
    arguments:
    {
        filename: `This is the file path of tot file.`,
        data: `js object, json data for injecting to the html, css and javascript`,
        props: properties that is passed from the parent. List.
    }
    */
    async buildComponent(args = { filename: "", data: null, props: [] })
    {
        await buildComponent(args.filename, args.data, args.props);
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

    /*
    loadJSON()
    arguments: filename: `filename for json`
    */
    async loadJSON(filename, encoding = "utf8")
    {
        return await loadJSON(filename, encoding);
    }

    /*
    loadTot()
    arguments: filename: `filename for tot`
    */
    async loadTot(filename, encoding = "utf8")
    {
        return await loadTot(filename, encoding);
    }
}