const Rino = require('../src/index.js');
const path = require('path');

async function test()
{
    let data = {
        title: 'Test Title',
        testid: 'test'
    }

    let rino = new Rino();
    await rino.dev(data, path.resolve("./page/index.tot"), path.join(__dirname, "./"), path.join(__dirname, "../testdist"));

    /*
    let page = await rino.buildPage("./page/index.tot");
    page = await rino.buildData(page, data);
    await rino.writeFiles("./dist/", page);
    */
}

test();