// @ts-check
const path = require('path');
const { getImportsForFile } = require('./tsHelper');
const glob = require('glob');
const config = require('./config');

async function getCheckedFiles(tsconfig, codeRoot) {
    const set = new Set(tsconfig.files.map(include => path.join(codeRoot, include)));
    const includes = tsconfig.include.map(include => {
        return new Promise((resolve, reject) => {
            glob(path.join(codeRoot, include), (err, files) => {
                if (err) return reject(err);

                for (const file of files) {
                    set.add(file);
                }
                resolve();
            })
        });
    });
    await Promise.all(includes);
    return set;
}

/**
 * @param {string} srcRoot
 * @param {{ includeTests: boolean }} [options]
 */
const forEachFileInSrc = (srcRoot, options) => {
    return new Promise((resolve, reject) => {
        glob(`${srcRoot}/**/*.ts*`, (err, files) => {
            if (err) return reject(err);

            return resolve(files.filter(file => !file.endsWith('.d.ts')
                && (options && options.includeTests ? true : !file.endsWith('.spec.ts'))));
        })
    });
};
module.exports.forEachFileInSrc = forEachFileInSrc;

/**
 * @param {string} codeRoot
 * @param {(file: string) => void} forEach
 * @param {{ includeTests: boolean }} [options]
 */
module.exports.forStrictNullCheckEligibleFiles = async (codeRoot, forEach, options) => {
    const srcRoot = path.join(codeRoot, 'src');
    const tsconfig = require(path.join(codeRoot, config.targetTsconfig));
    const checkedFiles = await getCheckedFiles(tsconfig, codeRoot);
    const imports = new Map();
    const getMemoizedImportsForFile = (file, srcRoot, codeRoot) => {
        if (imports.has(file)) {
            return imports.get(file);
        }
        const importList = getImportsForFile(file, srcRoot, codeRoot);
        imports.set(file, importList);
        return importList;
    }

    const files = await forEachFileInSrc(srcRoot, options);

    return files
        .filter(file => !checkedFiles.has(file))
        .filter(file => !config.skippedFiles.has(path.relative(srcRoot, file)))
        .filter(file => {
            const allProjImports = getMemoizedImportsForFile(file, srcRoot, codeRoot);

            const nonCheckedImports = allProjImports
                .filter(x => x !== file) // filter out undefined
                // .forEach(file => console.log(file))
                .filter(imp => {
                    if (checkedFiles.has(imp)) {
                        return false;
                    }
                    // Don't treat cycles as blocking
                    const impImports = getMemoizedImportsForFile(imp, srcRoot, codeRoot);
                    return impImports
                        .filter(x => x !== file)
                        .filter(x => !checkedFiles.has(x))
                        .length !== 0;
                });

            const isEdge = nonCheckedImports.length === 0;
            if (isEdge) {
                forEach(file);
            }
            return isEdge;
        });
}
