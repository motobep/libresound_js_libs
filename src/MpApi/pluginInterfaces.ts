import { GroupItem, IndexedItem, ItemAction, MusicItem } from './types'

/**
 * Must be implemented by source plugins ("type": "js:source")
 */
export interface SourcePlugin {
    /**
     * Called after this plugin was loaded
     */
    afterInitAsync(): Promise<void>
    /**
     * Called when user reloads page
     */
    reloadAsync(): Promise<void>

    /**
     * On choose this plugin's source
     */
    chooseSourceAsync(): Promise<void>

    /**
     * Called when user types in search bar
     */
    getSuggestionsAsync(text: string): Promise<string[]>
    /**
     * On search
     */
    searchAsync(text: string): Promise<void>

    /**
     * On choose tab
     */
    chooseTabAsync(index: number): Promise<void>
    /**
     * On choose search tab
     */
    chooseSearchTabAsync(index: number): Promise<void>

    /**
     * On choose (tap/click) group
     */
    chooseGroupAsync(group: GroupItem): Promise<void>

    /**
     * Called when showing action of an item
     */
    buildActionsAsync(indexedItem: IndexedItem, sectionIndex: number): Promise<ItemAction[]>
    /**
     * Called when showing actions of multiple items
     */
    buildMultiActionsAsync(indexedItemsMap: { [key: string]: IndexedItem[] }): Promise<ItemAction[]>

    /**
     * Called after user taps back button
     */
    onAfterBack(): Promise<void>

    /**
     * Use with guardMusicItemLoadingAsync()
     */
    playMusicItemAsync(mi: MusicItem): Promise<void>
}

/**
 * Optional events
 */
export interface OptionalEventHandlers {
    onPlaybackControlsOpen?(obj: any): Promise<void>
    onOpenedPlaybackPlayPrev?(obj: any): Promise<void>
    onOpenedPlaybackPlayNext?(obj: any): Promise<void>
    onTapArtistTitle?(args: any): Promise<void>
}

/**
 * Events on plugin's settings page
 */
export interface Settings {
    settings: {
        onOpen(): void
        onClose(): void
    }
}
