const path = require('path');
const { cloneDirectory } = require(`./clone-directory`)
const { emptyDirectory } = require(`./empty-directory`)


emptyDirectory(path.resolve("./dist/"));
cloneDirectory(path.resolve("./src/"), path.resolve("./dist/"));
