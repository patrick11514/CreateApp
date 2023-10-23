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
    name: 'Typescript Project',
    key: 'typescript',
    function: async (path, name) => {
        (0, __1._)('text', `You selected: ${cli_color_1.default.red('Typescript Application')}`);
        const { extensions, dependencies } = await enquirer_1.default.prompt([
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
        let packages = [];
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
        await (0, __1._c)(`${__1.packageProgram} init ${__1.packageProgram != 'pnpm' ? '-y' : ''}`, path);
        const data = node_fs_1.default.readFileSync(node_path_1.default.join(path, 'package.json'));
        const packageJson = JSON.parse(data.toString());
        packageJson.name = name;
        packageJson.scripts.dev = 'ts-node-dev --respawn ./src/index.ts';
        packageJson.scripts.build = 'mkdir -p build && tsc';
        packageJson.scripts.start = 'node ./build/index.js';
        packageJson.scripts.clear = 'rm -rf build';
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
        if (dependencies.includes('dotenv')) {
            const typesFolder = node_path_1.default.join(path, 'src', 'types');
            if (!node_fs_1.default.existsSync(typesFolder)) {
                node_fs_1.default.mkdirSync(typesFolder, {
                    recursive: true,
                });
            }
            if (dependencies.includes('zod')) {
                node_fs_1.default.writeFileSync(node_path_1.default.join(typesFolder, 'env.ts'), `import { config } from 'dotenv'
import { z } from 'zod'
config()

const schema = z.object({

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
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
    ]
}`);
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
            await (0, __1._c)('git init');
            await (0, __1._c)('git add .');
            await (0, __1._c)("git commit -m 'Initial commit'");
        }
        (0, __1._)('text', cli_color_1.default.green('Instalation complete'));
        (0, __1._)('text', `Now you can use cd ${path} && ${__1.packageProgram} dev to start developing`);
    },
};
