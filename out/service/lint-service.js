"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LintService = exports.DEFAULT_DIRECTORY = void 0;
const tslib_1 = require("tslib");
const cli_shared_1 = require("@forge/cli-shared");
const lint_1 = require("@forge/lint");
const path_1 = tslib_1.__importDefault(require("path"));
exports.DEFAULT_DIRECTORY = './src';
class LintService {
    constructor(configFile, fileSystemReader) {
        this.configFile = configFile;
        this.fileSystemReader = fileSystemReader;
    }
    async run(environment, { fix }, logger, directory = exports.DEFAULT_DIRECTORY, lintFunction = lint_1.lint) {
        const csuikResources = await this.configFile.getResources(['nativeUI']);
        const csuikDirectories = csuikResources.map((resource) => path_1.default.dirname(resource.path));
        const exclude = [...(await (0, cli_shared_1.listGitIgnoreFiles)(this.fileSystemReader)), '.git', 'node_modules'];
        const [filesToLint, ...csuikFilesByDirectory] = await Promise.all([
            this.fileSystemReader.recursiveReadDir(directory, exclude),
            ...csuikDirectories.map((directory) => this.fileSystemReader.recursiveReadDir(directory, exclude))
        ]);
        const csuikFilesToLint = csuikFilesByDirectory.reduce((allFiles, directoryFiles) => allFiles.concat(directoryFiles), []);
        const lintResults = await lintFunction([...filesToLint, ...csuikFilesToLint], await this.configFile.readConfig(), environment, logger);
        if (fix) {
            return { lintResults, fixResults: await this.fix(lintResults) };
        }
        return { lintResults };
    }
    async fix(lintResults) {
        const initialState = { errorsFixed: 0, warningsFixed: 0, configFile: this.configFile };
        return lintResults.reduce((promiseChain, nextResult) => promiseChain.then((state) => nextResult.runFixer(state)), Promise.resolve(initialState));
    }
    problemCount(lintResults) {
        return (0, lint_1.problemCount)(lintResults);
    }
    failedScopesFromLintResult({ errors, warnings }) {
        return Array.from((0, lint_1.findMissingPermissions)(errors, warnings, 'missingPermission'));
    }
    failedScopes(lintResults) {
        return lintResults.reduce((acc, lintResult) => {
            const failedScopes = this.failedScopesFromLintResult(lintResult);
            acc.push(...failedScopes);
            return acc;
        }, []);
    }
}
exports.LintService = LintService;
