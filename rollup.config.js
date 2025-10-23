import fs from 'fs'

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript'
import nodePolyfills from 'rollup-plugin-polyfill-node';
import 'dotenv/config'


const filename = 'MpApi'
const src_dir = './src'
const dist_dir = './dist'

const TARGET_DIR = process.env.TARGET_DIR ?? dist_dir

function copyPlugin(from, to) {
    return {
        name: 'Copy',
        writeBundle() {
            fs.copyFileSync(from, to);
        }
    }
};

export default [
    {
        input: src_dir + '/MpApi/MusicPlayer.ts',
        output: [
            {
                file: dist_dir + `/${filename}.js`,
                name: filename,
                format: 'iife',
                strict: false,
                sourcemap: true,
                footer: `
const MusicPlayer = MpApi.MusicPlayer
const MpRuntime = MpApi.MpRuntime`
            },
        ],
        plugins: [
            commonjs(), json(), resolve(), typescript(), nodePolyfills(),
            copyPlugin(`${dist_dir}/${filename}.js`, `${TARGET_DIR}/${filename}.js`),
            copyPlugin(`${dist_dir}/${filename}.js.map`, `${TARGET_DIR}/${filename}.js.map`),
        ],
    },
    {
        input: src_dir + '/URL.ts',
        output: [
            {
                file: dist_dir + `/URL.js`,
                name: '__URL',
                format: 'iife',
                strict: false,
                footer: `
const URL = __URL.URL`
            },
        ],
        plugins: [
            commonjs(), json(), resolve(), typescript(), nodePolyfills(),
            copyPlugin(`${dist_dir}/URL.js`, `${TARGET_DIR}/URL.js`),
        ],
    },
    {
        input: src_dir + '/TextEncoderDecoder.ts',
        output: [
            {
                file: dist_dir + `/TextEncoderDecoder.js`,
                name: '__TextEncoderDecoder',
                format: 'iife',
                strict: false,
                footer: `
const TextEncoder = __TextEncoderDecoder.TextEncoder
const TextDecoder = __TextEncoderDecoder.TextDecoder`
            },
        ],
        plugins: [
            commonjs(), json(), resolve(), typescript(), nodePolyfills(),
            copyPlugin(`${dist_dir}/TextEncoderDecoder.js`, `${TARGET_DIR}/TextEncoderDecoder.js`),
        ],
    },
];

