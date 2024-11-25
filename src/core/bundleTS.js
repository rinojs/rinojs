import path from 'path';
import { rollup } from "rollup";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';


export async function bundleTS(scriptPath, projectPath, name = "tsbundle")
{
    const bundle = await rollup({
        input: scriptPath,
        treeshake: false,
        context: "window",
        plugins: [
            typescript({
                tsconfig: path.resolve(projectPath, "./tsconfig.json"),
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

    return output[0].code;
}