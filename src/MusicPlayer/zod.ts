import { z as realZ } from 'zod'

const noOpHandler = {
    apply: (target: any, thisArg: any, args: any[]) => {
        // console.log('\n---- aplly')
        if (target.name === 'parse') {
            return args[0];
        }
        return new Proxy(() => { }, noOpHandler);
    },
    get: () => {
        // console.log('\n---- get')
        return new Proxy(() => { }, noOpHandler)
    }
};

const IS_ENABLE_ZOD = process.env.IS_ENABLE_ZOD

export const z = IS_ENABLE_ZOD ? realZ
    : new Proxy({}, noOpHandler)

