import clc from 'cli-color';
import fs from 'node:fs';
import Path from 'node:path';
import { BaseProject } from '../lib/baseProject';
import { Logger } from '../lib/logger';
import { Main } from '../lib/main';
import { PackageList, PackageManager } from '../lib/packageLib';
import { prompt } from '../lib/prompt';
import { copyFiles } from '../lib/utilts';

const PACKAGE_LIST = {
    defualt: [
        ['zod', '^3.23.8'],
        ['dotenv', '^16.4.5'],
    ],
    cookies: [
        ['jsonwebtoken', '^9.0.2'],
        ['simple-json-db', '^2.0.0'],
        ['uuid', '^11.0.2'],
    ],
    cookies_dev: [
        ['@types/jsonwebtoken', '^9.0.7'],
        ['@types/uuid', '^10.0.0'],
    ],
    kysely: [
        ['kysely', '^0.27.4'],
        ['mysql2', '^3.11.4'],
    ],
    svelte_api: [
        ['zod', '^3.22.4'],
        ['@patrick115/sveltekitapi', '^1.2.12'],
    ],
} as const satisfies Record<string, PackageList>;

const adapterVersions = {
    cloudflare: '^4.7.4',
    'cloudflare-workers': '^2.5.5',
    netlify: '^4.3.6',
    node: '^5.2.9',
    static: '^3.0.6',
    vercel: '^5.4.7',
} as const;

export default {
    name: 'SvelteKit',
    key: 'sveltekit',
    function: async (main: Main, path: string, name: string) => {
        Logger.log(`You've selected ${clc.red('SvelteKit Application')}`);

        const { template } = await prompt({
            name: 'template',
            type: 'select',
            message: 'Which app do you want to create?',
            choices: [
                {
                    name: 'demo',
                    message: 'Demo app',
                    hint: 'Default app with example project',
                },
                {
                    name: 'minimal',
                    message: 'Minimal project',
                    hint: 'Clean project without any examples',
                },
                {
                    name: 'library',
                    message: 'Library project',
                    hint: 'Project for creating libraries',
                },
            ],
        });

        await main.spawn('npx', ['sv', 'create', '--no-install', '--template', template, '--types', 'ts', path]);

        //append lock files to gitignore
        fs.appendFileSync(Path.join(path, '.gitignore'), '#lock files\npackage-lock.json\nyarn.lock\npnpm-lock.yaml');

        const { tools } = await prompt({
            name: 'tools',
            type: 'multiselect',
            message: 'Select additional things to install',
            choices: [
                {
                    message: 'Default Packages',
                    name: 'default',
                    hint: 'dotenv, zod',
                },
                {
                    message: 'Authme Lib',
                    name: 'authme',
                    hint: 'Lib for minecraft plugin Authme (pasword compare)',
                },
                {
                    message: 'Cookies Lib',
                    name: 'cookies',
                    hint: 'Library for handling sessions with JWT Token',
                },
                {
                    message: 'Kysely',
                    name: 'kysely',
                    hint: 'The type-safe SQL query builder for TypeScript',
                },
                {
                    message: 'Kysely-Codegen',
                    name: 'kysely-codegen',
                    hint: "kysely-codegen generates Kysely type definitions from your database. That's it.",
                },
                {
                    message: 'SvelteKitAPI',
                    name: 'kit-api',
                    hint: 'Typesafe API + Client for SvelteKit',
                },
            ],
        } as const);

        const templateFolder = Path.join(__dirname, 'templates', 'sveltekit');

        const pm = new PackageManager(path);
        pm.name = name;

        if (!fs.existsSync(Path.join(path, 'src', 'lib', 'server'))) {
            fs.mkdirSync(Path.join(path, 'src', 'lib', 'server'));
        }

        if (tools.includes('default')) {
            copyFiles(
                templateFolder,
                path,
                [
                    { path: '.env.example', replace: ['%%KYSELY%%', '%%CODEGEN%%', '%%COOKIES%%'] },
                    'src/lib/functions.ts',
                ],
                {
                    '%%KYSELY%%': tools.includes('kysely')
                        ? 'DATABASE_IP=10.10.10.223\nDATABASE_PORT=3306\nDATABASE_USER=superclovek\nDATABASE_PASSWORD=tajnyheslo123456\nDATABASE_NAME=db'
                        : '',
                    '%%CODEGEN%%': tools.includes('kysely-codegen')
                        ? 'DATABASE_URL=mysql://superclovek:tajnyheslo123456@10.10.10.223:3306/db'
                        : '',
                    '%%COOKIES%%': tools.includes('cookies')
                        ? 'JWT_SECRET=text\n#v sekundách (10 min =  10 * 60)\n#expiruje pouze pokud uživatel danou dobu nic nedělá (neprochází stránky)\nCOOKIE_EXPIRE=1200\n#v sekundách (5 minut = 5 * 60)\nPUBLIC_CHECK_COOKIE_INTERVAL=300'
                        : '',
                },
            );
            pm.mergePackages(PACKAGE_LIST.defualt);
        }

        if (tools.includes('authme')) {
            pm.addPackage('bcrypt', '^5.1.1');
            pm.addPackage('@types/bcrypt', '^5.0.2', true);

            copyFiles(templateFolder, path, ['src/lib/server/authme/main.ts']);
        }

        let variablesImports = '';
        let variablesCode = '';
        let secrets: string[] = [];

        if (tools.includes('cookies')) {
            pm.mergePackages(PACKAGE_LIST.cookies);
            pm.mergePackages(PACKAGE_LIST.cookies_dev, true);
            copyFiles(templateFolder, path, ['src/lib/server/cookies/main.ts']);
            secrets.push('JWT_SECRET');
            variablesImports += "import { JWTCookies } from './cookies/main'\n";
            variablesCode += 'export const jwt = new JWTCookies(JWT_SECRET)\n';
        }

        if (tools.includes('kysely')) {
            pm.mergePackages(PACKAGE_LIST.kysely);
            secrets = secrets.concat([
                'DATABASE_NAME',
                'DATABASE_IP',
                'DATABASE_PASSWORD',
                'DATABASE_PORT',
                'DATABASE_USER',
            ]);
            variablesImports += "import { Kysely, MysqlDialect } from 'kysely'\nimport { createPool } from 'mysql2'\n";
            variablesCode +=
                'const dialect = new MysqlDialect({\n    pool: createPool({\n        host: DATABASE_IP,\n        port: parseInt(DATABASE_PORT),\n        user: DATABASE_USER,\n        password: DATABASE_PASSWORD,\n        database: DATABASE_NAME\n    })\n})\n\nexport const conn = new Kysely<DB>({\n    dialect\n})';

            if (!tools.includes('kysely-codegen')) {
                copyFiles(templateFolder, path, ['src/types/types.ts']);
            }
        }

        if (tools.includes('kysely-codegen')) {
            pm.addPackage('kysely-codegen', '^0.17.0', true);
            pm.scripts.genDatabaseSchema = 'kysely-codegen --out-file ./src/types/database.ts';
        }

        if (tools.includes('kit-api')) {
            pm.mergePackages(PACKAGE_LIST.svelte_api);

            const suffix = pm.hasPackage('tailwindcss') ? '_apitw' : '_api';

            copyFiles(templateFolder, path, [
                'src/routes/+layout.server.ts',
                'src/routes/+layout.svelte' + suffix,
                'src/routes/+page.svelte' + suffix,
                'src/routes/+page.server.ts',
                'src/routes/api/[...data]/+server.ts',
                'src/lib/api.ts',
                'src/lib/server/server.ts',
                'src/lib/server/api.ts',
                'src/lib/server/context.ts',
                'src/lib/server/routes.ts',
            ]);
        }

        copyFiles(
            templateFolder,
            path,
            [{ path: 'src/lib/server/variables.ts', replace: ['%%VARIABLES%%', '%%IMPORTS%%', '%%CODE%%'] }],
            {
                '%%VARIABLES%%': secrets.join(', '),
                '%%IMPORTS%%': variablesImports,
                '%%CODE%%': variablesCode,
            },
        );

        const { adapter } = await prompt({
            name: 'adapter',
            type: 'select',
            message: 'Select Svelte Adapter to use',
            choices: [
                {
                    message: 'Cloudflare',
                    name: 'cloudflare',
                    hint: 'for Cloudflare pages',
                },
                {
                    message: 'Cloudflare Workers',
                    name: 'cloudflare-workers',
                    hint: 'for Clouflare Workers',
                },
                {
                    message: 'Netlify',
                    name: 'netlify',
                    hint: 'for Netlify',
                },
                {
                    message: 'Node',
                    name: 'node',
                    hint: 'for Node servers',
                },
                {
                    message: 'Static',
                    name: 'static',
                    hint: 'for static site generation (SSG)',
                },
                {
                    message: 'Vercel',
                    name: 'vercel',
                    hint: 'for Vercel',
                },
            ],
        } as const);

        pm.removePackage('@sveltejs/adapter-auto', true);
        pm.addPackage(`@sveltejs/adapter-${adapter}`, adapterVersions[adapter], true);

        if (adapter == 'node') {
            if (tools.includes('default')) {
                pm.scripts.start = 'node -r dotenv/config build';
            } else {
                pm.scripts.start = 'node build';
            }
        }

        const envFile = Path.join(path, '.env.example');

        copyFiles(
            templateFolder,
            path,
            [
                {
                    path: 'README.md',
                    replace: ['%%DESC%%', '%%ENV%%'],
                },
                {
                    path: 'svelte.config.js',
                    replace: ['%%ADAPTER%%', '%%CONFIG%%'],
                },
            ],
            {
                '%%DESC%%':
                    adapter == 'node'
                        ? 'Start builded app using `npm run start` with [Node Adapter](https://kit.svelte.dev/docs/adapter-node) or config command in package.json using your own [Adapter](https://kit.svelte.dev/docs/adapters)'
                        : '',
                '%%ENV%%': fs.existsSync(envFile)
                    ? '## Example ENV file (.env.example)\n\n```YAML\n' + fs.readFileSync(envFile) + '\n```'
                    : '',
                '%%ADAPTER%%': adapter,
                '%%CONFIG%%': "\n        alias: {\n            '$/*': 'src/*',\n        },",
            },
        );

        //put own prettier config

        if (pm.hasPackage('prettier')) {
            try {
                const file = Path.join(path, '.prettierrc');
                const prettierCfg = fs.readFileSync(file, 'utf8');

                const parsed = JSON.parse(prettierCfg);

                parsed.useTabs = false;
                parsed.tabWidth = 4;
                parsed.printWidth = 180;

                fs.writeFileSync(file, JSON.stringify(parsed, null, 4));
            } catch (_) {
                //Empty
            }
        }

        pm.write();

        const { install } = await prompt({
            name: 'install',
            message: 'Do you want to install packages?',
            type: 'confirm',
        });

        if (install) {
            Logger.log('Installing packages...');
            await main.execute(`${main.packageProgram} install`, path);
        }

        if (install && pm.hasPackage('prettier')) {
            const { format } = await prompt({
                name: 'format',
                message: 'Do you want to format files?',
                type: 'confirm',
            });

            if (format) {
                Logger.log('Formatting files...');
                await main.execute(`${main.packageProgram} run format`, path);
            }
        }

        const { git } = await prompt({
            name: 'git',
            message: 'Do you want to init git?',
            type: 'confirm',
        });

        if (git) {
            Logger.log('Initializing git...');
            await main.execute('git init', path);
        }

        Logger.log('Project installed');
    },
} satisfies BaseProject;
