export type SendMessageType = (a: string, b: string) => any
export declare const __dartjs_sendMessage: SendMessageType

export function MP(a: string, b: any = null) {
    return __dartjs_sendMessage(`MP.${a}`, JSON.stringify(b));
}

export class Logger {
    prefix: string
    is_mp_logger: boolean

    constructor(prefix: string, is_mp_logger: boolean = false) {
        this.prefix = prefix
        this.is_mp_logger = is_mp_logger
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
        if (this.is_mp_logger) {
            let argsStr = args.map(
                (el) => typeof el === 'string' ? el : JSON.stringify(el))
                .join(' ')
            let s = `${this.prefix}${argsStr}`
            MP('logger.logGeneral', { s, color })
        } else {
            console.log(`${this._colorMap[color]}${this.prefix}`, ...args, `\x1B[0m`)
        }
    }
    debug(...args: any) {
        this.logGeneral(args, 'blue')
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

export const gLogger = new Logger('')
