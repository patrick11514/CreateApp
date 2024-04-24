import { Client } from 'discord.js';

declare global {
    namespace NodeJS {
        interface Process {
            client: Client;
        }
    }
}
export {};
