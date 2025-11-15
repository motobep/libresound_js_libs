import { sendMessage } from "./Runtime";

/**
 * App's Downloader
 */
export class Downloader {
    add(id: string, title: string) {
        sendMessage('downloads__add', JSON.stringify({ id: id, title: title }));
    }
    update(id: string, title: string) {
        sendMessage('downloads__update', JSON.stringify({ id: id, title: title }));
    }
    has(id: string) {
        return sendMessage('downloads__has', JSON.stringify({ id: id }));
    }
    remove(id: string) {
        return sendMessage('downloads__remove', JSON.stringify({ id: id }));
    }
    free(id: string) {
        return sendMessage('downloads__free', JSON.stringify({ id: id }));
    }
}

export const downloader = new Downloader()
