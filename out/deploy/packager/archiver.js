"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeArchiver = exports.MultiArchiver = exports.DirectoryArchiver = exports.ZipArchiver = exports.ArchiverError = void 0;
const tslib_1 = require("tslib");
const archiver_1 = tslib_1.__importDefault(require("archiver"));
const fs_1 = require("fs");
const path_1 = require("path");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const cli_shared_1 = require("@forge/cli-shared");
class ArchiverError extends cli_shared_1.UserError {
}
exports.ArchiverError = ArchiverError;
class ZipArchiver {
    constructor(logger) {
        this.logger = logger;
        this.archive = (0, archiver_1.default)('zip');
        this.tempFile = tmp_1.default.fileSync({ postfix: '.zip' });
        this.resolves = [];
        this.rejects = [];
        this.onArchiveError = (err) => {
            const error = new ArchiverError(err.message);
            for (const reject of this.rejects) {
                reject(error);
            }
        };
        this.onClose = () => {
            for (const resolve of this.resolves) {
                resolve(this.tempFile.name);
            }
        };
        const output = (0, fs_1.createWriteStream)(this.tempFile.name);
        this.archive.pipe(output);
        output.on('close', this.onClose);
        this.archive.on('warning', this.onArchiveError);
        this.archive.on('error', this.onArchiveError);
    }
    addFile(fileName, contents) {
        this.archive.append(contents, { name: fileName });
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, null));
    }
    addFileFrom(fileName, filePath) {
        this.archive.file(filePath, { name: fileName });
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, filePath));
    }
    finalise() {
        return new Promise((resolve, reject) => {
            this.resolves.push(resolve);
            this.rejects.push(reject);
            this.archive.finalize();
        });
    }
    onWarning(cb) {
        this.archive.on('warning', cb);
    }
}
exports.ZipArchiver = ZipArchiver;
class DirectoryArchiver {
    constructor(directory, logger) {
        this.directory = directory;
        this.logger = logger;
    }
    addFile(fileName, contents) {
        this.copy(fileName, contents);
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, null));
    }
    addFileFrom(fileName, filePath) {
        this.copy(fileName, filePath);
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageFile(fileName, filePath));
    }
    copy(fileName, contents) {
        try {
            const targetName = (0, path_1.join)(this.directory, fileName);
            (0, fs_1.mkdirSync)((0, path_1.dirname)(targetName), { recursive: true });
            if (typeof contents === 'string') {
                (0, fs_1.copyFileSync)(contents, targetName);
            }
            else {
                (0, fs_1.writeFileSync)(targetName, contents);
            }
        }
        catch (e) {
            throw new ArchiverError(e.message);
        }
    }
    async finalise() {
        return this.directory;
    }
}
exports.DirectoryArchiver = DirectoryArchiver;
class MultiArchiver {
    constructor(archivers) {
        this.archivers = archivers;
    }
    addFile(fileName, contents) {
        for (const archiver of this.archivers) {
            archiver.addFile(fileName, contents);
        }
    }
    addFileFrom(fileName, filePath) {
        for (const archiver of this.archivers) {
            archiver.addFileFrom(fileName, filePath);
        }
    }
    async finalise() {
        const paths = await Promise.all(this.archivers.map((archiver) => archiver.finalise()));
        return paths[0];
    }
}
exports.MultiArchiver = MultiArchiver;
function makeArchiver(logger) {
    const mainArchiver = new ZipArchiver(logger);
    if (process.env.FORGE_INSPECT_ARCHIVE) {
        return new MultiArchiver([mainArchiver, new DirectoryArchiver(process.env.FORGE_INSPECT_ARCHIVE, logger)]);
    }
    return mainArchiver;
}
exports.makeArchiver = makeArchiver;
