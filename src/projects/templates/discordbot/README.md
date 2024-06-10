# Discord bot template

### How to use it

1. Copy .env.example to .env
2. Edit .env with your bot id and bot secret (optionally with database info)
3. Now you need to register slash commands using:

```BASH
#npm
npm run registerCommandsDev
#pnpm
pnpm registerCommandsDev
```

4. Now you can run bot using:

```BASH
#npm
npm run dev
#pnpm
pnpm dev
```

### Files

-   src/index.ts
    Main file, with connecting to database, discord gateway and loading commands
-   src/registerCommands.ts
    File where you add slash command definitions
-   src/types/env.ts
    Here is zod definition of .env file
-   src/types/connection.ts
    Connection to database
-   src/functions/example.ts
    Example slash command

### Example slash command file

```TS
import { DiscordEvent } from '../hooks';

export default { //you need to export default object with events array
    events: [
        new DiscordEvent('interactionCreate', async (interaction) => { // here you have interactionCreate event from Discord.js and callback functions
            if (!interaction.isChatInputCommand()) return; //which checks if interaction is chat command
            if (interaction.commandName !== 'ping') return; //here we check, if command is ping

            interaction.reply('Pong!'); //and here we are replaying with pong message
        }),
    ],
};

```
