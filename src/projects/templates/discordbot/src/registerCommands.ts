import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { env } from './types/env';

const rest = new REST({ version: '10' }).setToken(env.BOT_SECRET);

const rawCommands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalization('cs', 'ping')
        .setDescription('Ping bot')
        .setDescriptionLocalizations({
            cs: 'Pingne bota',
        }),
] as SlashCommandBuilder[];

const json = rawCommands.map((command) => command.toJSON());

console.log('Registering commands...');

rest.put(Routes.applicationCommands(env.BOT_ID), { body: json })
    .then(() => {
        console.log('Successfully registered commands');
    })
    .catch((err) => {
        console.log('Failed to register commands');
        console.error(err);
    });
