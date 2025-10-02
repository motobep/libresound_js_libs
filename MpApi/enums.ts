export type KeyValue = { [key: string]: any }

export enum NavType {
    tabs = 'tabs',
    searchTabs = 'searchTabs',
    none = 'none',
}

export enum BodyType {
    items = 'items',
    secitons = 'sections',
}

export enum ListType {
    tracklist = 'tracklist',
    grouplist = 'grouplist',
}

export enum WrapperType {
    playlist = 'playlist',
    playlists = 'playlists',
    none = 'none',
}

export enum IconName {
    plus = 'plus',
    chevron_right = 'chevron_right',
    clear = 'clear',
    playlist = 'playlist',
    trash_can = 'trash_can',
    artist = 'artist',
    minus = 'minus',
    remove = 'remove',
    download = 'download',
    shuffle = 'shuffle',
    house = 'house',
    vinyl_record = 'vinyl_record',
    pencil = 'pencil',
    music_note = 'music_note',
    music_notes = 'music_notes',
}

export enum BuiltinActions {
    clear_queue = 'clear_queue',

    add_to_queue = 'add_to_queue',
    queue_play_next = 'queue_play_next',

    group_add_to_queue = 'group_add_to_queue',
    group_queue_play_next = 'group_queue_play_next',

    to_artist = 'to_artist',
}

export enum DownloaderType {
    bytes = 'DownloaderType.bytes',
    url = 'DownloaderType.url',
}

export enum ControlsType {
    search = 'search',
    settings = 'settings',
    queue = 'queue',
}

export enum ItemActionsContextType {
    source = 'source',
    queue = 'queue',
}
