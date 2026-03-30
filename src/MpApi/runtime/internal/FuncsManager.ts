import { Logger } from '@runtime/Logger';
import { z } from 'zod';

export class FuncsManager {
    pools = {}

    makePool(name: string): FuncsPool {
        this.logger.green('+++ makePool pool', name)
        z.string().parse(name)
        if (name in this.pools) {
            let errMsg = `Pool "${name}" already exists`
            this.logger.error('Error in makePool():', errMsg)
            throw new Error(errMsg);
        }
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
        this.logger.green('--- delete pool', name)
        z.string().parse(name)
        delete this.pools[name]
    }

    logger = new Logger('🔌 FuncsManager:')
}

export class FuncsPool {
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
