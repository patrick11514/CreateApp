"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("../lib/logger");
const packageLib_1 = require("../lib/packageLib");
const prompt_1 = require("../lib/prompt");
const utilts_1 = require("../lib/utilts");
const PACKAGE_LIST = {
    tailwindcss: [
        ['tailwindcss', '^3.4.1'],
        ['postcss', '^8.4.35'],
        ['autoprefixer', '^10.4.17'],
    ],
    prettier: [['prettier-plugin-tailwindcss', '^0.5.11']],
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
};
const adapterVersions = {
    cloudflare: '^4.4.0',
    'cloudflare-workers': '^2.4.0',
    netlify: '^4.2.0',
    node: '^5.0.1',
    static: '^3.0.1',
    vercel: '^5.3.0',
};
exports.default = {
    name: 'SvelteKit',
    key: 'sveltekit',
    function: async (main, path, name) => {
        const { create } = await import('create-svelte');
        logger_1.Logger.log(`You've selected ${cli_color_1.default.red('SvelteKit Application')}`);
        console.log(node_path_1.default.join(__dirname, '..'));
        const { type, checking, features, svelte_5_beta } = await (0, prompt_1.prompt)([
            {
                name: 'type',
                type: 'select',
                message: 'Which app do you want to create?',
                choices: [
                    {
                        name: 'default',
                        message: 'Demo app',
                        hint: 'Default app with example project',
                    },
                    {
                        name: 'skeleton',
                        message: 'Skeleton project',
                        hint: 'Clear skeleton app',
                    },
                    {
                        name: 'skeletonlib',
                        message: 'Library project',
                        hint: 'Skeleton app for library',
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
                        name: 'null',
                    },
                ],
            },
            {
                name: 'features',
                type: 'multiselect',
                message: 'Which additional options, do you want to use?',
                choices: [
                    {
                        message: 'ESLint',
                        name: 'eslint',
                    },
                    {
                        message: 'Prettier',
                        name: 'prettier',
                    },
                    {
                        message: 'Playwright',
                        name: 'playwright',
                    },
                    {
                        message: 'Vitest',
                        name: 'vitest',
                    },
                ],
            },
            {
                name: 'svelte_5_beta',
                type: 'confirm',
                message: 'Use svelte beta?',
            },
        ]);
        await create(path, {
            name,
            template: type,
            types: checking === 'null' ? null : checking,
            eslint: features.includes('eslint'),
            playwright: features.includes('playwright'),
            prettier: features.includes('prettier'),
            vitest: features.includes('vitest'),
            svelte5: svelte_5_beta,
        });
        node_fs_1.default.appendFileSync(node_path_1.default.join(path, '.gitignore'), '#lock files\npackage-lock.json\nyarn.lock\npnpm-lock.yaml');
        const { tools } = await (0, prompt_1.prompt)({
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
            ],
        });
        const templateFolder = node_path_1.default.join(__dirname, 'templates', 'sveltekit');
        if (features.includes('prettier')) {
            logger_1.Logger.log('Creating prettier config...');
            (0, utilts_1.copyFiles)(templateFolder, path, [
                {
                    path: '.prettierrc',
                    replace: ['%PLUGINS%'],
                },
            ], {
                '%PLUGINS%': tools.includes('tailwindcss')
                    ? '"prettier-plugin-svelte", "prettier-plugin-tailwindcss"'
                    : '"prettier-plugin-svelte"',
            });
        }
        const pm = new packageLib_1.PackageManager(path);
        if (!node_fs_1.default.existsSync(node_path_1.default.join(path, 'src', 'lib', 'server'))) {
            node_fs_1.default.mkdirSync(node_path_1.default.join(path, 'src', 'lib', 'server'));
        }
        if (tools.includes('tailwindcss')) {
            logger_1.Logger.log('Adding tailwindcss...');
            pm.mergePackages(PACKAGE_LIST.tailwindcss, true);
            if (features.includes('prettier')) {
                pm.mergePackages(PACKAGE_LIST.prettier, true);
            }
            (0, utilts_1.copyFiles)(templateFolder, path, [
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
        }
        else {
            pm.scripts.lint = 'prettier --plugin prettier-plugin-svelte --check .';
            if (features.includes('eslint')) {
                pm.scripts.lint += ' && eslint .';
            }
            pm.scripts.format = 'prettier --plugin prettier-plugin-svelte --write .';
        }
        if (tools.includes('default')) {
            (0, utilts_1.copyFiles)(templateFolder, path, [
                { path: '.env.example', replace: ['%%KYSELY%%', '%%CODEGEN%%', '%%COOKIES%%'] },
                'src/lib/functions.ts',
            ], {
                '%%KYSELY%%': tools.includes('kysely')
                    ? 'DATABASE_IP=10.10.10.223\nDATABASE_PORT=3306\nDATABASE_USER=superclovek\nDATABASE_PASSWORD=tajnyheslo123456\nDATABASE_NAME=db'
                    : '',
                '%%CODEGEN%%': tools.includes('kysely-codegen')
                    ? 'DATABASE_URL=mysql://superclovek:tajnyheslo123456@10.10.10.223:3306/db'
                    : '',
                '%%COOKIES%%': tools.includes('cookies')
                    ? 'JWT_SECRET=text\n#v sekundách (10 min =  10 * 60)\n#expiruje pouze pokud uživatel danou dobu nic nedělá (neprochází stránky)\nCOOKIE_EXPIRE=1200\n#v sekundách (5 minut = 5 * 60)\nPUBLIC_CHECK_COOKIE_INTERVAL=300'
                    : '',
            });
        }
        if (tools.includes('authme')) {
            pm.addPackage('bcrypt', '^5.1.1');
            pm.addPackage('@types/bcrypt', '^5.0.2', true);
            (0, utilts_1.copyFiles)(templateFolder, path, ['src/lib/server/authme/main.ts']);
        }
        let variablesImports = '';
        let variablesCode = '';
        let secrets = [];
        if (tools.includes('cookies')) {
            pm.mergePackages(PACKAGE_LIST.cookies);
            pm.mergePackages(PACKAGE_LIST.cookies_dev, true);
            (0, utilts_1.copyFiles)(templateFolder, path, ['src/lib/server/cookies/main.ts']);
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
                (0, utilts_1.copyFiles)(templateFolder, path, ['src/types/types.ts']);
            }
        }
        if (tools.includes('kysely-codegen')) {
            pm.scripts.genDatabaseSchema = 'kysely-codegen --out-file ./src/types/database.ts';
        }
        (0, utilts_1.copyFiles)(templateFolder, path, [{ path: 'src/lib/server/variables.ts', replace: ['%%VARIABLES%%', '%%IMPORTS%%', '%%CODE%%'] }], {
            '%%VARIABLES%%': secrets.join(', '),
            '%%IMPORTS%%': variablesImports,
            '%%CODE%%': variablesCode,
        });
        const { adapter } = await (0, prompt_1.prompt)({
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
        });
        pm.removePackage('@sveltejs/adapter-auto');
        pm.addPackage(`@sveltejs/adapter-${adapter}`, adapterVersions[adapter]);
        if (adapter == 'node') {
            if (tools.includes('default')) {
                pm.scripts.start = 'node -r dotenv/config build';
            }
            else {
                pm.scripts.start = 'node build';
            }
        }
        const envFile = node_path_1.default.join(path, '.env.example');
        (0, utilts_1.copyFiles)(templateFolder, path, [
            {
                path: 'README.md',
                replace: ['%%DESC%%', '%%ENV%%'],
            },
            {
                path: 'svelte.config.js',
                replace: ['%%ADAPTER%%', '%%CONFIG%%'],
            },
        ], {
            '%%DESC%%': adapter == 'node'
                ? 'Start builded app using `npm run start` with [Node Adapter](https://kit.svelte.dev/docs/adapter-node) or config command in package.json using your own [Adapter](https://kit.svelte.dev/docs/adapters)'
                : '',
            '%%ENV%%': node_fs_1.default.existsSync(envFile)
                ? '## Example ENV file (.env.example)\n\n```YAML\n' + node_fs_1.default.readFileSync(envFile) + '\n```'
                : '',
            '%%ADAPTER%%': adapter,
            '%%CONFIG%%': "\n        alias: {\n            '$/*': 'src/*',\n        },",
        });
        pm.write();
        const { install } = await (0, prompt_1.prompt)({
            name: 'install',
            message: 'Do you want to install packages?',
            type: 'confirm',
        });
        if (install) {
            logger_1.Logger.log('Installing packages...');
            await main.execute(`${main.packageProgram} install`, path);
        }
        if (install && features.includes('prettier')) {
            const { format } = await (0, prompt_1.prompt)({
                name: 'format',
                message: 'Do you want to format files?',
                type: 'confirm',
            });
            if (format) {
                logger_1.Logger.log('Formatting files...');
                await main.execute(`${main.packageProgram} run format`, path);
            }
        }
        const { git } = await (0, prompt_1.prompt)({
            name: 'git',
            message: 'Do you want to init git?',
            type: 'confirm',
        });
        if (git) {
            logger_1.Logger.log('Initializing git...');
            await main.execute('git init', path);
        }
        logger_1.Logger.log('Project installed');
    },
};
