"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const enquirer_1 = __importDefault(require("enquirer"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const __1 = require("..");
exports.default = {
    name: 'Discord Bot (discord.js)',
    key: 'discordbot',
    function: async (path, name) => {
        (0, __1._)('text', `You selected: ${cli_color_1.default.red('Discord Bot in discord.js')}`);
        const { extensions, dependencies, features } = await enquirer_1.default.prompt([
            {
                name: 'extensions',
                type: 'confirm',
                message: 'Do you want to install message logger, which uses CLI Colors?',
            },
            {
                name: 'dependencies',
                type: 'multiselect',
                message: 'Which demendencies do you want to install?',
                choices: [
                    {
                        message: 'Simple Json DB',
                        name: 'simple-json-db',
                    },
                    {
                        message: 'MySQL',
                        name: 'mariadb',
                    },
                    {
                        message: 'Fetch',
                        name: 'node-fetch',
                    },
                    {
                        message: 'Express JS',
                        name: 'express',
                    },
                    {
                        message: 'Prettier',
                        name: 'prettier',
                    },
                    {
                        message: 'DotEnv',
                        name: 'dotenv',
                    },
                    {
                        message: 'Zod',
                        name: 'zod',
                    },
                    {
                        message: 'Custom paths',
                        name: 'paths',
                    },
                ],
            },
            {
                name: 'features',
                type: 'multiselect',
                message: 'Which features do you want to install?',
                choices: [
                    {
                        message: 'Example Command',
                        name: 'example',
                    },
                ],
            },
        ]);
        let olderNodeFetch = false;
        if (dependencies.includes('node-fetch')) {
            const { olderNodeFetch: node } = await enquirer_1.default.prompt({
                name: 'olderNodeFetch',
                type: 'confirm',
                message: 'Do you want to use CommonJS version of node-fetch?',
            });
            olderNodeFetch = node;
        }
        let packages = ['discord.js'];
        let devPackages = ['ts-node-dev', 'typescript', '@types/node'];
        (0, __1._)('text', 'Adding default packages...');
        if (extensions) {
            packages = packages.concat(['cli-color', 'strip-color']);
            devPackages = devPackages.concat(['@types/cli-color', '@types/strip-color']);
            const libPath = node_path_1.default.join(path, 'src', 'lib');
            if (!node_fs_1.default.existsSync(libPath)) {
                node_fs_1.default.mkdirSync(libPath, {
                    recursive: true,
                });
            }
            if (!node_fs_1.default.existsSync(node_path_1.default.join(path, 'logs'))) {
                node_fs_1.default.mkdirSync(node_path_1.default.join(path, 'logs'));
            }
            const request = await fetch('https://upload.patrick115.eu/.storage/logger.ts');
            const data = await request.text();
            node_fs_1.default.writeFileSync(node_path_1.default.join(libPath, 'logger.ts'), data);
        }
        (0, __1._)('text', 'Adding dependencies...');
        if (dependencies.includes('simple-json-db')) {
            packages.push('simple-json-db');
        }
        if (dependencies.includes('mariadb')) {
            packages.push('mariadb');
        }
        if (dependencies.includes('node-fetch')) {
            if (olderNodeFetch) {
                packages.push('node-fetch');
            }
            else {
                packages.push('node-fetch@2');
            }
            devPackages.push('@types/node-fetch');
        }
        if (dependencies.includes('express')) {
            packages.push('express');
        }
        if (dependencies.includes('dotenv')) {
            packages.push('dotenv');
        }
        if (dependencies.includes('prettier')) {
            devPackages.push('prettier');
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, '.prettierrc'), `{
    "printWidth": 120,
    "semi": false,
    "singleQuote": true,
    "useTabs": false,
    "tabWidth": 4
}`);
        }
        if (dependencies.includes('zod')) {
            packages.push('zod');
        }
        if (dependencies.includes('paths')) {
            devPackages.push('tsconfig-paths');
            packages.push('module-alias');
        }
        await (0, __1._c)(`${__1.packageProgram} init ${__1.packageProgram != 'pnpm' ? '-y' : ''}`, path);
        const data = node_fs_1.default.readFileSync(node_path_1.default.join(path, 'package.json'));
        const packageJson = JSON.parse(data.toString());
        const mkdirFolders = [];
        if (dependencies.includes('simple-json-db')) {
            mkdirFolders.push('./databases');
        }
        if (extensions) {
            mkdirFolders.push('./logs');
        }
        packageJson.name = name;
        packageJson.scripts.dev = '';
        if (mkdirFolders.length > 0) {
            packageJson.scripts.folders = 'mkdir -p ' + mkdirFolders.join(' ');
            packageJson.scripts.dev += 'npm run folders && ';
        }
        packageJson.scripts.dev += `ts-node-dev${dependencies.includes('paths') ? ' -r tsconfig-paths/register ' : ' '}--respawn --rs ./src/index.ts`;
        packageJson.scripts.build = `mkdir -p build${mkdirFolders.length > 0 ? ' && npm run folders ' : ' '}&& tsc`;
        packageJson.scripts.start = `node${dependencies.includes('paths') ? ' -r module-alias/register ' : ' '}./build/index.js`;
        packageJson.scripts.clear = 'rm -rf build';
        if (features.includes('example')) {
            packageJson.scripts.registerCommandsDev = `ts-node-dev ${dependencies.includes('paths') ? '-r tsconfig-paths/register ' : ''}./src/registerCommands.ts`;
            packageJson.scripts.registerCommands = `node ${dependencies.includes('paths') ? '-r module-alias/register ' : ''}./build/registerCommands.js`;
        }
        if (dependencies.includes('paths')) {
            packageJson._moduleAliases = {
                $types: './build/types',
            };
        }
        if (dependencies.includes('prettier')) {
            packageJson.scripts.format = 'prettier --write .';
        }
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'package.json'), JSON.stringify(packageJson, null, 4));
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, '.gitignore'), `node_modules
build
.env
.env.*
!.env.example
#lock files
pnpm-lock.yaml
package-lock.json
yarn.lock`);
        const typesFolder = node_path_1.default.join(path, 'src', 'types');
        if (!node_fs_1.default.existsSync(typesFolder)) {
            node_fs_1.default.mkdirSync(typesFolder, {
                recursive: true,
            });
        }
        if (dependencies.includes('dotenv')) {
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, '.env.example'), `BOT_ID=
BOT_SECRET=
GUILD_ID=`);
            if (dependencies.includes('zod')) {
                node_fs_1.default.writeFileSync(node_path_1.default.join(typesFolder, 'env.ts'), `import { config } from 'dotenv'
import { z } from 'zod'
config()

const schema = z.object({
    BOT_ID: z.string().min(18),
    BOT_SECRET: z.string().min(70),
    GUILD_ID: z.string().min(18),
})

export const env = schema.parse(process.env)`);
            }
            else {
                node_fs_1.default.writeFileSync(node_path_1.default.join(typesFolder, 'env.d.ts'), `declare global {
    namespace NodeJS {
        interface ProcessEnv {
        }
    }
}
export {}`);
            }
        }
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'tsconfig.json'), `{
    "compilerOptions": {
        "rootDir": "src",
        "outDir": "build",
        "removeComments": true,
        "target": "ES2022",
        "module": "CommonJS",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        ${dependencies.includes('paths')
            ? `"paths": {
            "$types/*": ["./src/types/*"]
        }`
            : ''}
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
    ]
}`);
        node_fs_1.default.writeFileSync(node_path_1.default.join(typesFolder, 'process.d.ts'), `import { Client } from 'discord.js'

declare global {
    namespace NodeJS {
        interface Process {
            client: Client
        }
    }
}
export {}
`);
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'index.ts'), `import { Client, GatewayIntentBits, Partials } from 'discord.js'
${dependencies.includes('dotenv') ? `import { env } from './types/env'` : ''}
${extensions ? "import Logger from './lib/logger'" : ''}
${features.includes('example')
            ? `import { Awaitable } from '$types/types'
import fs from 'node:fs'
import path from 'path'
import { DiscordEvent } from './hooks'
import clc from 'cli-color'`
            : ''}

//Intends
const intents: GatewayIntentBits[] = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
]

//Partials
const partials: Partials[] = [Partials.Message, Partials.User, Partials.Reaction]

${extensions
            ? `//logger for main messages
const l = new Logger('DiscordBot', 'cyan')
l.start('Starting discord bot...')`
            : ''}

//discord client
const client = new Client({
    intents,
    partials,
})
process.client = client

//event handlers
${features.includes('example')
            ? `const starts: (() => Awaitable<void>)[] = []
const events: DiscordEvent<any>[] = []
`
            : ''}
client.on("ready", () => {
    ${extensions
            ? `l.stop(\`Logged in as \${client.user?.username}#\${client.user?.discriminator} (\${client.user?.id})\`)`
            : `console.log(\`Logged in as \${client.user?.username}#\${client.user?.discriminator} (\${client.user?.id})\`\`)`}
})

${features.includes('example')
            ? `
//load events frol files
const files = fs
    .readdirSync(path.join(__dirname, 'functions'))
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))

files.forEach((file) => {
    const required = require(path.join(__dirname, 'functions', file))

    if (!('default' in required)) {
        l.error(\`File \${file} is missing default export\`)
        return
    }

    const exp: {
        events: DiscordEvent<any>[]
        start?: () => Awaitable<void>
    } = required.default

    const start = exp.start

    if (start !== undefined) {
        starts.push(start)
    }

    exp.events.forEach((ev) => {
        events.push(ev)
    })
})

let evs = 0
events.forEach((ev) => {
    const { event, callback } = ev.get()
    client.on(event, callback)
    evs++
})

${extensions ? `l.log(\`Registered \${clc.blue(evs)} events\`)` : ''}`
            : ''}

//login
client.login(${dependencies.includes('dotenv') ? 'env.BOT_SECRET' : "'SECRET_TOKEN'"})`);
        const pkgs = packages
            .map((p) => {
            if (p.includes('@')) {
                const s = p.split('@');
                return {
                    name: s[0],
                    version: s[1],
                };
            }
            return {
                name: p,
            };
        })
            .concat(devPackages.map((p) => {
            return {
                name: p,
                dev: true,
            };
        }));
        if (features.includes('example')) {
            await (0, __1._c)('mkdir -p src/functions', path);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'functions', 'ping.ts'), `import { DiscordEvent } from '../hooks'

export default {
    events: [
        new DiscordEvent('messageCreate', (msg) => {
            if (msg.content === 'ping' && !msg.author.bot) {
                msg.reply('Pong!')
            }
        }),
    ],
}`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'hooks.ts'), `import { Awaitable } from '$types/types'
                import { ClientEvents } from 'discord.js'
                
                export class DiscordEvent<T extends keyof ClientEvents> {
                    event: T
                    callback: (...args: ClientEvents[T]) => Awaitable<void>
                
                    constructor(event: T, callback: (...args: ClientEvents[T]) => Awaitable<void>) {
                        this.event = event
                        this.callback = callback
                    }
                
                    get() {
                        return {
                            event: this.event,
                            callback: this.callback,
                        }
                    }
                }
                `);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'types', 'types.ts'), `export type Awaitable<T> = T | Promise<T>`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'registerCommands.ts'), `${extensions ? `import Logger from '$lib/logger'\n` : ''}${dependencies.includes('dotenv') ? `import { env } from '$types/env'\n` : ''}import { REST, Routes, SlashCommandBuilder } from 'discord.js'

const rest = new REST({ version: '10' }).setToken(${dependencies.includes('dotenv') ? 'env.BOT_SECRET' : "'BOT_TOKEN'"})

const rawCommands = [
    new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example text')
        .setDescriptionLocalizations({ cs: 'Ukázkový text', 'en-US': 'Example text' })
        .addNumberOption((option) => {
            return option
                .setName('id')
                .setDescription('Example id')
                .setDescriptionLocalizations({ cs: 'Ukázkové id', 'en-US': 'Example id' })
                .setRequired(true)
        }),
    
] as SlashCommandBuilder[]

const json = rawCommands.map((command) => command.toJSON())

${extensions
                ? `const l = new Logger('RegisterCommands', 'yellow')
l.start('Registering commands...')`
                : ''}

rest.put(Routes.applicationCommands(env.BOT_ID), { body: json })
    .then(() => {
        ${extensions ? `l.stop('Successfully registered commands')` : "console.log('Successfully registered commands')"}
    })
    .catch((err) => {
        ${extensions
                ? `l.error('Failed to register commands')
        l.stopError(err)`
                : "console.error('Failed to register commands', err)"}
    })
            `);
        }
        (0, __1._)('text', 'Installing packages...');
        await (0, __1._c)((0, __1._p)(pkgs), path);
        if (dependencies.includes('prettier')) {
            await (0, __1._c)(`${__1.packageProgram} format`, path);
        }
        const { git } = await enquirer_1.default.prompt({
            name: 'git',
            type: 'confirm',
            message: 'Do you want to initialize git?',
        });
        if (git) {
            await (0, __1._c)('git init', path);
            await (0, __1._c)('git add .', path);
            await (0, __1._c)("git commit -m 'Initial commit'", path);
        }
        (0, __1._)('text', cli_color_1.default.green('Instalation complete'));
        (0, __1._)('text', `Now you can use cd ${path} && ${__1.packageProgram} dev to start developing`);
    },
};
