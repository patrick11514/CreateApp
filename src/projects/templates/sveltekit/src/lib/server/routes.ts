import { z } from 'zod';
import { procedure, router } from './api';

export const r = router({
    example: procedure.GET.query(() => {
        return 'Hello from the API!';
    }),
    sayHi: procedure.POST.input(
        z.object({
            name: z.string(),
            age: z.number(),
        })
    ).query(async ({ input }) => {
        return `Hello ${input.name} (${input.age})` as const;
    }),
});

export type AppRouter = typeof r;
