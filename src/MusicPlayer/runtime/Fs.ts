import { SendMessageType } from '@runtime/Runtime'
export declare const __dartjs_sendMessage: SendMessageType

function fsSend(a: string, b: any = null) {
    return __dartjs_sendMessage(`MP.runtime.fs.${a}`, JSON.stringify(b));
}
function PS(a: string, b: any = null) {
    return __dartjs_sendMessage(`PS.${a}`, JSON.stringify(b));
}

export class Fs {
    async readFile(path: string,
        options: { encoding: string, flag: string } | string = ''): Promise<string> {
        return await fsSend('readFile', { 'path': path, 'options': options })
    }

    existsSync(path: string): boolean {
        return fsSend('existsSync', { 'path': path })
    }

    readFileSync(path: string,
        options: { encoding: string, flag: string } | string = ''): string {
        return fsSend('readFileSync', { 'path': path, 'options': options })
    }

    async readAssetAsync(path: string): Promise<string> {
        return await PS('readAssetAsync', { 'path': path })
    }
}
