/* jshint esversion: 6 */

import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

import pkg from './package.json';

const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
    .replace(/-\w/g, m => m[1].toUpperCase());

export default {
    input: 'src/index.ts',
    output: [
        { file: pkg.module, format: 'es' },
        { file: pkg.main, format: 'umd', name },
    ],
    plugins: [
        typescript(),
        json(),
    ],
};