import { rollup } from "rollup";
import virtual from '@rollup/plugin-virtual';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export async function bundleGeneralJS(code, name = "jsbundle")
{
    const bundle = await rollup({
        input: 'entry',
        treeshake: false,
        context: "window",
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

    const { output } = await bundle.generate({
        format: 'iife',
        name: name,
        inlineDynamicImports: true,
        exports: 'auto',
    });
    const bundledCode = output[0].code;

    return bundledCode;
}