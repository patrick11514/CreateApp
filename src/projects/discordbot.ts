import clc from 'cli-color'
import enquirer from 'enquirer'
import fs from 'node:fs'
import Path from 'node:path'
import { _, _c, _p, packageProgram } from '..'

export default {
    name: 'Discord Bot (discord.js)',
    key: 'discordbot',
    function: async (path: string, name: string) => {
        _('text', `You selected: ${clc.red('Discord Bot in discord.js')}`)

        const { extensions, dependencies } = await enquirer.prompt<{
            extensions: boolean
            dependencies: ('simple-json-db' | 'mariadb' | 'node-fetch' | 'express' | 'prettier' | 'dotenv' | 'zod')[]
        }>([
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
                ],
            },
        ])

        let olderNodeFetch = false

        if (dependencies.includes('node-fetch')) {
            const { olderNodeFetch: node } = await enquirer.prompt<{ olderNodeFetch: boolean }>({
                name: 'olderNodeFetch',
                type: 'confirm',
                message: 'Do you want to use CommonJS version of node-fetch?',
            })

            olderNodeFetch = node
        }

        let packages: Array<string> = ['discord.js']
        let devPackages: Array<string> = ['ts-node-dev', 'typescript', '@types/node']

        _('text', 'Adding default packages...')
        if (extensions) {
            packages = packages.concat(['cli-color', 'strip-color'])
            devPackages = devPackages.concat(['@types/cli-color', '@types/strip-color'])

            const libPath = Path.join(path, 'src', 'lib')

            if (!fs.existsSync(libPath)) {
                fs.mkdirSync(libPath, {
                    recursive: true,
                })
            }

            if (!fs.existsSync(Path.join(path, 'logs'))) {
                fs.mkdirSync(Path.join(path, 'logs'))
            }

            const request = await fetch('https://upload.patrick115.eu/.storage/logger.ts')
            const data = await request.text()

            fs.writeFileSync(Path.join(libPath, 'logger.ts'), data)
        }

        _('text', 'Adding dependencies...')
        if (dependencies.includes('simple-json-db')) {
            packages.push('simple-json-db')
        }

        if (dependencies.includes('mariadb')) {
            packages.push('mariadb')
        }

        if (dependencies.includes('node-fetch')) {
            if (olderNodeFetch) {
                packages.push('node-fetch')
            } else {
                packages.push('node-fetch@2')
            }
            devPackages.push('@types/node-fetch')
        }

        if (dependencies.includes('express')) {
            packages.push('express')
        }

        if (dependencies.includes('dotenv')) {
            packages.push('dotenv')
        }

        if (dependencies.includes('prettier')) {
            devPackages.push('prettier')

            //prettier config
            fs.writeFileSync(
                Path.join(path, '.prettierrc'),
                `{
    "printWidth": 120,
    "semi": false,
    "singleQuote": true,
    "useTabs": false,
    "tabWidth": 4
}`
            )
        }

        if (dependencies.includes('zod')) {
            packages.push('zod')
        }

        //create package.json
        await _c(`${packageProgram} init ${packageProgram != 'pnpm' ? '-y' : ''}`, path)

        //edit package.json
        const data = fs.readFileSync(Path.join(path, 'package.json'))
        const packageJson = JSON.parse(data.toString()) as {
            name: string
            version: string
            private: boolean
            scripts: Record<string, string>
            devDependencies: Record<string, string>
            dependencies: Record<string, string>
            type: 'module' | 'commonjs'
        }

        packageJson.name = name
        packageJson.scripts.dev = 'ts-node-dev --respawn ./src/index.ts'
        packageJson.scripts.build = 'mkdir -p build && tsc'
        packageJson.scripts.start = 'node ./build/index.js'
        packageJson.scripts.clear = 'rm -rf build'

        if (dependencies.includes('prettier')) {
            packageJson.scripts.format = 'prettier --write .'
        }

        fs.writeFileSync(Path.join(path, 'package.json'), JSON.stringify(packageJson, null, 4))

        fs.writeFileSync(
            Path.join(path, '.gitignore'),
            `node_modules
build
.env
.env.*
!.env.example
#lock files
pnpm-lock.yaml
package-lock.json
yarn.lock`
        )

        const typesFolder = Path.join(path, 'src', 'types')

        if (!fs.existsSync(typesFolder)) {
            fs.mkdirSync(typesFolder, {
                recursive: true,
            })
        }

        if (dependencies.includes('dotenv')) {
            fs.writeFileSync(
                Path.join(path, '.env.example'),
                `BOT_ID=
BOT_SECRET=
GUILD_ID=`
            )

            if (dependencies.includes('zod')) {
                fs.writeFileSync(
                    Path.join(typesFolder, 'env.ts'),
                    `import { config } from 'dotenv'
import { z } from 'zod'
config()

const schema = z.object({
    BOT_ID: z.string().min(18),
    BOT_SECRET: z.string().min(70),
    GUILD_ID: z.string().min(18),
})

export const env = schema.parse(process.env)`
                )
            } else {
                fs.writeFileSync(
                    Path.join(typesFolder, 'env.d.ts'),
                    `declare global {
    namespace NodeJS {
        interface ProcessEnv {
        }
    }
}
export {}`
                )
            }
        }

        fs.writeFileSync(
            Path.join(path, 'tsconfig.json'),
            `{
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
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
    ]
}`
        )

        fs.writeFileSync(
            Path.join(typesFolder, 'process.d.ts'),
            `import { Client } from 'discord.js'

declare global {
    namespace NodeJS {
        interface Process {
            client: Client
        }
    }
}
export {}
`
        )

        fs.writeFileSync(
            Path.join(path, 'src', 'index.ts'),
            `import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { env } from './types/env'
${extensions ? "import Logger from './lib/logger'" : ''}

//Intends
const intents: GatewayIntentBits[] = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
]

//Partials
const partials: Partials[] = [Partials.Message, Partials.User, Partials.Reaction]

${
    extensions
        ? `//logger for main messages
const l = new Logger('DiscordBot', 'cyan')
l.start('Starting discord bot...')`
        : ''
}

//discord client
const client = new Client({
    intents,
    partials,
})
process.client = client

//event handlers
client.on("ready", () => {
    ${
        extensions
            ? `l.stop(\`Logged in as \${client.user?.username}#\${client.user?.discriminator} (\${client.user?.id})\`)`
            : `console.log(\`Logged in as \${client.user?.username}#\${client.user?.discriminator} (\${client.user?.id})\`\`)`
    }
})

//login
client.login(env.BOT_SECRET)`
        )

        const pkgs = packages
            .map((p) => {
                if (p.includes('@')) {
                    const s = p.split('@')
                    return {
                        name: s[0],
                        version: s[1],
                    }
                }
                return {
                    name: p,
                }
            })
            .concat(
                devPackages.map((p) => {
                    return {
                        name: p,
                        dev: true,
                    }
                })
            )

        _('text', 'Installing packages...')
        await _c(_p(pkgs), path)
        if (dependencies.includes('prettier')) {
            await _c(`${packageProgram} format`, path)
        }

        const { git } = await enquirer.prompt<{ git: boolean }>({
            name: 'git',
            type: 'confirm',
            message: 'Do you want to initialize git?',
        })

        if (git) {
            await _c('git init')
            await _c('git add .')
            await _c("git commit -m 'Initial commit'")
        }

        _('text', clc.green('Instalation complete'))
        _('text', `Now you can use cd ${path} && ${packageProgram} dev to start developing`)
    },
}
