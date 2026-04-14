import { Fs } from "@runtime/Fs";
import { Logger } from "@runtime/Logger"
import { Mapper } from "@runtime/internal/Mapper";

export type SendMessageType = (a: string, b: string) => any
export declare const __dartjs_sendMessage: SendMessageType


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

let byteStreamController: ReadableStreamController<string> | undefined

/**
 * A class that not only implments (imitates) parts of browser/nodejs API
 */
export class Runtime {
    fs = new Fs()
    // bytesFetcher = new BytesFetcher()
    sessionStorage = new SessionStorage()
    byteStreamController = byteStreamController

    async fetch(url: string | URL, options = {}) {
        this.logger.log('fetch url:', url)
        let isRequest = url instanceof Request
        if (isRequest) {
            // skip
        } else {
            url = '' + url
        }

        this._addRequestCookies(options)
        this.logger.blue('headers.length', options.headers?.length)
        this.logger.blue('cookie.length', options.headers?.cookie?.length)

        let resp = await MP('fetch', { 'url': url, 'options': options })

        this._saveResponseCookies(resp.cookies)

        return _makeResp(resp, options['signal']);
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

    // byteStreamControllerEnqueue(val: any): void {
    //     byteStreamController.enqueue(val)
    // }
    // byteStreamControllerClose(): void {
    //     byteStreamController.close()
    // }

    onDataReceived(recieved: number, contentLength: number) {
        console.log((recieved / contentLength * 100).toFixed(2) + ' %');
    }

    setProxy(env: { http_proxy: string, https_proxy: string } | null) {
        console.log('setProxyConfig', env)
        MP('setProxyConfig', env)
    }

    isTls1_3_get(): boolean {
        return MP('isTls1_3_get')
    }
    isTls1_3_set(isTls1_3: boolean) {
        console.log('isTls1_3', isTls1_3)
        MP('isTls1_3_set', isTls1_3)
    }

    logger = new Logger('MusicPlayer/runtime.ts: ')

    _mapper = new Mapper()

    async addMappingsToErrorAsync(e: any, code: string) {
        // this.logger.blue('addMappingsToErrorAsync', e);
        this.logger.blue('addMappingsToErrorAsync');
        if (typeof e === 'string') {
            this.logger.error('String error:', e);
            return e
        }
        try {
            // this.logger.blue('mapStacktraceAsync', e, e.message, e.stack);
            this.logger.blue('mapStacktraceAsync before');
            let stack = await this._mapper.mapStacktraceAsync(e.stack)
            this.logger.blue('after mapStacktraceAsync');
            let msg = 'Error in plugin lib code (runCodeInAsyncFunc): ' + e.message;
            let s = 'Stacktrace:\n' + stack + 'Code:\n' + `${code}`
            /*
            this.logger.error('Error in plugin lib code (runCodeInAsyncFunc):', e.message +
              '\nStacktrace:\n' + stack,
              'Code:\n' + `${code}`);
            */
            e.message = msg
            e.stack = s
        } catch (mappingErr) {
            this.logger.warn('Mapping Error (runCodeInAsyncFunc)', mappingErr.message);
            this.logger.error('Error in plugin code:', e.message +
                '\nStacktrace:\n' + e.stack);
            return e
        }
        return e
    }
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
        return _makeResp(await MP('BytesFetcher.fetch',
            { id: this.id, url, options }),
            options['signal']);
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
            throw e
        } finally {
            console.log('calling abort and delete')
            bf.abort()
            bf.delete()
        }
        return ret
    }
    // logger = new Logger('[JS BytesFetcher]:')
}

export function MP(a: string, b: any = null) {
    // console.log(`${a}(${b})`)
    return __dartjs_sendMessage(`MP.${a}`, JSON.stringify(b));
}
function _makeResp(resp: any, signal: AbortSignal = undefined) {
    var getBytes = resp['getBytes']
    var getChunk = resp['getChunk']

    var headers = resp['headers']

    const body = new __Streams.ReadableStream({
        type: 'bytes', // NOTICE: removes first auto pull
        start(c: any) { byteStreamController = c; },
        cancel(reason: any) { console.log('stream canceled', reason); },
        async pull(controller: any) {
            // console.log(`Calling pull`)
            console.log(`getChunk`)
            const chunk = await getChunk()
            if (!chunk) {
                console.log(`falsy chunk=${chunk}`)
            }
            if (chunk == null) {
                console.log(`Runtime, chunk=${chunk}`)
                controller.close();
            } else {
                console.log(`Runtime, chunk (${chunk.byteLength}): ${chunk}`)
                controller.enqueue(chunk);
            }
        },
    });

    var abort = resp['abort']
    // console.log(`signal=${signal}`)
    if (signal) {
        signal._onabort = abort
    }

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
        body: body,
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
