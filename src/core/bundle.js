const rollup = require('rollup');
const virtual = require('@rollup/plugin-virtual');
const terser = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

async function bundlejs(code, name = "jsbundle")
{
    const bundle = await rollup.rollup({
        input: 'entry',
        treeshake: false,
        context: "window",
        output: {
            inlineDynamicImports: true,
            export: "auto",
            format: 'iife',
            name: name
        },
        plugins: [
            virtual({
                entry: code
            }),
            terser({
                compress: {
                    dead_code: false,
                    keep_classnames: true,
                    keep_fnames: true,
                    keep_fargs: true,
                    toplevel: false,
                    unused: false
                },
                mangle: {
                    keep_classnames: true,
                    keep_fnames: true,
                    toplevel: false
                },
                toplevel: false,
                keep_classnames: true,
                keep_fnames: true,
            }),
            nodeResolve({
                browser: true,
                mainFields: ['module', 'browser']
            }),
            commonjs()
        ]
    });

    const { output } = await bundle.generate({})
    const bundledCode = output[0].code;

    return bundledCode;
}


module.exports = { bundlejs }