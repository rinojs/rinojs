const Rino = require('../src/index.js');
const path = require('path');
const { pages } = require("./pages.js");

async function test()
{
    let rino = new Rino();
    let args = {
        pages: await pages(),
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