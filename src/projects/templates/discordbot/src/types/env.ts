import { config } from 'dotenv';
import { z } from 'zod';
config();

const schema = z.object({
    BOT_ID: z.string().min(18),
    BOT_SECRET: z.string().min(70),
});

export const env = schema.parse(process.env);
