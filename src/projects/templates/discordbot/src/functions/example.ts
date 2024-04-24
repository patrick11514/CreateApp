import { DiscordEvent } from '../hooks';

export default {
    events: [
        new DiscordEvent('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.commandName !== 'ping') return;

            interaction.reply('Pong!');
        }),
    ],
};
