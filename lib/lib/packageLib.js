"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class PackageManager {
    packageList = [];
    devPackageList = [];
    scripts = {};
    path;
    constructor(path) {
        this.path = node_path_1.default.join(path, 'package.json');
        const file = require(this.path);
        this.packageList = file.dependencies ? Object.entries(file.dependencies) : [];
        this.devPackageList = file.devDependencies ? Object.entries(file.devDependencies) : [];
        this.scripts = file.scripts;
    }
    addPackage(name, version, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        packageList.push([name, version]);
    }
    mergePackages(list, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        packageList.push(...list.filter(([name]) => {
            return !packageList.some(([packageName]) => packageName === name);
        }));
    }
    removePackage(name, dev = false) {
        const packageList = dev ? this.devPackageList : this.packageList;
        this.packageList = packageList.filter(([packageName]) => packageName !== name);
    }
    write() {
        const file = require(this.path);
        file.dependencies = Object.fromEntries(this.packageList.sort());
        file.devDependencies = Object.fromEntries(this.devPackageList.sort());
        file.scripts = this.scripts;
        node_fs_1.default.writeFileSync(this.path, JSON.stringify(file, null, 4));
    }
}
exports.PackageManager = PackageManager;
