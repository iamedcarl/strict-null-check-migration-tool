// @ts-check
const path = require('path');
const ts = require('typescript');
const fs = require('fs');

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot, codeRoot) {
    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());

    return fileInfo.importedFiles
        .map(importedFile => importedFile.fileName)
        .filter(fileName => !/^css!/.test(fileName) || !/^scss!/.test(fileName)) // remove css imports, if any
        .filter(fileName => fileName !== 'bernie-core/dist/source' && fileName !== 'mobx-react/custom' && fileName !== 'react-lines-ellipsis/lib/html') // remove specific uncaught modules
        .map(fileName => {
            if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
                return path.join(path.dirname(file), fileName);
            }
            if (/^src/.test(fileName)) {
                return path.join(codeRoot, fileName);
            }
            if (/^stores$/.test(fileName)) {
                return path.join(srcRoot, fileName);
            }
            if (/\//.test(fileName)) {
                return path.join(srcRoot, fileName);
            }
            return fileName;
        })
        .filter(fileName => /\//.test(fileName)) // remove node modules (the import must contain '/')
        .map(fileName => {
            if (fs.existsSync(`${fileName}.ts`)) {
                return `${fileName}.ts`;
            }
            if (fs.existsSync(`${fileName}.tsx`)) {
                return `${fileName}.tsx`;
            }
            if (fs.existsSync(`${fileName}.js`)) {
                return `${fileName}.js`;
            }
            if (fs.existsSync(`${fileName}.jsx`)) {
                return `${fileName}.jsx`;
            }
            if (fs.existsSync(`${fileName}.d.ts`)) {
                return `${fileName}.d.ts`;
            }
            if (fs.existsSync(`${fileName}.spec.ts`)) {
                return `${fileName}.spec.ts`;
            }
            if (fs.existsSync(`${fileName}.spec.tsx`)) {
                return `${fileName}.spec.tsx`;
            }
            if (fs.existsSync(`${fileName}/index.ts`)) {
                return `${fileName}/index.ts`;
            }
            if (fs.existsSync(`${fileName}/index.tsx`)) {
                return `${fileName}/index.tsx`;
            }
            if (fs.existsSync(`${fileName}`)) {
                return `${fileName}`;
            }
            throw new Error(`Unresolved import ${fileName} in ${file}`);
        });
};
