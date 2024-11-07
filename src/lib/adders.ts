import { defineAdder, FileWriter } from './adder';
import { PackageManager } from './packageLib';

export const adders = [
    defineAdder({
        name: 'Eslint',
        description: 'Code linting',
        packages: {
            '@types/eslint': {
                version: '^9.6.0',
                dev: true,
            },
            'eslint-plugin-svelte': {
                version: '^2.36.0',
                dev: true,
                requirements: [
                    {
                        type: 'package',
                        packages: ['svelte'],
                    },
                ],
            },
            globals: {
                version: '^15.0.0',
                dev: true,
            },
            'typescript-eslint': {
                version: '^8.0.0',
                dev: true,
                requirements: [
                    {
                        type: 'package',
                        packages: ['typescript'],
                    },
                ],
            },
            '@eslint/js': {
                version: '^9.13.0',
                dev: true,
            },
        },
        async writeFiles(pm: PackageManager, fw: FileWriter) {
            if ('lint' in pm.scripts) {
                pm.scripts.lint = pm.scripts.lint + ' && eslint .';
            } else {
                pm.scripts.lint = 'eslint .';
            }

            const configImports = ["import js from '@eslint/js';", "import globals from 'globals';"];
            const configConfigs = ['js.configs.recommended,'];
            const parsers = [];

            if (pm.hasPackage('svelte')) {
                configImports.push("import svelte from 'eslint-plugin-svelte';");
                configConfigs.push("...svelte.configs['flat/recommended'],");
                parsers.push(
                    `{
		files: ['**/*.svelte'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},`,
                );
            }

            if (pm.hasPackage('typescript')) {
                configImports.push("import ts from 'typescript-eslint';");
                configConfigs.push('...ts.configs.recommended,');
            }

            await fw.writeFile(
                'eslint.config.js',
                configImports.join('\n') +
                    `
export default ts.config(
    ` +
                    configConfigs.join('\n    ') +
                    `
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
    ` +
                    parsers.join('\n') +
                    ` 
    {
		ignores: ['build/', ${pm.hasPackage('svelte') ? "'.svelte-kit/', " : ''}'dist/']
	}
)`,
            );
        },
    }),

    defineAdder({
        name: 'TailwindCSS',
        description: 'CSS library',
        packages: {
            tailwindcss: {
                dev: false,
                version: '^3.4.1',
            },
            postcss: {
                dev: false,
                version: '^8.4.35',
            },
            autoprefixer: {
                dev: false,
                version: '^10.4.17',
            },
            'prettier-plugin-tailwindcss': {
                dev: true,
                version: '^0.5.11',
                requirements: [
                    {
                        type: 'package',
                        packages: ['prettier'],
                    },
                ],
            },
        },

        async writeFiles(pm: PackageManager, fw: FileWriter) {
            fw.tempalteCopy('tailwind.config.js', 'tailwind.config.js');
            fw.tempalteCopy('postcss.config.js', 'postcss.config.js');
        },
    }),
];
