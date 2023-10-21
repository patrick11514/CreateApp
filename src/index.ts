import clc from 'cli-color'
import enquirer from 'enquirer'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import Path from 'path'

type Promisable<T> = T | Promise<T>

/**
 *  Get current time in format HH:MM:SS:MS
 * @param mills include milliseconds?
 * @returns string
 */
const _getTime = (mills = false) => {
    let date = new Date()

    //HH:MM:SS:MS
    let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
    let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()

    let time = `${hours}:${minutes}:${seconds}`

    if (mills) {
        let milliseconds =
            date.getMilliseconds() < 10
                ? `00${date.getMilliseconds()}`
                : date.getMilliseconds() < 100
                ? `0${date.getMilliseconds()}`
                : date.getMilliseconds()
        time += `:${milliseconds}`
    }

    return time
}

/**
 * Write formatted text to console in format [TIME] [INFO/ERROR] text
 * @param type error or text
 * @param text some text
 * @param time prepend time to text?
 */
export const _ = (type: 'error' | 'text', text: string, time: boolean = true) => {
    const fnc = type == 'error' ? clc.red : clc.cyan
    const _text = type == 'error' ? 'ERROR' : 'INFO'

    let string = ''

    if (time) {
        string += `${clc.blackBright('[')}${clc.yellow(_getTime(false))}${clc.blackBright(']')} `
    }

    string += `${clc.blackBright('[')}${fnc(_text)}${clc.blackBright(']')} ${clc.white(text)}`

    console.log(string)
}

const argumenents = process.argv.slice(2, process.argv.length)
export let packageProgram: 'npm' | 'pnpm' | 'yarn' = 'npm'

const main = async () => {
    _(
        'text',
        `Welcome in ${clc.redBright('Create Patrick115 App')} version ${clc.yellow(process.env.npm_package_version)}`
    )

    let currentPath = process.env.PWD as string

    if (argumenents.length == 0) {
        _('text', 'No arguments passed, using current directory')
    } else {
        _('text', 'Using directory from argument')
        currentPath = argumenents[0]
    }

    const { installationPath } = await enquirer.prompt<{
        installationPath: string
    }>({
        name: 'installationPath',
        message: `Installation folder`,
        type: 'input',
        initial: currentPath,
    })

    if (!fs.existsSync(installationPath)) {
        await _c(`mkdir -p ${installationPath}`)
        _('text', `Created ${clc.cyan(installationPath)}`)
    }

    if (fs.readdirSync(installationPath).length > 0) {
        const { continue: cont } = await enquirer.prompt<{ continue: boolean }>([
            {
                name: 'continue',
                type: 'confirm',
                message: 'Folder is not empty, do you want to continue?',
                initial: false,
            },
        ])

        if (!cont) {
            _('error', 'Program ended by user')
            return
        }
    }

    //load all projects
    const projects = fs
        .readdirSync(Path.join(__dirname, 'projects'))
        .filter((p) => p.endsWith('.js') || p.endsWith('.ts'))

    const instances: Array<{
        name: string
        key: string
        function: (path: string, name: string) => Promisable<void>
    }> = []
    for (const p of projects) {
        const loaded = require(Path.join(__dirname, 'projects', p))
        if (!loaded) throw 'Unable to load module ' + p
        const instance = loaded.default
        instances.push(instance)
    }

    const { project, name, program } = await enquirer.prompt<{
        project: 'svelte' | 'tsc' | 'discord'
        name: string
        program: 'npm' | 'pnpm' | 'yarn'
    }>([
        {
            name: 'project',
            message: 'What do you want to install?',
            type: 'select',
            choices: instances.map((instance) => {
                return {
                    message: instance.name,
                    name: instance.key,
                }
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
            validate(input: string) {
                if (input.length == 0) {
                    return 'Please enter a name'
                }
                if (input.includes('/') || input.includes('\\')) {
                    return 'Use a valid name'
                }

                return true
            },
            result(value: string) {
                return value.toLowerCase().replaceAll(' ', '_')
            },
        },
    ])

    packageProgram = program

    instances.forEach(async (i) => {
        if (i.key == project) {
            try {
                await i.function(installationPath, name)
            } catch (e) {
                _('error', 'An error occured while installing project')
                console.error(e)
            }
        }
    })
}

/**
 * Generate package install program
 * @param packages
 * @returns string
 */
export const _p = (
    packages:
        | string
        | {
              name: string
              version?: string
              dev?: true
          }[]
): string => {
    let string = packageProgram
    if (packageProgram == 'yarn') {
        string += ' add'
    } else {
        string += ' install'
    }

    if (typeof packages == 'string') {
        return (string += ' ' + packages)
    }

    const normalPackages = packages.filter((p) => {
        return p.dev !== true
    })
    const devPackages = packages.filter((p) => {
        return p.dev === true
    })

    let normalCommand = string

    normalPackages.forEach((pkg) => {
        normalCommand += ` ${pkg.name}` + (pkg.version ? `@${pkg.version}` : '')
    })

    let devCommand = string
    if (packageProgram != 'yarn') {
        devCommand += ' -D'
    }

    devPackages.forEach((pkg) => {
        devCommand += ` ${pkg.name}` + (pkg.version ? `@${pkg.version}` : '')
    })

    if (packageProgram == 'yarn') {
        devCommand += ' -D'
    }

    switch (true) {
        case normalPackages.length > 0 && devPackages.length == 0:
            return normalCommand
        case normalPackages.length == 0 && devPackages.length > 0:
            return devCommand
        case normalPackages.length > 0 && devPackages.length > 0:
            return `${normalCommand}; ${devCommand}`
    }

    return ''
}

/**
 * Execute shell command
 * @param command
 * @returns Promise<true>
 */
export const _c = async (command: string, path?: string) => {
    return new Promise<true>((resolve, reject) => {
        exec(`${path ? `cd ${path} && ` : ''}${command}`, (error) => {
            if (error) {
                reject(error)
            } else {
                resolve(true)
            }
        })
    })
}
;(async () => {
    try {
        await main()
        //handle CTRL + C
    } catch (_) {}
})()
