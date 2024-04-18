"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFiles = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const copyFiles = (templatePath, path, files, values) => {
    for (const file of files) {
        let filePath;
        if (typeof file === 'string') {
            filePath = file;
        }
        else {
            filePath = file.path;
        }
        const from = node_path_1.default.join(templatePath, filePath);
        const to = node_path_1.default.join(path, filePath);
        if (typeof file === 'object' && file.replace !== undefined && values !== undefined) {
            let content = node_fs_1.default.readFileSync(from, 'utf-8');
            for (const replace of file.replace) {
                if (replace in values) {
                    content = content.replaceAll(replace, values[replace]);
                }
            }
            node_fs_1.default.writeFileSync(to, content);
        }
        else {
            const folder = node_path_1.default.dirname(to);
            if (!node_fs_1.default.existsSync(folder)) {
                node_fs_1.default.mkdirSync(folder, { recursive: true });
            }
            node_fs_1.default.copyFileSync(from, to);
        }
    }
};
exports.copyFiles = copyFiles;
