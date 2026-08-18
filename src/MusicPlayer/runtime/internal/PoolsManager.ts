import { Logger } from '@runtime/Logger';
import { z } from '../../zod';

export class PoolsManager {
    pools = {}

    makePool(name: string): Pool {
        this.logger.green('+++ makePool pool', name)
        z.string().parse(name)
        if (name in this.pools) {
            let errMsg = `Pool "${name}" already exists`
            this.logger.error('Error in makePool():', errMsg)
            throw new Error(errMsg);
        }
        this.pools[name] = new Pool()
        return this.getPool(name)
    }

    getPool(name: string): Pool {
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
        this.logger.green('--- delete pool', name)
        z.string().parse(name)
        delete this.pools[name]
    }

    logger = new Logger('🔌 PoolsManager:', true)
}

export class Pool {
    _map = {}
    _counter = 0

    get(name: string): () => void {
        z.string().parse(name)
        return this._map[name]
    }

    add(el: any): string {
        let name = '__id_' + ++this._counter
        this._map[name] = el
        return name
    }

    addWithId(id: string, el: any): string {
        this._map[id] = el
        return id
    }
}
