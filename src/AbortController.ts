export class AbortSignal {
    aborted: boolean = false
    reason: string = ''
    onabort() {
        if (!this._onabort) {
            this.aborted = true
            this.reason = 'user abort (Undefined handler)'
            console.log('Undefined _onabort. Throwing')
            throw new Error('Undefined _onabort')
        } else {
            this._onabort()
            this.aborted = true
            this.reason = 'user abort'
        }
    }
    _onabort: () => void = null
}

export class AbortController {
    signal: AbortSignal = new AbortSignal()
    abort() {
        this.signal.onabort()
    }
}
