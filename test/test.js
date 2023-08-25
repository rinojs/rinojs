const Rino = require('../src/index.js');
const path = require('path');
const { pages } = require("./pages.js");

async function test()
{
    let rino = new Rino();
    let args = {
        pages: await pages(),
        distRoot: path.resolve(__dirname, "../testdist"),
        src: path.resolve(__dirname, "./"),
        public: path.resolve(__dirname, "../public")
    }

    await rino.dev(args);

    /*
    let page = await rino.buildPage("./page/index.tot");
    page = await rino.buildData(page, data);
    await rino.writeFiles("./dist/", page);
    */
}

test();