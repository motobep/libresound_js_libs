import { SendMessageType } from '@runtime/Runtime'
export declare const sendMessage: SendMessageType

export class Fs {
    async readFile(path: string,
        options: { encoding: string, flag: string } | string = ''): Promise<string> {
        return await sendMessage('MP.runtime.fs.readFile',
            JSON.stringify({ 'path': path, 'options': options }));
    }

    existsSync(path: string): boolean {
        return sendMessage('MP.runtime.fs.existsSync',
            JSON.stringify({ 'path': path }));
    }

    readFileSync(path: string,
        options: { encoding: string, flag: string } | string = ''): string {
        return sendMessage('MP.runtime.fs.readFileSync',
            JSON.stringify({ 'path': path, 'options': options }));
    }

    async readAssetAsync(path: string): Promise<string> {
        return await sendMessage('PS.readAssetAsync',
            JSON.stringify({ 'path': path }));
    }
}
