import { Fs } from "@MpApi/Fs";
import { Logger } from "@MpApi/Logger"
import { Mapper } from "@MpApi/internal/Mapper";

export type SendMessageType = (a: string, b: string) => any
export declare const sendMessage: SendMessageType


/**
 * A class that not only implments (imitates) parts of browser/nodejs API
 */
export class Runtime {
    fs = new Fs()

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

    onDataReceived(recieved: number, contentLength: number) {
        console.log((recieved / contentLength * 100).toFixed(2) + ' %');
    }

    setProxyEnvironment(env: any) {
        sendMessage('setProxyEnvironment', JSON.stringify({ proxy_environment: env }));
    }

    logger = new Logger('📘 Runtime:')

    _mapper = new Mapper()
};

async function MP_unit8ListToString(list: number[]): Promise<string> {
    // console.log('unit8ListToString')
    return await sendMessage('MP_unit8ListToString', JSON.stringify(list));
}

