import { MpRuntimeClass, SendMessageType } from '../MpRuntime/script'
import { BuiltinActions, DownloaderType, IconName, KeyValue, ListType, NavType } from './enums'

declare const MpRuntime: MpRuntimeClass
declare const sendMessage: SendMessageType


export interface MpPlugin {
    afterInitAsync(): Promise<void>
    reloadAsync(): Promise<void>

    chooseSourceAsync(): Promise<void>

    getSuggestionsAsync(text: string): Promise<string[]>
    searchAsync(text: string): Promise<void>

    chooseTabAsync(index: number): Promise<void>
    chooseSearchTabAsync(index: number): Promise<void>

    chooseGroupAsync(group: GroupItem): Promise<void>
    getGroupContentAsync(group: GroupItem): Promise<MusicItem[]> // to add in queue

    toArtistAsync(mi: MusicItem): Promise<void>

    back(): boolean
    canBack(): boolean

    fetchBytesAsync(mi: MusicItem, downloadId: string): Promise<number[]>
    fetchUrlAsync(mi: MusicItem, downloadId: string): Promise<String>

    onSourceSettingsClick(): void
}

export interface OptionalEventHandlers {
    onPlaybackControlsOpen(obj: any): void
    onOpenedPlaybackPlayPrev(obj: any): void
    onOpenedPlaybackPlayNext(obj: any): void
    onBeforeFetch(obj: any): void
}


export interface DialogDescr {
    builtin: BuiltinActions[]
    customItemActions: CustomAction[]
}

export type Item = {
    id: string;
    title: string;
    thumbnailUrl: string;
    itemDialogDescr: DialogDescr
}

export interface MusicItem extends Item {
    id: string;
    title: string;
    thumbnailUrl: string;
    itemDialogDescr: DialogDescr

    artist: {
        id: string;
        title: string;
    };
    album: {
        id: string;
        title: string;
    };
    duration: number; // int

    downloaderType: DownloaderType;
    extension: string;
    // Add props?
}

export interface GroupItem extends Item {
    id: string;
    title: string;
    thumbnailUrl: string;
    itemDialogDescr: DialogDescr

    subtitle?: string;
    props?: KeyValue
}

export interface SectionDescrJs {
    header?: SectionHeaderDescr

    listType: ListType
    itemlist: Item[]
    isBigTile?: boolean
    rowsCount: number

    props?: KeyValue
}

export interface SectionHeaderDescr {
    title?: string
    subtitle?: string
    customAction?: CustomAction
}

// TODO: Change it
export interface PageDescrJs {
    title?: string
    sectionlist: SectionDescrJs[]
    header?: PageHeaderDescr
    actionButtonDescr?: CustomAction
    props?: KeyValue
}

interface PageHeaderDescr {
    title: string
    subtitle?: string
    thumbnailUrl?: string
    itemDialogDescr?: DialogDescr
}


export interface CustomAction {
    text: string
    icon?: IconName
    callbackName: string
    callbackArgs: string[]
}

export interface DownloadProps {
    id: string,
    onDataReceived: (recieved: number, contentLength: number) => void

}

export class MusicPlayerClass {
    source = new Source()
    currPageStack = new CurrPageStack()
    currPage = new CurrPage()
    playback = new Playback()
    queue = new Queue()
    properyStorage = new ProperyStorage()
    errorManager = new ErrorManager()
    helpers = new WebHelpers()
    logger = new Logger()

    constructor() {
        MpRuntime.log('Web loaded')
    }

    getLanguage(): string {
        return sendMessage('Web.getLanguage', JSON.stringify({}));
    }

    updateAppState() {
        sendMessage('Web.updateAppState', JSON.stringify({}));
    }

    fetch = (...args: any) => {
        // @ts-ignore
        return MpRuntime.fetch(...args)
    }

    download = (...args: any) => {
        // @ts-ignore
        return MpRuntime.download(...args)
    }
}

class Source {
    initPageStacks(map: {
        [name: string]: PageDescrJs[]
    }): void {
        sendMessage('Web.initPageStacks', JSON.stringify(map));
    }

    get currPageStackName(): string {
        return sendMessage('Web.currPageStackName-get', JSON.stringify({}));
    }
    set currPageStackName(name: string) {
        sendMessage('Web.currPageStackName-set', JSON.stringify(name));
    }

    get currTabIdx(): number {
        return sendMessage('Web.currTabIdx-get', JSON.stringify({}));
    }
    set currTabIdx(index: number) {
        assertType(index, 'number')
        sendMessage('Web.currTabIdx-set', JSON.stringify(index));
    }
    getTabs(): string[][] {
        return sendMessage('Web.getTabs', JSON.stringify({}));
    }
    setTabs(arr: string[][]): void {
        if (arr.length > 0) {
            assertType(arr[0], 'object')
            assertType(arr[0][0], 'string')
            // assertType(arr[0][1], 'string')
        }
        sendMessage('Web.setTabs', JSON.stringify(arr));
    }

    get currSearchTabIdx(): number {
        return sendMessage('Web.currSearchTabIdx-get', JSON.stringify({}));
    }
    set currSearchTabIdx(index: number) {
        assertType(index, 'number')
        sendMessage('Web.currSearchTabIdx-set', JSON.stringify(index));
    }
    getSearchTabs(): string[] {
        return sendMessage('Web.getSearchTabs', JSON.stringify({}));
    }
    setSearchTabs(arr: string[]): void {
        sendMessage('Web.setSearchTabs', JSON.stringify(arr));
    }

    get navType() {
        return sendMessage('Web.navType-get', JSON.stringify({}));
    }
    set navType(navType: NavType) {
        sendMessage('Web.navType-set', JSON.stringify(navType));
    }

    get isShowSearch() {
        return sendMessage('Web.isShowSearch-get', JSON.stringify({}));
    }
    set isShowSearch(isShow: boolean) {
        sendMessage('Web.isShowSearch-set', JSON.stringify(isShow));
    }

    get rightControls() {
        return sendMessage('Web.rightControls-set', JSON.stringify({}));
    }
    set rightControls(controls: string[]) {
        sendMessage('Web.rightControls-set', JSON.stringify(controls));
    }

    openPluginSettingsPage(): void {
        sendMessage('Web.openPluginSettingsPage', JSON.stringify({}));
    }

    async updateThumbnailFromUrlAsync(id: string, url: string): Promise<boolean> {
        return await sendMessage('Web.updateThumbnailFromUrlAsync',
            JSON.stringify({ id: id, url: url }));
    }
}

class CurrPageStack {
    setLast(pageDescr: PageDescrJs) {
        sendMessage('Web.currPageStack.setLast', JSON.stringify(pageDescr));
    }
    get length(): number {
        return sendMessage('Web.currPageStack.length-get', JSON.stringify({}));
    }
    get last(): PageDescrJs {
        return sendMessage('Web.currPageStack.last-get', JSON.stringify({}));
    }
    push(pageDescr: PageDescrJs) {
        sendMessage('Web.currPageStack.push', JSON.stringify(pageDescr));
    }
    pop(): boolean {
        return sendMessage('Web.currPageStack.pop', JSON.stringify({}));
    }
}

export class CurrPage {
    get title() {
        return sendMessage('Web.currPage.title-get', JSON.stringify({}));
    }

    set title(str: string) {
        sendMessage('Web.currPage.title.set', JSON.stringify(str));
    }

    get sectionlist(): SectionDescrJs[] {
        return sendMessage('Web.currPage.sectionlist-get', JSON.stringify({}))
    }

    set sectionlist(val: SectionDescrJs[]) {
        sendMessage('Web.currPage.sectionlist-set', JSON.stringify(val))
    }

    get header(): PageHeaderDescr {
        return sendMessage('Web.currPage.header-get', JSON.stringify({}))
    }

    set header(val: PageHeaderDescr) {
        sendMessage('Web.currPage.header-set', JSON.stringify(val))
    }

    get actionButtonDescr(): CustomAction {
        return sendMessage('Web.currPage.actionButtonDescr-get', JSON.stringify({}))
    }

    set actionButtonDescr(val: CustomAction) {
        sendMessage('Web.currPage.actionButtonDescr-set', JSON.stringify(val))
    }

    get props() {
        return sendMessage('Web.currPage.props-get', JSON.stringify({}));
    }

    set props(props: KeyValue) {
        sendMessage('Web.currPage.props-set', JSON.stringify(props));
    }
}


export class Playback {
    playByIdx(index: number): void {
        sendMessage('Web.playback.playByIdx', JSON.stringify(index));
    }
}

export class Queue {
    insertAll(index: number, list: MusicItem[]): void {
        console.log('queue', index, list)
        sendMessage('Web.queue.insertAll', JSON.stringify({ index: index, list: list }));
    }
    addAll(list: MusicItem[]): void {
        sendMessage('Web.queue.addAll', JSON.stringify(list));
    }
    removeRange(start: number, end: number): void {
        sendMessage('Web.queue.removeRange', JSON.stringify({ start: start, end: end }));
    }
    getTrack(trackIndex: number): MusicItem {
        return sendMessage('Web.queue.getTrack', JSON.stringify(trackIndex));
    }
    get currTrackIdx(): number {
        return sendMessage('Web.queue.currTrackIdx-get', JSON.stringify({}));
    }
    set currTrackIdx(index: number) {
        sendMessage('Web.queue.currTrackIdx-set', JSON.stringify(index));
    }
    get length(): number {
        return sendMessage('Web.queue.length-get', JSON.stringify({}));
    }
}

class WebHelpers {
    makeTracklist(itemlist: Item[]) {
        return {
            listType: 'tracklist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    makeGrouplist(itemlist: Item[]) {
        return {
            listType: 'grouplist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    defaultDownloadProps(downloadId: string, name: string): DownloadProps {
        return {
            id: downloadId,
            onDataReceived: (recieved: number, contentLength: number) => {
                MpRuntime.downloads.update(downloadId,
                    `[${(recieved / contentLength * 100).toFixed(2)} %.]. Downloading "${name}"`
                );
            }
        }
    }
}

export class ProperyStorage {
    get(name: string) {
        return sendMessage('Web.properyStorage.get', JSON.stringify(name));
    }
    set(name: string, value: any) {
        sendMessage('Web.properyStorage.set', JSON.stringify({ 'name': name, 'value': value }));
    }
    setList(list: string[]) {
        sendMessage('Web.properyStorage.setList', JSON.stringify(list));
    }
}

export class ErrorManager {
    get(): string {
        return sendMessage('Web.errorManager.get', JSON.stringify({}));
    }
    set(err: string) {
        sendMessage('Web.errorManager.set', JSON.stringify(err));
    }
}

export class Logger {
    log(...args: any) {
        console.log('🔌\x1B[35m', ...args, '\x1B[0m')
    }
    info(...args: any) {
        console.log('🔌\x1B[34m', ...args, '\x1B[0m')
    }
    warn(...args: any) {
        console.log('🔌\x1B[33m', ...args, '\x1B[0m')
    }
    error(...args: any) {
        console.log('🔌\x1B[31m', ...args, '\x1B[0m')
    }
}

function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function assertType(val: any, type: string) {
    assert(typeof val === type, `Assert type "${type}". Got "${typeof val}"`)
}

export const MusicPlayer = new MusicPlayerClass()
