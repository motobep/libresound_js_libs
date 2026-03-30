import fs from 'fs'
import path from 'path'

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import 'dotenv/config'


const filename = 'MpApi'
const src_dir = './src'
const dist_dir = './dist'

const TARGET_DIR = process.env.TARGET_DIR ?? dist_dir

function exportFooter(name) {
    return `
const ${name} = __${name}.${name}
`
}

function globalThisFooter(name) {
    return `
const ${name} = __${name}.${name}
if (typeof globalThis !== 'undefined' ) {
    globalThis.${name} = ${name}
} else {
    var globalThis = {
        ${name}: ${name},
    }
}
`
}

function simpleTarget(name, footer) {
    return {
        input: src_dir + `/${name}.ts`,
        output: [
            {
                file: dist_dir + `/${name}.js`,
                name: `__${name}`,
                format: 'iife',
                strict: false,
                footer: footer,
            },
        ],
        plugins: [
            commonjs(), json(), resolve(), typescript(), nodePolyfills(),
            copyPlugin(`${dist_dir}/${name}.js`, `${TARGET_DIR}/${name}.js`),
        ],
    }
}

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
var fetch = (...args) => {
    return MusicPlayer.runtime.fetch(...args)
}
`
            },
        ],
        plugins: [
            alias({
                entries: [
                    { find: '@MpApi', replacement: path.resolve('./src/MpApi') },
                    { find: '@runtime', replacement: path.resolve('./src/MpApi/runtime') },
                ],
            }),
            commonjs(), json(), resolve(), typescript(), nodePolyfills(),
            copyPlugin(`${dist_dir}/${filename}.js`, `${TARGET_DIR}/${filename}.js`),
            copyPlugin(`${dist_dir}/${filename}.js.map`, `${TARGET_DIR}/${filename}.js.map`),
        ],
    },
    simpleTarget('Streams', `
// const ReadableStream = __Streams
// const ReadableStream = __Streams.ReadableStream
// const ReadableStreamReader = __Streams.ReadableStreamReader
// const WritableStream = __Streams.WritableStream

// if (typeof globalThis === 'undefined' ) {
// } else {
//     var globalThis = {}
// }
globalThis.ReadableStream = __Streams.ReadableStream
// globalThis.ReadableStreamReader = __Streams.ReadableStreamReader
// globalThis.WritableStream = __Streams.WritableStream
`),
    simpleTarget('AbortController', `
const AbortSignal = __AbortController.AbortController
const AbortController = __AbortController.AbortSignal
`),
    simpleTarget('URL', exportFooter('URL') + '\n' + `
const URLSearchParams = __URL.URLSearchParams
`),
    simpleTarget('Headers', globalThisFooter('Headers')),
    simpleTarget('Request', globalThisFooter('Request')),
    simpleTarget('TextEncoderDecoder', `
const TextEncoder = __TextEncoderDecoder.TextEncoder
const TextDecoder = __TextEncoderDecoder.TextDecoder
if (typeof globalThis !== 'undefined' ) {
    globalThis.TextEncoder = __TextEncoderDecoder.TextEncoder
    globalThis.TextDecoder = __TextEncoderDecoder.TextDecoder
} else {
    var globalThis = {
        TextEncoder: __TextEncoderDecoder.TextEncoder,
        TextDecoder: __TextEncoderDecoder.TextDecoder,
    }
}

const btoa = (data) => {
    return sendMessage('btoa', JSON.stringify(data));
}
const atob = (data) => {
    return sendMessage('atob', JSON.stringify(data));
}

class Intl {
    static DateTimeFormat() {
        return {
            resolvedOptions() {
                var timeZone = 'Europe/Moscow'
                return {
                    timeZone
                }
            }
        }
    }
}

`
    ),
];

