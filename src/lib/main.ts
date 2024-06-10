import clc from 'cli-color';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import Path from 'node:path';
import { BaseProject } from './baseProject';
import { Logger } from './logger';
import { prompt } from './prompt';

export class Main {
    public packageProgram: 'npm' | 'pnpm' | 'yarn' = 'npm';
    public argumenents = process.argv.slice(2, process.argv.length);

    /**
     * Execute shell command
     * @param command
     * @returns Promise<string>
     */
    async execute(command: string, path?: string) {
        return new Promise<string>((resolve, reject) => {
            exec(`${path ? `cd ${path} && ` : ''}${command}`, (error, stdout) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    public async Start() {
        const osName = os.platform();

        let root: string;

        if (osName == 'win32') {
            root = await this.execute('echo %cd%');
            root = root.trim();
        } else {
            if (process.env.PWD) {
                root = process.env.PWD;
            } else {
                root = os.homedir();
            }
        }

        const pkg = require(Path.join(__dirname, '..', '..', 'package.json'));

        Logger.log(`Welcome in ${clc.redBright('Create Patrick115 App')} version ${clc.yellow(pkg?.version)}`);

        let currentPath = root;
        if (this.argumenents.length == 0) {
            Logger.log('No arguments passed, using current directory');
        } else {
            Logger.log('Using directory from argument');
            currentPath = this.argumenents[0];
        }

        const { path } = await prompt({
            name: 'path',
            message: 'Select path for instalation',
            type: 'input',
            initial: currentPath,
        } as const);

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
            Logger.log(`Created ${clc.cyan(path)}`);
        }

        if (fs.readdirSync(path).length > 0) {
            const { continue: cont } = await prompt({
                name: 'continue',
                type: 'confirm',
                message: 'Folder is not empty, do you want to continue?',
                initial: false,
            } as const);

            if (!cont) {
                Logger.error('Program ended by user');
                return;
            }
        }

        //load projects
        Logger.log('Loading projects...');

        const projects = fs
            .readdirSync(Path.join(__dirname, '../projects'))
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
            .map((file) => require(Path.join(__dirname, '../projects', file)))
            .map((imported) => imported.default) as BaseProject[];

        const data = await prompt([
            {
                name: 'project',
                message: 'Please select project',
                type: 'select',
                choices: projects.map((p) => {
                    return {
                        name: p.key,
                        message: p.name,
                    };
                }),
            },
            {
                name: 'program',
                message: 'Select package manager',
                type: 'select',
                choices: (['npm', 'pnpm', 'yarm'] as const).map((p) => {
                    return {
                        name: p,
                    };
                }),
            },
            {
                name: 'name',
                message: 'Name of project',
                type: 'input',
                validate: (input: string) => {
                    if (input.length == 0) {
                        return 'Please enter a name';
                    }
                    if (input.includes('/') || input.includes('\\')) {
                        return 'Use a valid name';
                    }

                    return true;
                },
                result: (value: string) => {
                    return value.toLowerCase().replaceAll(' ', '_');
                },
            },
        ] as const);

        this.packageProgram = data.program as 'npm' | 'pnpm' | 'yarn';

        const project = projects.find((p) => p.key == data.project);

        if (!project) {
            Logger.error('An error occured while loading project');
            return;
        }

        await project.function(this, Path.resolve(root, path), data.name);
    }
}
