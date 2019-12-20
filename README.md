Scripts to help migrate code to use strict null checks

[Original repo](https://github.com/mjbvz/vscode-strict-null-check-migration-tools)

## Usage

```bash
npm install
```

**index.js**

The main script prints of list of files that are eligible for strict null checks. This includes all files that only import files thare are already strict null checked.

```bash
node index.js /path/to/vscode
```

**autoAdd.js**

Very simple script that tries to auto add any eligible file to the `tsconfig.strictNullChecks.json`. This iteratively compiles the `tsconfig` project with just that file added. If there are no errors, it is added to the `tsconfig`

```bash
node autoAdd.js /path/to/vscode
```
