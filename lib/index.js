"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._c = exports._p = exports.packageProgram = exports._ = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
const enquirer_1 = __importDefault(require("enquirer"));
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const path_1 = __importDefault(require("path"));
const _getTime = (mills = false) => {
    let date = new Date();
    let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    let time = `${hours}:${minutes}:${seconds}`;
    if (mills) {
        let milliseconds = date.getMilliseconds() < 10
            ? `00${date.getMilliseconds()}`
            : date.getMilliseconds() < 100
                ? `0${date.getMilliseconds()}`
                : date.getMilliseconds();
        time += `:${milliseconds}`;
    }
    return time;
};
const _ = (type, text, time = true) => {
    const fnc = type == 'error' ? cli_color_1.default.red : cli_color_1.default.cyan;
    const _text = type == 'error' ? 'ERROR' : 'INFO';
    let string = '';
    if (time) {
        string += `${cli_color_1.default.blackBright('[')}${cli_color_1.default.yellow(_getTime(false))}${cli_color_1.default.blackBright(']')} `;
    }
    string += `${cli_color_1.default.blackBright('[')}${fnc(_text)}${cli_color_1.default.blackBright(']')} ${cli_color_1.default.white(text)}`;
    console.log(string);
};
exports._ = _;
const argumenents = process.argv.slice(2, process.argv.length);
exports.packageProgram = 'npm';
const main = async () => {
    (0, exports._)('text', `Welcome in ${cli_color_1.default.redBright('Create Patrick115 App')} version ${cli_color_1.default.yellow(process.env.npm_package_version)}`);
    let currentPath = process.env.PWD;
    if (argumenents.length == 0) {
        (0, exports._)('text', 'No arguments passed, using current directory');
    }
    else {
        (0, exports._)('text', 'Using directory from argument');
        currentPath = argumenents[0];
    }
    const { installationPath } = await enquirer_1.default.prompt({
        name: 'installationPath',
        message: `Installation folder`,
        type: 'input',
        initial: currentPath,
    });
    if (!node_fs_1.default.existsSync(installationPath)) {
        await (0, exports._c)(`mkdir -p ${installationPath}`);
        (0, exports._)('text', `Created ${cli_color_1.default.cyan(installationPath)}`);
    }
    if (node_fs_1.default.readdirSync(installationPath).length > 0) {
        const { continue: cont } = await enquirer_1.default.prompt([
            {
                name: 'continue',
                type: 'confirm',
                message: 'Folder is not empty, do you want to continue?',
                initial: false,
            },
        ]);
        if (!cont) {
            (0, exports._)('error', 'Program ended by user');
            return;
        }
    }
    const projects = node_fs_1.default
        .readdirSync(path_1.default.join(__dirname, 'projects'))
        .filter((p) => p.endsWith('.js') || p.endsWith('.ts'));
    (0, exports._)('text', 'Loding projects...');
    const instances = [];
    for (const p of projects) {
        const loaded = require(path_1.default.join(__dirname, 'projects', p));
        if (!loaded)
            throw 'Unable to load module ' + p;
        const instance = loaded.default;
        instances.push(instance);
    }
    const { project, name, program } = await enquirer_1.default.prompt([
        {
            name: 'project',
            message: 'What do you want to install?',
            type: 'select',
            choices: instances.map((instance) => {
                return {
                    message: instance.name,
                    name: instance.key,
                };
            }),
        },
        {
            name: 'program',
            message: 'Which program do you use?',
            type: 'select',
            choices: [
                {
                    message: 'npm',
                    name: 'npm',
                },
                {
                    message: 'pnpm',
                    name: 'pnpm',
                },
                {
                    message: 'yarn',
                    name: 'yarn',
                },
            ],
        },
        {
            name: 'name',
            message: 'Name of project?',
            type: 'input',
            validate(input) {
                if (input.length == 0) {
                    return 'Please enter a name';
                }
                if (input.includes('/') || input.includes('\\')) {
                    return 'Use a valid name';
                }
                return true;
            },
            result(value) {
                return value.toLowerCase().replaceAll(' ', '_');
            },
        },
    ]);
    exports.packageProgram = program;
    instances.forEach(async (i) => {
        if (i.key == project) {
            try {
                await i.function(installationPath, name);
            }
            catch (e) {
                (0, exports._)('error', 'An error occured while installing project');
                console.error(e);
            }
        }
    });
};
const _p = (packages) => {
    let string = exports.packageProgram;
    if (exports.packageProgram == 'yarn') {
        string += ' add';
    }
    else {
        string += ' install';
    }
    if (typeof packages == 'string') {
        return (string += ' ' + packages);
    }
    const normalPackages = packages.filter((p) => {
        return p.dev !== true;
    });
    const devPackages = packages.filter((p) => {
        return p.dev === true;
    });
    let normalCommand = string;
    normalPackages.forEach((pkg) => {
        normalCommand += ` ${pkg.name}` + (pkg.version ? `@${pkg.version}` : '');
    });
    let devCommand = string;
    if (exports.packageProgram != 'yarn') {
        devCommand += ' -D';
    }
    devPackages.forEach((pkg) => {
        devCommand += ` ${pkg.name}` + (pkg.version ? `@${pkg.version}` : '');
    });
    if (exports.packageProgram == 'yarn') {
        devCommand += ' -D';
    }
    switch (true) {
        case normalPackages.length > 0 && devPackages.length == 0:
            return normalCommand;
        case normalPackages.length == 0 && devPackages.length > 0:
            return devCommand;
        case normalPackages.length > 0 && devPackages.length > 0:
            return `${normalCommand}; ${devCommand}`;
    }
    return '';
};
exports._p = _p;
const _c = async (command, path) => {
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
};
exports._c = _c;
(async () => {
    try {
        await main();
    }
    catch (_) { }
})();
