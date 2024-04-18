"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("./logger");
const prompt_1 = require("./prompt");
class Main {
    packageProgram = 'npm';
    argumenents = process.argv.slice(2, process.argv.length);
    async execute(command, path) {
        return new Promise((resolve, reject) => {
            (0, node_child_process_1.exec)(`${path ? `cd ${path} && ` : ''}${command}`, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    async Start() {
        const root = process.env.PWD;
        const pkg = require(node_path_1.default.join(__dirname, '..', '..', 'package.json'));
        logger_1.Logger.log(`Welcome in ${cli_color_1.default.redBright('Create Patrick115 App')} version ${cli_color_1.default.yellow(pkg?.version)}`);
        let currentPath = root;
        if (this.argumenents.length == 0) {
            logger_1.Logger.log('No arguments passed, using current directory');
        }
        else {
            logger_1.Logger.log('Using directory from argument');
            currentPath = this.argumenents[0];
        }
        const { path } = await (0, prompt_1.prompt)({
            name: 'path',
            message: 'Select path for instalation',
            type: 'input',
            initial: currentPath,
        });
        if (!node_fs_1.default.existsSync(path)) {
            await this.execute(`mkdir -p ${path}`);
            logger_1.Logger.log(`Created ${cli_color_1.default.cyan(path)}`);
        }
        if (node_fs_1.default.readdirSync(path).length > 0) {
            const { continue: cont } = await (0, prompt_1.prompt)({
                name: 'continue',
                type: 'confirm',
                message: 'Folder is not empty, do you want to continue?',
                initial: false,
            });
            if (!cont) {
                logger_1.Logger.error('Program ended by user');
                return;
            }
        }
        logger_1.Logger.log('Loading projects...');
        const projects = node_fs_1.default
            .readdirSync(node_path_1.default.join(__dirname, '../projects'))
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
            .map((file) => require(node_path_1.default.join(__dirname, '../projects', file)))
            .map((imported) => imported.default);
        const data = await (0, prompt_1.prompt)([
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
                choices: ['npm', 'pnpm', 'yarm'].map((p) => {
                    return {
                        name: p,
                    };
                }),
            },
            {
                name: 'name',
                message: 'Name of project',
                type: 'input',
                validate: (input) => {
                    if (input.length == 0) {
                        return 'Please enter a name';
                    }
                    if (input.includes('/') || input.includes('\\')) {
                        return 'Use a valid name';
                    }
                    return true;
                },
                result: (value) => {
                    return value.toLowerCase().replaceAll(' ', '_');
                },
            },
        ]);
        this.packageProgram = data.program;
        const project = projects.find((p) => p.key == data.project);
        if (!project) {
            logger_1.Logger.error('An error occured while loading project');
            return;
        }
        await project.function(this, node_path_1.default.resolve(root, path), data.name);
    }
}
exports.Main = Main;
