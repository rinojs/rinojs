const Rino = require('../src/index.js');

async function test()
{
    let rino = new Rino();

    let data = {
        title: 'Test Title',
        testid: 'test'
    }

    let page = await rino.buildPage("./page/index.tot", "./components");
    page = await rino.buildData(page, data);
    await rino.writeFiles("./dist/", page);
}

test();