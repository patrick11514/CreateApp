import fs from 'node:fs';
import Path from 'node:path';

export const copyFiles = (
    templatePath: string,
    path: string,
    files: (
        | {
              path: string;
              replace?: string[];
          }
        | string
    )[],
    values?: { [key: string]: string }
) => {
    for (const file of files) {
        let filePath: string;
        if (typeof file === 'string') {
            filePath = file;
        } else {
            filePath = file.path;
        }

        const from = Path.join(templatePath, filePath);
        const to = Path.join(path, filePath);

        if (typeof file === 'object' && file.replace !== undefined && values !== undefined) {
            let content = fs.readFileSync(from, 'utf-8');
            for (const replace of file.replace) {
                if (replace in values) {
                    content = content.replaceAll(replace, values[replace]);
                }
            }

            fs.writeFileSync(to, content);
        } else {
            const folder = Path.dirname(to);

            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
            fs.copyFileSync(from, to);
        }
    }
};
