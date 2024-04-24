import { ClientEvents } from 'discord.js';
import { Awaitable } from './types/types';

export class DiscordEvent<T extends keyof ClientEvents> {
    event: T;
    callback: (...args: ClientEvents[T]) => Awaitable<void>;

    constructor(event: T, callback: (...args: ClientEvents[T]) => Awaitable<void>) {
        this.event = event;
        this.callback = callback;
    }

    get() {
        return {
            event: this.event,
            callback: this.callback,
        };
    }
}
