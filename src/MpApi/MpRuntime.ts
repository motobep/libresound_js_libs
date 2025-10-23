import { resolveSourceMap } from './resolveSourceMap'
import { Logger } from "./Logger"

export type SendMessageType = (a: string, b: string) => any

declare const sendMessage: SendMessageType

export class MpRuntimeClass {
    downloads: {
        add(id: string, title: string): void
        update(id: string, title: string): void
        has(id: string): void
        remove(id: string): void
        free(id: string): void
    }
    constructor() {
        this.logger.log('MpRuntimeClass constructor()')
        this.downloads = {
            add(id: string, title: string) {
                sendMessage('downloads__add', JSON.stringify({ id: id, title: title }));
            },
            update(id: string, title: string) {
                sendMessage('downloads__update', JSON.stringify({ id: id, title: title }));
            },
            has(id: string) {
                return sendMessage('downloads__has', JSON.stringify({ id: id }));
            },
            remove(id: string) {
                return sendMessage('downloads__remove', JSON.stringify({ id: id }));
            },
            free(id: string) {
                return sendMessage('downloads__free', JSON.stringify({ id: id }));
            },
        }
    }
    async fetch(url: string, options = {}) {
        // MP.log('MP.fetch options:', options)
        let resp = await sendMessage('MP_fetch', JSON.stringify({ 'url': url, 'options': options }));
        return this._makeResp(resp);
    }

    _makeResp(resp: any) {
        var getBytes = resp['getBytes']

        var headers = resp['headers']
        let response = {
            status: resp['status'],
            ok: resp['ok'],
            bytes: async function() {
                return await getBytes();
            },
            text: async function() {
                var bytes = await getBytes()
                return await MP_unit8ListToString(bytes);
            },
            json: async function() {
                let txt = await this.text()
                return JSON.parse(txt);
            },
            cookies: resp['cookies'],
            location: resp['location'],
            // headers: resp['headers'],
            headers: {
                // keys: () => keys,
                // entries: () => all,
                get: (n: string) => headers[n.toLowerCase()],
                has: (n: string) => n.toLowerCase() in headers
            },
        };
        return response;
    }

    onDataReceived(recieved: number, contentLength: number) {
        console.log((recieved / contentLength * 100).toFixed(2) + ' %');
    }

    async download(url: string, options: any) {
        const props = options['downloadProps']
        if (props === null || props === undefined) {
            throw `Wrong parameter options.downloadProps: '` + props + `'`
        }
        const id = props['id']
        if (typeof id !== 'string') {
            throw `Wrong properties in options.downloadProps.id: '` + id + `'`
        }
        if (props.onDataReceived != null) {
            this.onDataReceived = props.onDataReceived
        }
        let resp = await sendMessage('MP_download', JSON.stringify({ url: url, options: options, props: props }));
        return this._makeResp(resp)
    }
    set_proxy_environment(env: any) {
        sendMessage('set_proxy_environment', JSON.stringify({ proxy_environment: env }));
    }
    async load_and_add_picture(path: string) {
        await sendMessage('MP_load_and_add_picture', JSON.stringify({ 'path': path }));
    }
    fs = new Fs()
    logger = new Logger('📘 MpRuntime:')

    resolveSourceMap = resolveSourceMap

    modifyTraces(str: string,
        getASource: (s: string) => any, getBSource: (s: string) => any,
        aName: string, bName: string) {
        var arr = str.split('\n')
        var traces = []
        for (var s of arr) {
            var new_str = s
            var o = this._getTrace(s)
            if (o !== null) {
                let variants = []

                let a = getASource(o.line)
                if (a) {
                    variants.push(`${aName}:'${a.source}':${a.line}`)
                }
                let b = getBSource(o.line)
                if (b) {
                    variants.push(`${bName}:'${b.source}':${b.line}`)
                }
                if (variants.length > 0) {
                    new_str += ` [${variants.join(' or ')}]`
                }
            }
            traces.push(new_str)
        }
        return traces
    }

    _getTrace(s: string) {
        const regex = /at .*\((<.*>):(\d+):(\d+)\)/;
        const match = s.match(regex);
        if (match && match.length === 4) {
            return {
                line: match[2],
                col: match[3],
                source: match[1],
            }
        }
        return null
    }
};

class Fs {
    async readFile(path: string,
        options: { encoding: string, flag: string } | string = ''): Promise<string> {
        return await sendMessage('MpRuntime.fs.readFile',
            JSON.stringify({ 'path': path, 'options': options }));
    }

    async mpReadAsset(path: string): Promise<string> {
        return await sendMessage('MpRuntime.fs.mpReadAsset',
            JSON.stringify({ 'path': path }));
    }
}

async function MP_unit8ListToString(list: number[]): Promise<string> {
    // console.log('unit8ListToString')
    return await sendMessage('MP_unit8ListToString', JSON.stringify(list));
}
