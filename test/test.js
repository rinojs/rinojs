const Rino = require('../src/index.js');
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

    /*
    let page = await rino.buildPage("./page/index.tot");
    page = await rino.buildData(page, data);
    await rino.writeFiles("./dist/", page);
    */
}

test();