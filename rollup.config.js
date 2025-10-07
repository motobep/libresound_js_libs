import fs from 'fs'

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript'
import nodePolyfills from 'rollup-plugin-polyfill-node';
import 'dotenv/config'


const filename = 'MpApi'
const src_dir = './MpApi'
const dist_dir = './dist'

const TARGET_DIR = process.env.TARGET_DIR ?? dist_dir

let myPlugin = {
    name: 'Copy',
    writeBundle() {
        let s = fs.readFileSync(`${dist_dir}/${filename}.js`) + fs.readFileSync(`epilog.js`)
        fs.writeFileSync(`${TARGET_DIR}/${filename}.js`, s)
    }
};

export default [{
    input: src_dir + '/MusicPlayer.ts',
    output: [
        {
            file: dist_dir + `/${filename}.js`,
            name: filename,
            format: 'iife',
            strict: false,
        },
    ],
    plugins: [
        commonjs(), json(), resolve(), typescript(), nodePolyfills(), myPlugin
    ],
}];

