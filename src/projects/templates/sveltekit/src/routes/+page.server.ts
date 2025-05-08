import { Server } from '$/lib/server/server';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';

export const load = (async (ev) => {
    return {
        hi: await Server.ssr.sayHi(ev, {
            name: 'Patrick',
            age: 21,
        }),
    };
}) satisfies PageServerLoad;

export const actions = {
    default: Server.actions.form,
} satisfies Actions;
