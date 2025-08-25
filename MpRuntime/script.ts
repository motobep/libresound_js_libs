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
        this.log('MpRuntimeClass constructor()')
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
    log(...args: any) {
        console.log('📘 MP:', ...args)
    }
    error(...args: any) {
        console.log('📘 \x1B[31mMP:', ...args, '\x1B[0m')
    }
};

async function MP_unit8ListToString(list: number[]): Promise<string> {
    // console.log('unit8ListToString')
    return await sendMessage('MP_unit8ListToString', JSON.stringify(list));
}

const MpRuntime = new MpRuntimeClass()
