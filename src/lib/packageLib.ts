import fs from 'node:fs';
import Path from 'node:path';

export type Package = [string, string];

export type PackageList = Package[];

export class PackageManager {
    private packageList: PackageList = [];
    private devPackageList: PackageList = [];
    public scripts: Record<string, string> = {};
    public additional: Record<string, any> = {};

    private path;

    constructor(path: string) {
        this.path = Path.join(path, 'package.json');
        const file = require(this.path) as {
            name: string;
            version: string;
            private: boolean;
            scripts: Record<string, string>;
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };

        this.packageList = file.dependencies ? Object.entries(file.dependencies) : [];
        this.devPackageList = file.devDependencies ? Object.entries(file.devDependencies) : [];
        this.scripts = file.scripts;
    }

    addPackage(name: string, version: string, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        packageList.push([name, version]);
    }

    mergePackages(list: PackageList, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        //check if package already exists
        packageList.push(
            ...list.filter(([name]) => {
                return !packageList.some(([packageName]) => packageName === name);
            })
        );
    }

    removePackage(name: string, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        this.packageList = packageList.filter(([packageName]) => packageName !== name);
    }

    write() {
        const file = require(this.path) as {
            name: string;
            version: string;
            private: boolean;
            scripts: Record<string, string>;
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
            [key: string]: any;
        };

        file.dependencies = Object.fromEntries(this.packageList.sort());
        file.devDependencies = Object.fromEntries(this.devPackageList.sort());
        file.scripts = this.scripts;

        Object.entries(this.additional).forEach(([key, value]) => {
            file[key] = value;
        });

        fs.writeFileSync(this.path, JSON.stringify(file, null, 4));
    }
}
