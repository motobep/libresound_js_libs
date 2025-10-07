import { Logger } from './Logger'
import { MpRuntimeClass, SendMessageType } from './MpRuntime'
import { DownloaderType, IconName, KeyValue, ListType, NavType } from './enums'

declare const sendMessage: SendMessageType

export const MpRuntime = new MpRuntimeClass()

export interface MpPlugin {
    afterInitAsync(): Promise<void>
    reloadAsync(): Promise<void>

    chooseSourceAsync(): Promise<void>

    getSuggestionsAsync(text: string): Promise<string[]>
    searchAsync(text: string): Promise<void>

    chooseTabAsync(index: number): Promise<void>
    chooseSearchTabAsync(index: number): Promise<void>

    chooseGroupAsync(group: GroupItem): Promise<void>

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

export interface ItemAction {
    text: string
    icon?: IconName
    callback: () => void
}

export type Item = {
    id: string;
    title: string;
    subtitle: string;
    thumbnailUrl: string;
}

export interface MusicItem extends Item {
    id: string;
    title: string;
    subtitle: string;
    thumbnailUrl: string;

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
    subtitle: string;
    thumbnailUrl: string;

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
    actionBtn?: ActionBtnDescr
}

// TODO: Change it
export interface PageDescrJs {
    title?: string
    sectionlist: SectionDescrJs[]
    header?: PageHeaderDescr
    actionBtn?: ActionBtnDescr
    props?: KeyValue
}

interface PageHeaderDescr {
    title: string
    subtitle?: string
    thumbnailUrl?: string
    actionBtn?: ActionBtnDescr
}


export interface ActionBtnDescr {
    text: string
    icon?: IconName
    callbackName: string
    callbackArgs: string[]
}

export interface DownloadProps {
    id: string,
    onDataReceived: (recieved: number, contentLength: number) => void

}

class FuncsManager {
    pools = {}

    makePool(name: string): FuncsPool {
        try {
            if (name in this.pools) {
                throw new Error(`Pool "${name}" already exists`);
            }
            this.pools[name] = new FuncsPool()
            return this.getPool(name)
        } catch (e) {
            this.logger.error('Error in makePool():', e.message)
        }
    }

    getPool(name: string): FuncsPool {
        return this.pools[name]
    }

    deletePool(name: string): void {
        delete this.pools[name]
    }

    logger = new Logger('📘 FuncsManager:')
}

class FuncsPool {
    funcsMap = {}
    counter = 0

    get(name: string): () => void {
        return this.funcsMap[name]
    }

    add(func: () => void): string {
        let name = 'f_' + ++this.counter
        this.funcsMap[name] = func
        return name
    }
}

export class MusicPlayerClass {
    source = new Source()
    currPageStack = new CurrPageStack()
    currPage = new CurrPage()
    playback = new Playback()
    queue = new Queue()
    propertyStorage = new PropertyStorage()
    errorManager = new ErrorManager()
    helpers = new Helpers()
    logger = new Logger('🔌')
    _funcsManager = new FuncsManager()

    constructor() {
        this.logger.log('MusicPlayerClass loaded')
    }

    getLanguage(): string {
        return sendMessage('PS.getLanguage', JSON.stringify({}));
    }

    downloadMusicItemAsync(mi: MusicItem): Promise<void> {
        return sendMessage('PS.downloadMusicItemAsync', JSON.stringify(mi));
    }

    toThisSourceAsync(): Promise<void> {
        return sendMessage('PS.toThisSourceAsync', JSON.stringify({}));
    }

    closeActions(): void {
        sendMessage('PS.closeActions', JSON.stringify({}));
    }

    showActionsDialog(actions: ItemAction[], tapPos: number[] | null = null): void {
        this._actions = actions
        sendMessage('PS.showActionsDialog', JSON.stringify({ tapPos }));
    }

    _actions: any

    updateAppState() {
        sendMessage('PS.updateAppState', JSON.stringify({}));
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
        sendMessage('PS.initPageStacks', JSON.stringify(map));
    }

    get currPageStackName(): string {
        return sendMessage('PS.currPageStackName-get', JSON.stringify({}));
    }
    set currPageStackName(name: string) {
        sendMessage('PS.currPageStackName-set', JSON.stringify(name));
    }

    get currTabIdx(): number {
        return sendMessage('PS.currTabIdx-get', JSON.stringify({}));
    }
    set currTabIdx(index: number) {
        assertType(index, 'number')
        sendMessage('PS.currTabIdx-set', JSON.stringify(index));
    }
    getTabs(): string[][] {
        return sendMessage('PS.getTabs', JSON.stringify({}));
    }
    setTabs(arr: string[][]): void {
        if (arr.length > 0) {
            assertType(arr[0], 'object')
            assertType(arr[0][0], 'string')
            // assertType(arr[0][1], 'string')
        }
        sendMessage('PS.setTabs', JSON.stringify(arr));
    }

    get currSearchTabIdx(): number {
        return sendMessage('PS.currSearchTabIdx-get', JSON.stringify({}));
    }
    set currSearchTabIdx(index: number) {
        assertType(index, 'number')
        sendMessage('PS.currSearchTabIdx-set', JSON.stringify(index));
    }
    getSearchTabs(): string[] {
        return sendMessage('PS.getSearchTabs', JSON.stringify({}));
    }
    setSearchTabs(arr: string[]): void {
        sendMessage('PS.setSearchTabs', JSON.stringify(arr));
    }

    get navType() {
        return sendMessage('PS.navType-get', JSON.stringify({}));
    }
    set navType(navType: NavType) {
        sendMessage('PS.navType-set', JSON.stringify(navType));
    }

    get isShowSearch() {
        return sendMessage('PS.isShowSearch-get', JSON.stringify({}));
    }
    set isShowSearch(isShow: boolean) {
        sendMessage('PS.isShowSearch-set', JSON.stringify(isShow));
    }

    get rightControls() {
        return sendMessage('PS.rightControls-set', JSON.stringify({}));
    }
    set rightControls(controls: string[]) {
        sendMessage('PS.rightControls-set', JSON.stringify(controls));
    }

    openPluginSettingsPage(): void {
        sendMessage('PS.openPluginSettingsPage', JSON.stringify({}));
    }

    async updateThumbnailFromUrlAsync(id: string, url: string): Promise<boolean> {
        return await sendMessage('PS.updateThumbnailFromUrlAsync',
            JSON.stringify({ id: id, url: url }));
    }
}

class CurrPageStack {
    setLast(pageDescr: PageDescrJs) {
        sendMessage('PS.currPageStack.setLast', JSON.stringify(pageDescr));
    }
    get length(): number {
        return sendMessage('PS.currPageStack.length-get', JSON.stringify({}));
    }
    get last(): PageDescrJs {
        return sendMessage('PS.currPageStack.last-get', JSON.stringify({}));
    }
    push(pageDescr: PageDescrJs) {
        sendMessage('PS.currPageStack.push', JSON.stringify(pageDescr));
    }
    pop(): boolean {
        return sendMessage('PS.currPageStack.pop', JSON.stringify({}));
    }
}

export class CurrPage {
    get title() {
        return sendMessage('PS.currPage.title-get', JSON.stringify({}));
    }

    set title(str: string) {
        sendMessage('PS.currPage.title.set', JSON.stringify(str));
    }

    get sectionlist(): SectionDescrJs[] {
        return sendMessage('PS.currPage.sectionlist-get', JSON.stringify({}))
    }

    set sectionlist(val: SectionDescrJs[]) {
        sendMessage('PS.currPage.sectionlist-set', JSON.stringify(val))
    }

    get header(): PageHeaderDescr {
        return sendMessage('PS.currPage.header-get', JSON.stringify({}))
    }

    set header(val: PageHeaderDescr) {
        sendMessage('PS.currPage.header-set', JSON.stringify(val))
    }

    get actionBtn(): ActionBtnDescr {
        return sendMessage('PS.currPage.actionBtn-get', JSON.stringify({}))
    }

    set actionBtn(val: ActionBtnDescr) {
        sendMessage('PS.currPage.actionBtn-set', JSON.stringify(val))
    }

    get props() {
        return sendMessage('PS.currPage.props-get', JSON.stringify({}));
    }

    set props(props: KeyValue) {
        sendMessage('PS.currPage.props-set', JSON.stringify(props));
    }
}


export class Playback {
    playByIdx(index: number): void {
        sendMessage('PS.playback.playByIdx', JSON.stringify(index));
    }
}

export class Queue {
    insertAll(index: number, list: MusicItem[]): void {
        console.log('queue', index, list)
        sendMessage('PS.queue.insertAll', JSON.stringify({ index: index, list: list }));
    }
    addAll(list: MusicItem[]): void {
        sendMessage('PS.queue.addAll', JSON.stringify(list));
    }
    removeRange(start: number, end: number): void {
        sendMessage('PS.queue.removeRange', JSON.stringify({ start: start, end: end }));
    }
    clear(): void {
        sendMessage('PS.queue.clear', JSON.stringify({}));
    }
    getTrack(trackIndex: number): MusicItem {
        return sendMessage('PS.queue.getTrack', JSON.stringify(trackIndex));
    }
    get currTrackIdx(): number {
        return sendMessage('PS.queue.currTrackIdx-get', JSON.stringify({}));
    }
    set currTrackIdx(index: number) {
        sendMessage('PS.queue.currTrackIdx-set', JSON.stringify(index));
    }
    get length(): number {
        return sendMessage('PS.queue.length-get', JSON.stringify({}));
    }

    helpers = {
        playNext: (mis: MusicItem[]) => {
            let idx = this.currTrackIdx + 1
            if (idx >= this.length) {
                this.addAll(mis)
            } else {
                this.insertAll(idx, mis)
            }
        },
    }
}

class Helpers {
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

// TODO: divide in PropertyStorage and Settings(Storage)
export class PropertyStorage {
    get(name: string) {
        return sendMessage('PS.propertyStorage.get', JSON.stringify(name));
    }
    set(name: string, value: any) {
        sendMessage('PS.propertyStorage.set', JSON.stringify({ 'name': name, 'value': value }));
    }
    setList(list: string[]) {
        sendMessage('PS.propertyStorage.setList', JSON.stringify(list));
    }
}

export class ErrorManager {
    get(): string {
        return sendMessage('PS.errorManager.get', JSON.stringify({}));
    }
    set(err: string) {
        sendMessage('PS.errorManager.set', JSON.stringify(err));
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
