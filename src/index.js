const { dev } = require('./core/dev');
const { build } = require('./core/build');
const { buildMultiple } = require('./core/build-multiple');
const { buildPage } = require('./core/page');
const { buildPComponent } = require('./core/pcomponent');
const { buildComponent } = require('./core/component');
const { writeFiles } = require('./core/write-files');
const { findPort, isPortInUse } = require('./core/find-port');
const { encodeCode, decodeCode } = require('./core/entities');
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
        root: `This is the directory of root where the output files will be stored.`,
        projectDirname: `Where your project files are. src directory path. This is for checking changes.`
    }
    */
    async dev(args = { pages: [{ data: null, pageFilename: "", filenames: { html: "", css: "", js: "" } }], root: "", projectDirname: "" })
    {
        await dev(args.pages, args.root, args.projectDirname);
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
    buildPComponent()
    arguments:
    {
        filename: `This is the file path of tot file.`,
        data: `js object, json data for injecting to the html, css and javascript`,
        props: properties that is passed from the parent.
    }
    */
    async buildPComponent(args = { filename: "", data: null, props: null })
    {
        await buildPComponent(args.filename, args.data, args.props);
    }

    /* 
    buildComponent()
    arguments: {
        filename: `This is the file path of tot file.`,
        htmlName: `Name of the variable for html content.`,
        data: `json data for injecting to the html, css and javascript`,
        props: `properties that is passed from the parent.`
    }
    */
    async buildComponent(args = { filename: "", htmlName: "", data: null, props: null })
    {
        await buildComponent(args.filename, args.htmlName, args.data, args.props);
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

    async encodeCode(page)
    {
        return await encodeCode(page);
    }

    async decodeCode(page)
    {
        return await decodeCode(page);
    }

    async loadJSON(filename, encoding = "utf8")
    {
        return await loadJSON(filename, encoding);
    }

    async loadTot(filename, encoding = "utf8")
    {
        return await loadTot(filename, encoding);
    }
}