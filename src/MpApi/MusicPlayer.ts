import { z } from 'zod';

import { Logger } from './Logger'
import { MpRuntimeClass, SendMessageType } from './MpRuntime'
import { ListType, NavType } from './enums'
import { ActionBtnDescr, DownloadProps, GroupItem, IndexedItem, Item, ItemAction, KeyValue, MusicItem, PageDescrJs, PageHeaderDescr, sActionBtnDescr, SectionDescrJs, sItem, sItemAction, sKeyValue, sMusicItem, sNavType, sPageDescrJs, sPageHeaderDescr, sSectionDescrJs } from './types'

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

    buildActionsAsync(indexedItem: IndexedItem, sectionIndex: number): Promise<ItemAction[]>
    buildMultiActionsAsync(indexedItemsMap: { [key: string]: IndexedItem[] }): Promise<ItemAction[]>

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

class FuncsManager {
    pools = {}

    makePool(name: string): FuncsPool {
        z.string().parse(name)
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
        z.string().parse(name)
        z.string().parse(name)
        return this.pools[name]
    }

    deletePool(name: string): void {
        z.string().parse(name)
        delete this.pools[name]
    }

    logger = new Logger('📘 FuncsManager:')
}

class FuncsPool {
    funcsMap = {}
    counter = 0

    get(name: string): () => void {
        z.string().parse(name)
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

    runtime = MpRuntime
    _funcsManager = new FuncsManager()

    constructor() {
        this.logger.log('MusicPlayerClass loaded')
    }

    getLanguage(): string {
        return sendMessage('PS.getLanguage', JSON.stringify({}));
    }

    downloadMusicItemAsync(mi: MusicItem): Promise<void> {
        sMusicItem.parse(mi)
        return sendMessage('PS.downloadMusicItemAsync', JSON.stringify(mi));
    }

    toThisSourceAsync(): Promise<void> {
        return sendMessage('PS.toThisSourceAsync', JSON.stringify({}));
    }

    closeActions(): void {
        sendMessage('PS.closeActions', JSON.stringify({}));
    }

    showActionsDialog(actions: ItemAction[], tapPos: number[] | null = null): void {
        z.array(sItemAction).parse(actions)
        z.nullable(z.array(z.number()))
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
        z.record(z.string(), z.array(sPageDescrJs)).parse(map)
        sendMessage('PS.initPageStacks', JSON.stringify(map));
    }

    get currPageStackName(): string {
        return sendMessage('PS.currPageStackName-get', JSON.stringify({}));
    }
    set currPageStackName(name: string) {
        z.string().parse(name)
        sendMessage('PS.currPageStackName-set', JSON.stringify(name));
    }

    get currTabIdx(): number {
        return sendMessage('PS.currTabIdx-get', JSON.stringify({}));
    }
    set currTabIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.currTabIdx-set', JSON.stringify(index));
    }
    getTabs(): string[][] {
        return sendMessage('PS.getTabs', JSON.stringify({}));
    }
    setTabs(arr: string[][]): void {
        z.array(z.array(z.string())).parse(arr)
        sendMessage('PS.setTabs', JSON.stringify(arr));
    }

    get currSearchTabIdx(): number {
        return sendMessage('PS.currSearchTabIdx-get', JSON.stringify({}));
    }
    set currSearchTabIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.currSearchTabIdx-set', JSON.stringify(index));
    }
    getSearchTabs(): string[] {
        return sendMessage('PS.getSearchTabs', JSON.stringify({}));
    }
    setSearchTabs(arr: string[]): void {
        z.array(z.string()).parse(arr)
        sendMessage('PS.setSearchTabs', JSON.stringify(arr));
    }

    get navType() {
        return sendMessage('PS.navType-get', JSON.stringify({}));
    }
    set navType(navType: NavType) {
        sNavType.parse(navType)
        sendMessage('PS.navType-set', JSON.stringify(navType));
    }

    get isShowSearch() {
        return sendMessage('PS.isShowSearch-get', JSON.stringify({}));
    }
    set isShowSearch(isShow: boolean) {
        z.boolean().parse(isShow)
        sendMessage('PS.isShowSearch-set', JSON.stringify(isShow));
    }

    get rightControls() {
        return sendMessage('PS.rightControls-set', JSON.stringify({}));
    }
    set rightControls(controls: string[]) {
        z.array(z.string()).parse(controls)
        sendMessage('PS.rightControls-set', JSON.stringify(controls));
    }

    openPluginSettingsPage(): void {
        sendMessage('PS.openPluginSettingsPage', JSON.stringify({}));
    }

    async updateThumbnailFromUrlAsync(id: string, url: string): Promise<boolean> {
        z.string().parse(id)
        z.string().parse(url)
        return await sendMessage('PS.updateThumbnailFromUrlAsync',
            JSON.stringify({ id: id, url: url }));
    }
}

class CurrPageStack {
    setLast(pageDescr: PageDescrJs) {
        sPageDescrJs.parse(pageDescr)
        sendMessage('PS.currPageStack.setLast', JSON.stringify(pageDescr));
    }
    get length(): number {
        return sendMessage('PS.currPageStack.length-get', JSON.stringify({}));
    }
    get last(): PageDescrJs {
        return sendMessage('PS.currPageStack.last-get', JSON.stringify({}));
    }
    push(pageDescr: PageDescrJs) {
        sPageDescrJs.parse(pageDescr)
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
        z.string().parse(str)
        sendMessage('PS.currPage.title.set', JSON.stringify(str));
    }

    get sectionlist(): SectionDescrJs[] {
        return sendMessage('PS.currPage.sectionlist-get', JSON.stringify({}))
    }

    set sectionlist(val: SectionDescrJs[]) {
        z.array(sSectionDescrJs).parse(val)
        sendMessage('PS.currPage.sectionlist-set', JSON.stringify(val))
    }

    get header(): PageHeaderDescr {
        return sendMessage('PS.currPage.header-get', JSON.stringify({}))
    }

    set header(val: PageHeaderDescr) {
        sPageHeaderDescr.parse(val)
        sendMessage('PS.currPage.header-set', JSON.stringify(val))
    }

    get actionBtn(): ActionBtnDescr {
        return sendMessage('PS.currPage.actionBtn-get', JSON.stringify({}))
    }

    set actionBtn(val: ActionBtnDescr) {
        sActionBtnDescr.parse(val)
        sendMessage('PS.currPage.actionBtn-set', JSON.stringify(val))
    }

    get props() {
        return sendMessage('PS.currPage.props-get', JSON.stringify({}));
    }

    set props(props: KeyValue) {
        sKeyValue.parse(props)
        sendMessage('PS.currPage.props-set', JSON.stringify(props));
    }
}


export class Playback {
    playByIdx(index: number): void {
        z.number().nonnegative().parse(index)
        sendMessage('PS.playback.playByIdx', JSON.stringify(index));
    }
}

export class Queue {
    insertAll(index: number, list: MusicItem[]): void {
        z.number().nonnegative().parse(index)
        z.array(sMusicItem).parse(list)
        sendMessage('PS.queue.insertAll', JSON.stringify({ index: index, list: list }));
    }
    addAll(list: MusicItem[]): void {
        z.array(sMusicItem).parse(list)
        sendMessage('PS.queue.addAll', JSON.stringify(list));
    }
    removeRange(start: number, end: number): void {
        z.number().nonnegative().parse(start)
        z.number().nonnegative().parse(end)
        sendMessage('PS.queue.removeRange', JSON.stringify({ start: start, end: end }));
    }
    clear(): void {
        sendMessage('PS.queue.clear', JSON.stringify({}));
    }
    getTrack(index: number): MusicItem {
        z.number().nonnegative().parse(index)
        return sendMessage('PS.queue.getTrack', JSON.stringify(index));
    }
    get currTrackIdx(): number {
        return sendMessage('PS.queue.currTrackIdx-get', JSON.stringify({}));
    }
    set currTrackIdx(index: number) {
        z.number().nonnegative().parse(index)
        sendMessage('PS.queue.currTrackIdx-set', JSON.stringify(index));
    }
    get length(): number {
        return sendMessage('PS.queue.length-get', JSON.stringify({}));
    }

    helpers = {
        playNext: (mis: MusicItem[]) => {
            z.array(sMusicItem).parse(mis)
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
        z.array(sItem).parse(itemlist)
        return {
            listType: 'tracklist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    makeGrouplist(itemlist: Item[]) {
        z.array(sItem).parse(itemlist)
        return {
            listType: 'grouplist' as ListType,
            itemlist: itemlist,
            rowsCount: -1,
        };
    }

    defaultDownloadProps(downloadId: string, name: string): DownloadProps {
        z.string().parse(downloadId)
        z.string().parse(name)
        return {
            id: downloadId,
            onDataReceived: (recieved: number, contentLength: number) => {
                z.number().nonnegative().parse(recieved)
                z.number().nonnegative().parse(contentLength)
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
        z.string().parse(name)
        return sendMessage('PS.propertyStorage.get', JSON.stringify(name));
    }
    set(name: string, value: any) {
        z.string().parse(name)
        sendMessage('PS.propertyStorage.set', JSON.stringify({ 'name': name, 'value': value }));
    }
    setList(list: string[]) {
        z.array(z.string()).parse(list)
        sendMessage('PS.propertyStorage.setList', JSON.stringify(list));
    }
}

export class ErrorManager {
    get(): string {
        return sendMessage('PS.errorManager.get', JSON.stringify({}));
    }
    set(err: string) {
        z.string(err)
        sendMessage('PS.errorManager.set', JSON.stringify(err));
    }
}

export const MusicPlayer = new MusicPlayerClass()

