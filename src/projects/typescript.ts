import clc from 'cli-color';
import fs from 'node:fs';
import Path from 'node:path';
import { Logger } from '../lib/logger';
import { Main } from '../lib/main';
import { PackageList, PackageManager } from '../lib/packageLib';
import { prompt } from '../lib/prompt';
import { copyFiles } from '../lib/utilts';

const PACKAGE_LIST = {
    defaultDev: [
        ['ts-node-dev', '^2.0.0'],
        ['typescript', '^5.4.4'],
        ['@types/node', '^20.12.7'],
        ['@types/cli-color', '^2.0.6'],
    ],
    default: [
        ['cli-color', '^2.0.4'],
        ['dotenv', '^16.4.5'],
        ['zod', '^3.23.4'],
    ],
    kysely: [
        ['kysely', '^0.27.2'],
        ['mysql2', '^3.9.1'],
        ['kysely-codegen', ''],
    ],
    logger: [['strip-color', '^0.1.0']],
    loggerDev: [['@types/strip-color', '^0.1.2']],
} as const satisfies Record<string, PackageList>;

export default {
    name: 'Typescript Project',
    key: 'typescript',
    function: async (main: Main, path: string, name: string) => {
        Logger.log(`You selected: ${clc.red('Typescript project')}`);

        const { features, dependencies } = await prompt([
            {
                name: 'features',
                message: 'Select features to install.',
                type: 'multiselect',
                choices: [
                    {
                        name: 'logger',
                        message: 'Logger',
                        hint: 'Logger for logging messages and saving logs to file',
                    },
                ],
            },
            {
                name: 'dependencies',
                type: 'multiselect',
                message: 'Select dependencies to add',
                choices: [
                    {
                        name: 'simple-json-db',
                        message: 'Simple JSON Database',
                    },
                    {
                        name: 'database',
                        message: 'Database connector',
                    },
                    {
                        name: 'fetch',
                        message: 'Node fetch',
                    },
                    {
                        name: 'express',
                        message: 'ExpressJS',
                    },
                    {
                        name: 'prettier',
                        message: 'Prettier',
                    },
                    {
                        name: 'zod',
                        message: 'Zod',
                    },
                    {
                        name: 'paths',
                        message: 'Custom paths',
                    },
                ],
            },
        ] as const);

        fs.mkdirSync(path, { recursive: true });

        const templateFolder = Path.join(__dirname, 'templates', 'typescript');

        copyFiles(
            templateFolder,
            path,
            [
                {
                    path: 'package.json',
                    replace: ['%%NAME%%'],
                },
                'src/types/types.ts',
            ],
            {
                '%%NAME%%': name,
            }
        );

        const pm = new PackageManager(path);

        pm.mergePackages(PACKAGE_LIST.defaultDev, true);
        pm.mergePackages(PACKAGE_LIST.default);

        if (dependencies.includes('database')) {
            const { type } = await prompt([
                {
                    name: 'type',
                    type: 'select',
                    message: 'Select database connector',
                    choices: [
                        {
                            name: 'mariadb',
                            message: 'Connector for MariaDB',
                        },
                        {
                            name: 'kysely',
                            message: 'Kysely',
                            hint: 'The type-safe SQL query builder for TypeScript',
                        },
                    ],
                },
            ] as const);

            if (type == 'mariadb') {
                pm.addPackage('mariadb', '^3.3.0');
            } else {
                pm.mergePackages(PACKAGE_LIST.kysely);
                pm.addPackage('kysely-codegen', '^0.15.0', true);
                pm.scripts.genDatabaseSchema = 'kysely-codegen --out-file ./src/types/database.ts';

                copyFiles(templateFolder, path, ['.env.example_db', 'src/types/env.ts_db', 'src/types/connection.ts']);
            }
        } else {
            copyFiles(templateFolder, path, ['.env.example', 'src/types/env.ts']);
        }

        if (dependencies.includes('express')) {
            pm.addPackage('express', '4.19.2');
            pm.addPackage('@types/express', '4.17.21', true);
        }

        if (dependencies.includes('fetch')) {
            pm.addPackage('node-fetch', '^3.3.0');
        }

        if (dependencies.includes('paths')) {
            pm.addPackage('module-alias', '^2.2.3');
            pm.addPackage('tsconfig-paths', '^4.2.0', true);
            pm.scripts.dev = 'ts-node-dev -r tsconfig-paths/register --respawn ./src/index.ts';
            pm.scripts.start = 'node -r module-alias/register ./build/index.js';
            pm.additional['_moduleAlias'] = {
                $: './build',
            };

            copyFiles(templateFolder, path, ['tsconfig.json_path']);
        } else {
            copyFiles(templateFolder, path, ['tsconfig.json']);
        }

        if (dependencies.includes('prettier')) {
            copyFiles(templateFolder, path, ['.prettierrc']);
            pm.addPackage('prettier', '^3.1.0');
            pm.scripts.format = 'prettier --write .';
        }

        if (dependencies.includes('simple-json-db')) {
            pm.addPackage('simple-json-db', '^2.0.0');
        }

        if (dependencies.includes('zod')) {
            pm.addPackage('zod', '^3.23.4');
        }

        if (features.includes('logger')) {
            pm.mergePackages(PACKAGE_LIST.logger);
            pm.mergePackages(PACKAGE_LIST.loggerDev);

            copyFiles(templateFolder, path, ['src/index.ts_logger', 'src/lib/logger.ts']);

            fs.mkdirSync(Path.join(path, 'logs'));
        } else {
            copyFiles(templateFolder, path, ['src/index.ts']);
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

        if (install && dependencies.includes('prettier')) {
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
};
