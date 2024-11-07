import clc from 'cli-color';
import fs from 'node:fs';
import Path from 'node:path';
import { BaseProject } from '../lib/baseProject';
import { Logger } from '../lib/logger';
import { Main } from '../lib/main';
import { PackageList, PackageManager } from '../lib/packageLib';
import { prompt } from '../lib/prompt';
import { copyFiles } from '../lib/utilts';
import { adders } from '../lib/adders';

const PACKAGE_LIST = {
    eslint: [
        ['@types/eslint', '^9.6.0'],
        ['eslint', '^9.7.0'],
        ['eslint-plugin-svelte', '^2.36.0'],
        ['typescript-eslint', '^8.0.0'],
    ],
    tailwindcss: [
        ['tailwindcss', '^3.4.1'],
        ['postcss', '^8.4.35'],
        ['autoprefixer', '^10.4.17'],
    ],
    prettier: [
        ['prettier', '^3.3.2'],
        ['prettier-plugin-svelte', '^3.2.6'],
    ],
    tailwindcss_prettier: [['prettier-plugin-tailwindcss', '^0.5.11']],
    eslint_prettier: [['eslint-config-prettier', '^9.1.0']],
    defualt: [
        ['zod', '^3.22.4'],
        ['dotenv', '^16.4.5'],
    ],
    cookies: [
        ['jsonwebtoken', '^9.0.2'],
        ['simple-json-db', '^2.0.0'],
        ['uuid', '^9.0.1'],
    ],
    cookies_dev: [
        ['@types/jsonwebtoken', '^9.0.5'],
        ['@types/uuid', '^9.0.8'],
    ],
    kysely: [
        ['kysely', '^0.27.2'],
        ['mysql2', '^3.9.1'],
    ],
    svelte_api: [
        ['zod', '^3.22.4'],
        ['@patrick115/sveltekitapi', '^1.2.2'],
    ],
} as const satisfies Record<string, PackageList>;

const adapterVersions = {
    cloudflare: '^4.4.0',
    'cloudflare-workers': '^2.4.0',
    netlify: '^4.2.0',
    node: '^5.0.1',
    static: '^3.0.1',
    vercel: '^5.3.0',
} as const;

export default {
    name: 'SvelteKit',
    key: 'sveltekit',
    function: async (main: Main, path: string, name: string) => {
        const { create } = await import('sv');

        Logger.log(`You've selected ${clc.red('SvelteKit Application')}`);

        console.log(Path.join(__dirname, '..'));

        const { type, checking } = await prompt([
            {
                name: 'type',
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
                        hint: 'Project for library',
                    },
                ],
            },
            {
                name: 'checking',
                type: 'select',
                message: 'Which type checking do you want to use?',
                choices: [
                    {
                        message: 'JS + JSDoc comments',
                        name: 'checkjs',
                    },
                    {
                        message: 'TypeScript',
                        name: 'typescript',
                    },
                    {
                        message: 'None',
                        name: 'none',
                    },
                ],
            },
        ] as const);

        await create(path, {
            name,
            template: type,
            types: checking,
        });

        const pm = new PackageManager(path);

        //handle custom adders
        //
        const { features } = await prompt([
            {
                name: 'features',
                type: 'multiselect',
                message: 'Which additional options, do you want to use?',
                choices: adders.map((adder) => {
                    return {
                        message: adder.name,
                        name: adder.name,
                        hint: adder.description,
                    };
                }),
            },
        ] as const);

        const adderFunctions = Object.fromEntries(adders.map((adder) => [adder.name, adder.run]));

        Logger.log('Adding features...');

        const templateFolder = Path.join(__dirname, 'templates', 'sveltekit');

        for (const feature of features) {
            adderFunctions[feature]?.(path, pm, templateFolder);
        }

        //append lock files to gitignore
        fs.appendFileSync(Path.join(path, '.gitignore'), '#lock files\npackage-lock.json\nyarn.lock\npnpm-lock.yaml');

        const { tools } = await prompt({
            name: 'tools',
            type: 'multiselect',
            message: 'Select additional things to install',
            choices: [
                {
                    message: 'TailwindCSS',
                    name: 'tailwindcss',
                },
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

        if (features.includes('prettier')) {
            Logger.log('Creating prettier config...');

            copyFiles(
                templateFolder,
                path,
                [
                    {
                        path: '.prettierrc',
                        replace: ['%PLUGINS%'],
                    },
                ],
                {
                    '%PLUGINS%': tools.includes('tailwindcss')
                        ? '"prettier-plugin-svelte", "prettier-plugin-tailwindcss"'
                        : '"prettier-plugin-svelte"',
                },
            );
        }

        if (!fs.existsSync(Path.join(path, 'src', 'lib', 'server'))) {
            fs.mkdirSync(Path.join(path, 'src', 'lib', 'server'));
        }

        if (tools.includes('tailwindcss')) {
            Logger.log('Adding tailwindcss...');
            pm.mergePackages(PACKAGE_LIST.tailwindcss, true);

            if (features.includes('prettier')) {
                pm.mergePackages(PACKAGE_LIST.prettier, true);
            }

            copyFiles(templateFolder, path, [
                'postcss.config.js',
                'tailwind.config.js',
                'src/app.css',
                'src/routes/+layout.svelte',
                'src/routes/+page.svelte',
            ]);

            pm.scripts.lint = 'prettier --plugin prettier-plugin-svelte --plugin prettier-plugin-tailwindcss --check .';
            if (features.includes('eslint')) {
                pm.scripts.lint += ' && eslint .';
            }

            pm.scripts.format =
                'prettier --plugin prettier-plugin-svelte --plugin prettier-plugin-tailwindcss --write .';
        } else {
            pm.scripts.lint = 'prettier --plugin prettier-plugin-svelte --check .';
            if (features.includes('eslint')) {
                pm.scripts.lint += ' && eslint .';
            }

            pm.scripts.format = 'prettier --plugin prettier-plugin-svelte --write .';
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
            pm.addPackage('kysely-codegen', '^0.11.0', true);
            pm.scripts.genDatabaseSchema = 'kysely-codegen --out-file ./src/types/database.ts';
        }

        if (tools.includes('kit-api')) {
            pm.mergePackages(PACKAGE_LIST.svelte_api);

            const suffix = tools.includes('tailwindcss') ? '_apitw' : '_api';

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

        pm.removePackage('@sveltejs/adapter-auto');
        pm.addPackage(`@sveltejs/adapter-${adapter}`, adapterVersions[adapter]);

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

        if (install && features.includes('prettier')) {
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
