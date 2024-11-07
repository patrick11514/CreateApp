import { PackageManager } from './packageLib';
import fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import path from 'node:path';

type FileCondition = {
    type: 'file';
    files: string[];
};

type PackageCondition =
    | FileCondition
    | {
          type: 'package';
          packages: string[];
      };

export const defineAdder = (options: {
    name: string;
    description: string;
    packages: Record<
        string,
        {
            version: string;
            dev: boolean;
            requirements?: PackageCondition[];
        }
    >;
    writeFiles: (pm: PackageManager, fw: FileWriter) => Promise<void>;
}) => {
    return {
        name: options.name,
        description: options.description,
        run: async (root: string, pm: PackageManager, tempalteDir?: string) => {
            for (const [name, data] of Object.entries(options.packages)) {
                if (data.requirements && !data.requirements.every((cond) => evaluatePackageCondition(cond, pm)))
                    continue;

                pm.addPackage(name, data.version, data.dev);
            }

            return options.writeFiles(pm, new FileWriter(root));
        },
    };
};

const evaluateFileCondition = (condition: FileCondition): boolean => {
    switch (condition.type) {
        case 'file':
            return condition.files.every((file) => fsSync.existsSync(file));
    }
};

const evaluatePackageCondition = (condition: PackageCondition, pm: PackageManager): boolean => {
    switch (condition.type) {
        case 'file':
            return evaluateFileCondition(condition);
        case 'package':
            return condition.packages.every((pkg) => pm.hasPackage(pkg));
    }
};

export class FileWriter {
    constructor(
        private root: string,
        private templateDir?: string,
    ) {}

    async writeFile(relativePath: string, content: string, condition?: FileCondition) {
        if (condition && !evaluateFileCondition(condition)) return;

        await fs.writeFile(path.join(this.root, relativePath), content);
    }

    async openFile(relativePath: string): Promise<Buffer> {
        return fs.readFile(path.join(this.root, relativePath));
    }

    async tempalteCopy(fileName: string, destination: string) {
        if (!this.templateDir) return;

        const filePath = path.join(this.templateDir, fileName);

        await fs.copyFile(filePath, path.join(this.root, destination));
    }
}
