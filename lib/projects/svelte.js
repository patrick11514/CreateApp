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
    name: 'Svelte App',
    key: 'svelte',
    function: async (path, name) => {
        (0, __1._)('text', `You selected: ${cli_color_1.default.red('Svelte Application')}`);
        const { type, checking, features, svelte_5_beta } = await enquirer_1.default.prompt([
            {
                name: 'type',
                type: 'select',
                message: 'Which app do you want to create?',
                choices: [
                    {
                        message: 'Demo App',
                        name: 'default',
                        hint: 'Default app with example project',
                    },
                    {
                        message: 'Skeleton Project',
                        name: 'skeleton',
                        hint: 'Clear skeleton app',
                    },
                    {
                        message: 'Library Project',
                        name: 'skeletonlib',
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
                        message: 'Nothing',
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
        let createCommand = `${__1.packageProgram} create svelte-with-args --name=${name} --directory=./ `;
        createCommand += `--template=${type} `;
        createCommand += `--types=${checking} `;
        createCommand += `--prettier=${features.includes('prettier')} `;
        createCommand += `--eslint=${features.includes('eslint')} `;
        createCommand += `--playwright=${features.includes('playwright')} `;
        createCommand += `--vitest=${features.includes('vitest')} `;
        createCommand += `--svelte5=${svelte_5_beta}`;
        (0, __1._)('text', cli_color_1.default.green('Creating Svelte Project...'));
        await (0, __1._c)(createCommand, path);
        if (node_fs_1.default.existsSync(node_path_1.default.join(path, 'src', 'lib', 'index.ts'))) {
            node_fs_1.default.unlinkSync(node_path_1.default.join(path, 'src', 'lib', 'index.ts'));
        }
        const gitignore = `#lock files
pnpm-lock.yaml
package-lock.json
yarn.lock`;
        node_fs_1.default.appendFileSync(node_path_1.default.join(path, '.gitignore'), gitignore);
        const { tools } = await enquirer_1.default.prompt({
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
        if (features.includes('prettier')) {
            (0, __1._)('text', 'Creating prettier config...');
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, '.prettierrc'), `{
    "useTabs": false,
    "tabWidth": 4,
    "singleQuote": true,
    "trailingComma": "none",
    "printWidth": 180,
    "semi": false,
    "plugins": ["prettier-plugin-svelte"${tools.includes('tailwindcss') ? ', "prettier-plugin-tailwindcss"' : ''}],
    "overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}`);
        }
        let packages = [];
        let devPackages = [];
        if (!node_fs_1.default.existsSync(node_path_1.default.join(path, 'src', 'lib', 'server'))) {
            node_fs_1.default.mkdirSync(node_path_1.default.join(path, 'src', 'lib', 'server'));
        }
        if (tools.includes('tailwindcss')) {
            (0, __1._)('text', 'Adding tailwindcss...');
            devPackages = devPackages.concat(['tailwindcss', 'postcss', 'autoprefixer', 'prettier-plugin-tailwindcss']);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'postcss.config.js'), `export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}
`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'app.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'routes', '+layout.svelte'), `<script>
    import "../app.css";
</script>

<slot />`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'routes', '+page.svelte'), `<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
    <span class="text-red-500">text-red-500</span>
</p>`);
        }
        (0, __1._)('text', 'Adding default packages...');
        if (tools.includes('default')) {
            packages = packages.concat(['zod', 'dotenv']);
            let env = `#webserver config
HOST=0.0.0.0
PORT=5178
ORIGIN=http://localhost:5178`;
            if (tools.includes('kysely')) {
                env += `\n#database config
DATABASE_IP=10.10.10.223
DATABASE_PORT=3306
DATABASE_USER=superclovek
DATABASE_PASSWORD=tajnyheslo123456`;
            }
            if (tools.includes('kysely-codegen')) {
                env += `\nDATABASE_URL=mysql://superclovek:tajnyheslo123456@10.10.10.223:3306`;
            }
            if (tools.includes('cookies')) {
                env += `\n#secret pro JWT (tím se bude podepisovat JWT token - https://jwt.io/)
JWT_SECRET=text
#v sekundách (10 min =  10 * 60)
#expiruje pouze pokud uživatel danou dobu nic nedělá (neprochází stránky)
COOKIE_EXPIRE=1200
#v sekundách (5 minut = 5 * 60)
PUBLIC_CHECK_COOKIE_INTERVAL=300`;
            }
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, '.env.example'), env);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'lib', 'functions.ts'), `export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}`);
            node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'src', 'lib', 'server', 'functions.ts'), `import { json } from '@sveltejs/kit'
import type { z } from 'zod'

export const checkData = async <T>(request: Request, obj: z.ZodType<T>): Promise<Response | z.infer<typeof obj>> => {
    let data

    try {
        data = await request.json()
    } catch (_) {
        return json({
            status: false,
            error: 'Invalid data'
        })
    }

    const resp = obj.safeParse(data)

    if (resp.success) {
        return resp.data
    }

    return json({
        status: false,
        error: resp.error
    })
}

export const isOk = (data: Response | unknown): data is Response => {
    return data instanceof Response
}`);
        }
        if (tools.includes('authme')) {
            (0, __1._)('text', 'Adding authme...');
            packages.push('bcrypt');
            devPackages.push('@types/bcrypt');
            const request = await fetch('https://raw.githubusercontent.com/patrick11514/MyStuff/main/LIBS/src/authme/main.ts');
            const data = await request.text();
            const serverPath = node_path_1.default.join(path, 'src', 'lib', 'server');
            if (!node_fs_1.default.existsSync(node_path_1.default.join(serverPath, 'authme'))) {
                node_fs_1.default.mkdirSync(node_path_1.default.join(serverPath, 'authme'));
            }
            node_fs_1.default.writeFileSync(node_path_1.default.join(serverPath, 'authme', 'main.ts'), data);
        }
        if (tools.includes('cookies')) {
            (0, __1._)('text', 'Adding cookies...');
            packages = packages.concat(['async-lz-string', 'jsonwebtoken', 'simple-json-db', 'uuid']);
            devPackages = devPackages.concat(['@types/uuid', '@types/jsonwebtoken']);
            const request = await fetch('https://raw.githubusercontent.com/patrick11514/MyStuff/main/LIBS/src/cookies/main.ts');
            const data = await request.text();
            const serverPath = node_path_1.default.join(path, 'src', 'lib', 'server');
            if (!node_fs_1.default.existsSync(node_path_1.default.join(serverPath, 'cookies'))) {
                node_fs_1.default.mkdirSync(node_path_1.default.join(serverPath, 'cookies'));
            }
            node_fs_1.default.writeFileSync(node_path_1.default.join(serverPath, 'cookies', 'main.ts'), data);
            node_fs_1.default.appendFileSync(node_path_1.default.join(serverPath, 'variables.ts'), `import { JWT_SECRET} from '$env/static/private'
import { JWTCookies } from './cookies/main'
export const jwt = new JWTCookies(JWT_SECRET)\n`);
        }
        if (tools.includes('kysely')) {
            (0, __1._)('text', 'Adding kysely...');
            packages.push('kysely');
            packages.push('mysql2');
            const serverPath = node_path_1.default.join(path, 'src', 'lib', 'server');
            node_fs_1.default.appendFileSync(node_path_1.default.join(serverPath, 'variables.ts'), `import { DATABASE_DATABASE, DATABASE_IP, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USER, JWT_SECRET } from '$env/static/private'
import type { Database } from '$types/${tools.includes('kysely-codegen') ? 'database' : 'types'}'
import { Kysely, MysqlDialect } from 'kysely'
import { createPool } from 'mysql2'


const dialect = new MysqlDialect({
    pool: createPool({
        host: DATABASE_IP,
        port: parseInt(DATABASE_PORT),
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
        database: DATABASE_DATABASE
    })
})

export const conn = new Kysely<Database>({
    dialect
})\n`);
            const typesPath = node_path_1.default.join(path, 'src', 'types');
            if (!node_fs_1.default.existsSync(typesPath)) {
                node_fs_1.default.mkdirSync(typesPath);
            }
            if (!tools.includes('kysely-codegen')) {
                node_fs_1.default.writeFileSync(node_path_1.default.join(typesPath, 'types.ts'), `import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
export interface Database {
    example: exampleTable
}

export interface exampleTable {
    id: Generated<number>
    name: string
}

export type Example = Selectable<exampleTable>
export type NewExample = Insertable<exampleTable>
export type ExampleUpdate = Updateable<exampleTable>`);
            }
        }
        if (tools.includes('kysely-codegen')) {
            (0, __1._)('text', 'Adding kysely-codegen...');
            devPackages.push('kysely-codegen');
            if (!packages.includes('mysql2')) {
                devPackages.push('mysql2');
            }
        }
        const data = node_fs_1.default.readFileSync(node_path_1.default.join(path, 'package.json'));
        const packageJson = JSON.parse(data.toString());
        (0, __1._)('text', 'Adding tailwindcss...');
        if (tools.includes('tailwindcss')) {
            packageJson.scripts.lint =
                'prettier --plugin prettier-plugin-svelte --plugin prettier-plugin-tailwindcss --check .';
            if (features.includes('eslint')) {
                packageJson.scripts.lint += ' && eslint .';
            }
            packageJson.scripts.format =
                'prettier --plugin prettier-plugin-svelte --plugin prettier-plugin-tailwindcss --write .';
        }
        else {
            packageJson.scripts.lint = 'prettier --plugin prettier-plugin-svelte --check .';
            if (features.includes('eslint')) {
                packageJson.scripts.lint += ' && eslint .';
            }
            packageJson.scripts.format = 'prettier --plugin prettier-plugin-svelte --write .';
        }
        if (tools.includes('kysely-codegen')) {
            packageJson.scripts.genDatabaseSchema = 'kysely-codegen --out-file ./src/types/database.ts';
        }
        const { adapter } = await enquirer_1.default.prompt({
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
        devPackages.push(`@sveltejs/adapter-${adapter}`);
        if (adapter == 'node') {
            if (tools.includes('default')) {
                packageJson.scripts.start = 'node -r dotenv/config build';
            }
            else {
                packageJson.scripts.start = 'node build';
            }
        }
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'package.json'), JSON.stringify(packageJson, null, 4));
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'README.md'), `# Info
...

## Dev mode

\`\`\`bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
\`\`\`

## Build

Building app:

\`\`\`bash
npm run build
\`\`\`

Show builded preview: \`npm run preview\`.
${adapter == 'node'
            ? 'Start builded app using `npm run start` with [Node Adapter](https://kit.svelte.dev/docs/adapter-node) or config command in package.json using your own [Adapter](https://kit.svelte.dev/docs/adapters)'
            : ''} 
${node_fs_1.default.existsSync(node_path_1.default.join(path, '.env.example'))
            ? `
## Example ENV file (.env.example)

\`\`\`YAML
${node_fs_1.default.readFileSync(node_path_1.default.join(path, '.env.example'))}
\`\`\`
`
            : ''}`);
        (0, __1._)('text', 'Installing packages...');
        const arr = packages
            .map((p) => {
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
        await (0, __1._c)(`${__1.packageProgram} remove @sveltejs/adapter-auto`, path);
        const svelteJS = node_fs_1.default.readFileSync(node_path_1.default.join(path, 'svelte.config.js'));
        node_fs_1.default.writeFileSync(node_path_1.default.join(path, 'svelte.config.js'), svelteJS
            .toString()
            .replace(/@sveltejs\/adapter-auto/g, `@sveltejs/adapter-${adapter}`)
            .replace('adapter: adapter()', `adapter: adapter(),
        alias: {
            '$types/*': 'src/types/*',
        }`));
        await (0, __1._c)((0, __1._p)(arr), path);
        (0, __1._)('text', 'Updating packages...');
        if (__1.packageProgram == 'yarn') {
            await (0, __1._c)(`${__1.packageProgram} upgrade`, path);
        }
        else {
            await (0, __1._c)(`${__1.packageProgram} update -L`, path);
        }
        if (features.includes('prettier')) {
            (0, __1._)('text', 'Formatting...');
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
