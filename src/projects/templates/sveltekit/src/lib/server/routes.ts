import { z } from 'zod';
import { procedure, router } from './api';
import { FormDataInput } from '@patrick115/sveltekitapi';

export const r = router({
    example: procedure.GET.query(() => {
        return 'Hello from the API!';
    }),
    sayHi: procedure.POST.input(
        z.object({
            name: z.string(),
            age: z.number(),
        }),
    ).query(async ({ input }) => {
        return `Hello ${input.name} (${input.age})` as const;
    }),
    form: procedure.POST.input(FormDataInput).query(async ({ input }) => {
        return {
            name: input.get('name'),
            age: input.get('age'),
        };
    }),
});

export type AppRouter = typeof r;
