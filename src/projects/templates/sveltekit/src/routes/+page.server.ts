import { Server } from '$/lib/server/server';
import type { PageServerLoad } from './$types';

export const load = (async (ev) => {
    return {
        hi: await Server.ssr.sayHi(ev, {
            name: 'Patrick',
            age: 21,
        }),
    };
}) satisfies PageServerLoad;
