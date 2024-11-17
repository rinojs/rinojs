import path from 'path';
import { cloneDirectory } from './clone-directory.js';  // Use regular quotes
import { emptyDirectory } from './empty-directory.js';
import chalk from 'chalk';

const distpath = path.resolve("./dist/");
const srcpath = path.resolve("./src/");

console.log(chalk.cyanBright(`1. Empty ${ distpath }`));
emptyDirectory(distpath);

console.log(chalk.cyanBright(`
2. ${ distpath } is empty now!
`));

console.log(chalk.cyanBright(`
3. Copy everything from:
${ srcpath }
And paste them into:
${ distpath }
`));

cloneDirectory(srcpath, distpath);

console.log(chalk.cyanBright(`
4. Copy is done! Now ready to publish!
`));