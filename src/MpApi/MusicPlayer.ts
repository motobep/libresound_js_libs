import { z } from 'zod';

import { Logger } from './Logger'
import { MpRuntimeClass, SendMessageType } from './MpRuntime'
import { ListType, NavType } from './enums'
import { ActionBtnDescr, Control, DownloadProps, GroupItem, IndexedItem, Item, ItemAction, KeyValue, MusicItem, PageHeaderDescr, sActionBtnDescr, sControl, SectionDescrJs, sItem, sItemAction, sKeyValue, sMusicItem, sNavType, sPageHeaderDescr, sSectionDescrJs, MusicPageDescr, ControlsPageDescr, sMusicPageDescrUntyped, MusicPageDescrUntyped, ControlsPageDescrUntyped, sControlsPageDescrUntyped, PageDescr, sPageDescr } from './types'

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

export interface Settings {
    settings: {
        onOpen(): void
        onClose(): void
    }
}

class FuncsManager {
    pools = {}

    makePool(name: string): FuncsPool {
        z.string().parse(name)
        if (name in this.pools) {
            let errMsg = `Pool "${name}" already exists`
            this.logger.error('Error in makePool():', errMsg)
            throw new Error(errMsg);
        }
        this.logger.log('make pool', name)
        this.pools[name] = new FuncsPool()
        return this.getPool(name)
    }

    getPool(name: string): FuncsPool {
        if (!(name in this.pools)) {
            let errMsg = `Pool "${name}" doesn't exist`
            this.logger.error('Error in getPool():', errMsg)
            throw new Error(errMsg);
        }
        z.string().parse(name)
        return this.pools[name]
    }

    contains(name: string): boolean {
        return name in this.pools
    }

    deletePool(name: string): void {
        this.logger.log('delete pool', name)
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

    add(func: (...args: any[]) => void): string {
        let name = '__f_' + ++this.counter
        this.funcsMap[name] = func
        return name
    }

    addWithId(func: (...args: any[]) => void, id: string): string {
        this.funcsMap[id] = func
        return id
    }
}

function _checkControls(controls: Control[]) {
    let ids = []
    for (let el of controls) {
        if (!('id' in el)) continue;

        if (ids.includes(el.id)) {
            MusicPlayer.logger.error(`Duplicate id for:`, el)
            throw Error(`Duplicate id: ${el.id}`)
        }
        ids.push(el.id)
    }
}


export class MusicPlayerClass {
    source = new Source()
    currPageStack = new CurrPageStack()
    currMusicPage = new CurrMusicPage()
    playback = new Playback()
    queue = new Queue()
    propertyStorage = new PropertyStorage()
    errorManager = new ErrorManager()
    helpers = new Helpers()
    logger = new Logger('🔌')
    settings = {
        logger: new Logger('🔌settings'),
        setControls(controls: Control[]) {
            z.array(sControl).parse(controls)
            _checkControls(controls)

            const controlsPool = 'controlsPool'
            if (MusicPlayer._funcsManager.contains(controlsPool)) {
                MusicPlayer._funcsManager.deletePool(controlsPool);
            }
            MusicPlayer._funcsManager.makePool(controlsPool);
            _addControlsToPool(controls, controlsPool)

            sendMessage('PS.settings.setControls', JSON.stringify(controls));
        },
    }

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
        [name: string]: PageDescr[]
    }): void {
        z.record(z.string(), z.array(sPageDescr)).parse(map)

        for (let name in map) {
            let stack = map[name]
            for (let i in stack) {
                let page = stack[i]
                if (page.type === 'controls') {
                    let currPageId = `${name}.${i}`
                    MusicPlayer._funcsManager.makePool(currPageId);
                    _addControlsToPool(page.controls, currPageId)
                }
            }
        }

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
    get length(): number {
        return sendMessage('PS.currPageStack.length-get', JSON.stringify({}));
    }
    get last(): PageDescr {
        return sendMessage('PS.currPageStack.last-get', JSON.stringify({}));
    }
    setLast(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr)
        MusicPlayer.logger.log('setLast')

        if (_getCurrPageType() === 'controls') {
            MusicPlayer._funcsManager.deletePool(_getCurrPageId());
        }

        sendMessage('PS.currPageStack.setLast', JSON.stringify(pageDescr));

        if (_getCurrPageType() === 'controls') {
            let currPageId = _getCurrPageId()
            MusicPlayer._funcsManager.makePool(currPageId);
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
    push(pageDescr: PageDescr) {
        sPageDescr.parse(pageDescr)
        MusicPlayer.logger.log('push')

        sendMessage('PS.currPageStack.push', JSON.stringify(pageDescr));

        if (_getCurrPageType() === 'controls') {
            let currPageId = _getCurrPageId()
            MusicPlayer._funcsManager.makePool(currPageId);
            _addControlsToPool((pageDescr as ControlsPageDescr).controls, currPageId)
        }
    }
    pop(): boolean {
        if (_getCurrPageType() === 'controls') {
            MusicPlayer._funcsManager.deletePool(_getCurrPageId());
        }

        return sendMessage('PS.currPageStack.pop', JSON.stringify({}));
    }
}

function _getCurrPageId(): string {
    return sendMessage('PS.currPageId', JSON.stringify({}));
}
function _getCurrPageType(): string {
    return sendMessage('PS.currPage.type', JSON.stringify({}));
}

export class CurrMusicPage {
    get title() {
        return sendMessage('PS.currMusicPage.title-get', JSON.stringify({}));
    }

    set title(str: string) {
        z.string().parse(str)
        sendMessage('PS.currMusicPage.title.set', JSON.stringify(str));
    }

    get sectionlist(): SectionDescrJs[] {
        return sendMessage('PS.currMusicPage.sectionlist-get', JSON.stringify({}))
    }

    set sectionlist(val: SectionDescrJs[]) {
        z.array(sSectionDescrJs).parse(val)
        sendMessage('PS.currMusicPage.sectionlist-set', JSON.stringify(val))
    }

    get header(): PageHeaderDescr {
        return sendMessage('PS.currMusicPage.header-get', JSON.stringify({}))
    }

    set header(val: PageHeaderDescr) {
        sPageHeaderDescr.parse(val)
        sendMessage('PS.currMusicPage.header-set', JSON.stringify(val))
    }

    get actionBtn(): ActionBtnDescr {
        return sendMessage('PS.currMusicPage.actionBtn-get', JSON.stringify({}))
    }

    set actionBtn(val: ActionBtnDescr) {
        sActionBtnDescr.parse(val)
        sendMessage('PS.currMusicPage.actionBtn-set', JSON.stringify(val))
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

export class PropertyStorage {
    get(name: string): any {
        z.string().parse(name)
        return sendMessage('PS.propertyStorage.get', JSON.stringify(name));
    }
    set(name: string, value: any) {
        z.string().parse(name)
        sendMessage('PS.propertyStorage.set', JSON.stringify({ 'name': name, 'value': value }));
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

export function MusicPage(obj: MusicPageDescrUntyped): MusicPageDescr {
    sMusicPageDescrUntyped.parse(obj)
    return Object.assign({ type: 'music' }, obj) as MusicPageDescr
}

export function ControlsPage(obj: ControlsPageDescrUntyped): ControlsPageDescr {
    sControlsPageDescrUntyped.parse(obj)
    return Object.assign({ type: 'controls' }, obj) as ControlsPageDescr
}

function _addControlsToPool(controls: Control[], poolName: string) {
    MusicPlayer.logger.log('_addControlsToPool')
    var pool = MusicPlayer._funcsManager.getPool(poolName);
    for (let el of controls) {
        if ('onChanged' in el) {
            pool.addWithId(el.onChanged, el.id)
        }
    }
}

