export class Logger {
    prefix: string

    constructor(prefix: string) {
        this.prefix = prefix
    }

    log(...args: any) {
        this.logGeneral(args, '')
    }
    green(...args: any) {
        this.logGeneral(args, 'green')
    }
    blue(...args: any) {
        this.logGeneral(args, 'blue')
    }
    warn(...args: any) {
        this.logGeneral(args, 'yellow')
    }
    error(...args: any) {
        this.logGeneral(args, 'red')
    }
    logGeneral(args: any[], color: string) {
        // TODO: Use app's logger
        console.log(`${this._colorMap[color]}${this.prefix}`, ...args, `\x1B[0m`)
    }

    _colorMap = {
        'black': '\x1B[30m',
        'red': '\x1B[31m',
        'green': '\x1B[32m',
        'yellow': '\x1B[33m',
        'blue': '\x1B[34m',
        'magenta': '\x1B[35m',
        'cyan': '\x1B[36m',
        'white': '\x1B[37m',
        'reset': '\x1B[0m',
        '': '',
    };
}
