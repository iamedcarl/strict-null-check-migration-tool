// @ts-check
const path = require('path');
const ts = require('typescript');
const fs = require('fs');

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot) {
    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
    return fileInfo.importedFiles
        .map(importedFile => importedFile.fileName)
        .filter(fileName => !/^scss!/.test(fileName)) // remove css imports
        .filter(fileName => !fileName === 'bernie-core/dist/source' || !fileName === 'mobx-react/custom') // remove css imports
        .filter(fileName => /\//.test(fileName)) // remove node modules (the import must contain '/')
        .map(fileName => {
            console.log('+++++', fileName)
            if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
                return path.join(path.dirname(file), fileName);
            }
            if (/^src/.test(fileName)) {
                return path.join('/Users/eadraincem/code/expedia-activities/lx-nimble', fileName);
            }
            return fileName;
        }).map(fileName => {
            if (fs.existsSync(`${fileName}.ts`) || fs.existsSync(`../${fileName}.ts`) || fs.existsSync(`../src/${fileName}.ts`)) {
                return `${fileName}.ts`;
            }
            if (fs.existsSync(`${fileName}.tsx`) || fs.existsSync(`../${fileName}.tsx`) || fs.existsSync(`../src/${fileName}.tsx`)) {
                return `${fileName}.tsx`;
            }
            if (fs.existsSync(`${fileName}.js`)) {
                return `${fileName}.js`;
            }
            if (fs.existsSync(`${fileName}.d.ts`)) {
                return `${fileName}.d.ts`;
            }
            if (fs.existsSync(`${fileName}/index.ts`) || fs.existsSync(`../${fileName}/index.ts`) || fs.existsSync(`../src/${fileName}/index.ts`)) {
                return `${fileName}/index.ts`;
            }
            if (fs.existsSync(`../src/${fileName}`)) {
                return `../src/${fileName}`;
            }
            throw new Error(`Unresolved import ${fileName} in ${file}`);
        });
};
