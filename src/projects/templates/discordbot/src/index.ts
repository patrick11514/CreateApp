import clc from 'cli-color';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'node:fs';
import path from 'path';
import { DiscordEvent } from './hooks';
import { env } from './types/env';
import { Awaitable } from './types/types';

//Intends
const intents: GatewayIntentBits[] = [GatewayIntentBits.Guilds];

//Partials
const partials: Partials[] = [Partials.Message, Partials.User, Partials.Reaction];

//logger for main messages
console.log('Starting discord bot...');

//discord client
const client = new Client({
    intents,
    partials,
});
process.client = client;

//event handlers
const starts: (() => Awaitable<void>)[] = [];
const events: DiscordEvent<any>[] = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.username}#${client.user?.discriminator} (${client.user?.id})`);

    starts.forEach((start) => {
        start();
    });
});

//load events from files
const files = fs
    .readdirSync(path.join(__dirname, 'functions'))
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

files.forEach((file) => {
    const required = require(path.join(__dirname, 'functions', file));

    if (!('default' in required)) {
        console.log(`File ${file} is missing default export`);
        return;
    }

    const exp: {
        events: DiscordEvent<any>[];
        start?: () => Awaitable<void>;
    } = required.default;

    const start = exp.start;

    if (start !== undefined) {
        starts.push(start);
    }

    exp.events.forEach((ev) => {
        events.push(ev);
    });
});

let evs = 0;
events.forEach((ev) => {
    const { event, callback } = ev.get();
    client.on(event, callback);
    evs++;
});

console.log(`Registered ${clc.blue(evs)} events`);

//login
client.login(env.BOT_SECRET);
