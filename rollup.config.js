const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const json = require('@rollup/plugin-json');

module.exports = {
    input: 'src/index.js', // Your library entry point
    output: {
        file: 'depdist/rino.min.js', // Output file path
        format: 'cjs', // CommonJS format for Node.js
    },
    plugins: [
        nodeResolve(), // Resolve Node.js modules
        commonjs(), // Convert CommonJS modules to ES modules
        terser(), // Minify the output
        json()
    ],
};