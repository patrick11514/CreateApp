import fs from 'node:fs';
import Path from 'node:path';

export type Package = [string, string];

export type PackageList = Package[];

export class PackageManager {
    private packageList: PackageList = [];
    private devPackageList: PackageList = [];
    public scripts: Record<string, string> = {};
    public additional: Record<string, any> = {};
    public name!: string;
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
        this.name = file.name;
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
            }),
        );
    }

    removePackage(name: string, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        const filtered = packageList.filter(([packageName]) => packageName !== name);
        if (dev) this.devPackageList = filtered;
        else this.packageList = filtered;
    }

    getPackages() {
        return {
            ...Object.fromEntries(
                this.packageList.map((pkg) => {
                    return [
                        pkg[0],
                        {
                            version: pkg[1],
                            dev: false,
                        },
                    ];
                }),
            ),
            ...Object.fromEntries(
                this.devPackageList.map((pkg) => {
                    return [
                        pkg[0],
                        {
                            version: pkg[1],
                            dev: true,
                        },
                    ];
                }),
            ),
        };
    }
    hasPackage(name: string) {
        return this.packageList.some((pkg) => pkg[0] === name) || this.devPackageList.some((pkg) => pkg[0] === name);
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

        file.name = this.name;
        file.dependencies = Object.fromEntries(this.packageList.sort());
        file.devDependencies = Object.fromEntries(this.devPackageList.sort());
        file.scripts = this.scripts;

        Object.entries(this.additional).forEach(([key, value]) => {
            file[key] = value;
        });

        fs.writeFileSync(this.path, JSON.stringify(file, null, 4));
    }
}
