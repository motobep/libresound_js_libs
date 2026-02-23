import { Fs } from "@runtime/Fs";
import { Logger } from "@runtime/Logger"
import { Mapper } from "@runtime/internal/Mapper";

export type SendMessageType = (a: string, b: string) => any
export declare const sendMessage: SendMessageType


export class SessionStorage {
    map = {}
    get(name: string): any {
        return this.map[name]
    }
    set(name: string, value: any) {
        this.map[name] = value
    }
}

function responseToRequestCookies(responseCookies: string[]) {
    return responseCookies.map(header => {
        const parts = header.split(';');
        return parts[0];
    });
}

/**
 * A class that not only implments (imitates) parts of browser/nodejs API
 */
export class Runtime {
    fs = new Fs()
    // bytesFetcher = new BytesFetcher()
    sessionStorage = new SessionStorage()

    async fetch(url: string | URL, options = {}) {
        this.logger.log('fetch url:', url)
        let isRequest = url instanceof Request
        if (isRequest) {
            // skip
        } else {
            url = '' + url
        }

        this._addRequestCookies(options)

        let resp = await MP('fetch', { 'url': url, 'options': options })

        this._saveResponseCookies(resp.cookies)

        return _makeResp(resp);
    }

    _addRequestCookies(options: object) {
        let cookieHeaderStr = this._getCookieHeaderStr()
        if (!options['headers']) {
            options['headers'] = { cookie: cookieHeaderStr }
        } else {
            options['headers'].cookie += '; ' + cookieHeaderStr
        }
    }

    _getCookieHeaderStr(): string {
        let getCookie = this.sessionStorage.get('response-cookies')
        if (!getCookie) return ''
        return responseToRequestCookies(getCookie).join('; ')
    }

    _saveResponseCookies(setCookie: string[]) {
        if (setCookie) {
            let cookies = setCookie
            let getCookie = this.sessionStorage.get('response-cookies')
            if (getCookie) {
                cookies = [...getCookie, ...setCookie]
            }
            this.sessionStorage.set('response-cookies', cookies)
        }
    }


    async download(url: string, options: any) {
        throw new Error(`deprecated`)
    }

    onDataReceived(recieved: number, contentLength: number) {
        console.log((recieved / contentLength * 100).toFixed(2) + ' %');
    }

    setProxy(env: { http_proxy: string, https_proxy: string } | null) {
        MP('setProxyConfig', env)
    }

    logger = new Logger('[JS Runtime]:')

    _mapper = new Mapper()
};

async function MP_unit8ListToString(list: number[]): Promise<string> {
    // console.log('unit8ListToString')
    return await MP('uint8ListToString', list);
}


export class BytesFetcher {
    id: number
    constructor(id: number) {
        this.id = id
    }
    static new(onBytesRecived = null) {
        let id = MP('BytesFetcher.new', {});
        return new BytesFetcher(id)
    }
    async fetch(url: string | URL, options = {}) {
        return _makeResp(await MP('BytesFetcher.fetch', { id: this.id, url, options }));
    }
    abort() {
        MP('BytesFetcher.abort', { id: this.id });
    }
    delete() {
        MP('BytesFetcher.delete', { id: this.id });
    }
    static async run(fn: (bf: BytesFetcher) => Promise<any>): Promise<any> {
        let bf = BytesFetcher.new()
        let ret = []
        try {
            console.log(`calling fn`)
            ret = await fn(bf)
            if (!ret || ret.length === 0) {
                console.log(`bad ret:`, ret)
            }
        } catch (e) {
            console.log('Error in BytesFetcher.run(): ' + e)
            console.log('calling abort and delete')
            bf.abort()
            bf.delete()
            throw e
        }
        console.log('calling abort and delete')
        bf.abort()
        bf.delete()
        return ret
    }
    // logger = new Logger('[JS BytesFetcher]:')
}

export function MP(a: string, b: any = null) {
    // console.log(`${a}(${b})`)
    return sendMessage(`MP.${a}`, JSON.stringify(b));
}

function _makeResp(resp: any) {
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
    // this.logger.log('response', response)
    return response;
}
