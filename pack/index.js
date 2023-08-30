const path = require('path');
const { cloneDirectory } = require(`./clone-directory`)
const { emptyDirectory } = require(`./empty-directory`)

const distpath = path.resolve("./dist/");
const srcpath = path.resolve("./src/");

console.log(`1. Empty ${ distpath }`);
emptyDirectory(distpath);

console.log(`
2. ${ distpath } is empty now!
`);

console.log(`
3. Copy everything from:
${ srcpath }
And paste them into:
${ distpath }
`);

cloneDirectory(srcpath, distpath);

console.log(`
4. Copy is done! Now ready to publish!
`);