"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRuntimeBundler = exports.SandboxRuntimeBundler = exports.RuntimeBundler = void 0;
const fs_1 = require("fs");
const bundler_1 = require("@forge/bundler");
const cli_shared_1 = require("@forge/cli-shared");
const packager_1 = require("./packager");
const node_1 = require("@forge/bundler/out/config/node");
class RuntimeBundler {
    constructor(archiverFactory, logger, bundler) {
        this.archiverFactory = archiverFactory;
        this.logger = logger;
        this.bundler = bundler;
    }
    async packageCode(archiver, entryPoints) {
        const moduleList = [];
        if (entryPoints.length > 0) {
            let bundlerResponse;
            try {
                bundlerResponse = await this.bundler(this.logger, process.cwd(), entryPoints);
            }
            catch (e) {
                throw new packager_1.BundlerError(e.message);
            }
            const { output, sourceMap = {}, metadata } = bundlerResponse;
            if (metadata) {
                if (metadata.modules) {
                    moduleList.push(...metadata.modules);
                }
                if (metadata.nodeRuntimeVersion) {
                    archiver.addFile(node_1.NODE_RUNTIME_VERSION_FILE, Buffer.from(metadata.nodeRuntimeVersion));
                }
            }
            this.logger.debug(cli_shared_1.Text.deploy.taskPackage.packageBundledFiles);
            for (const name in output) {
                archiver.addFile(name, Buffer.from(output[name]));
            }
            for (const name in sourceMap) {
                archiver.addFile(name, Buffer.from(sourceMap[name]));
            }
        }
        return moduleList;
    }
    async packageDependencies(archiver) {
        for (const fileName of cli_shared_1.dependencyFileNames) {
            if ((0, fs_1.existsSync)(fileName)) {
                archiver.addFileFrom(fileName, fileName);
            }
        }
    }
    async packageAll(archiver, handlers, packageConfig) {
        const entryPoints = (0, bundler_1.getEntryPoints)(handlers);
        const moduleList = await this.packageCode(archiver, entryPoints);
        await this.packageDependencies(archiver);
        return moduleList;
    }
    async bundle(handlers, packageConfig) {
        const archiver = this.archiverFactory();
        const moduleList = await this.packageAll(archiver, handlers, packageConfig);
        const archivePath = await archiver.finalise();
        this.logger.debug(cli_shared_1.Text.deploy.taskPackage.archiveCreated(archivePath));
        return { runtimeArchivePath: archivePath, moduleList };
    }
}
exports.RuntimeBundler = RuntimeBundler;
class SandboxRuntimeBundler extends RuntimeBundler {
    async bundle(handlers, packageConfig) {
        if (packageConfig) {
            throw new packager_1.BundlerError(cli_shared_1.Text.deploy.taskPackage.packageOptionsNotSupported);
        }
        return await super.bundle(handlers, packageConfig);
    }
}
exports.SandboxRuntimeBundler = SandboxRuntimeBundler;
class NodeRuntimeBundler extends RuntimeBundler {
    async packageAll(archiver, handlers, packageConfig) {
        var _a;
        const moduleList = await super.packageAll(archiver, handlers, packageConfig);
        const files = await new cli_shared_1.FileSystemReader().getFileGlobList((_a = packageConfig === null || packageConfig === void 0 ? void 0 : packageConfig.extraFiles) !== null && _a !== void 0 ? _a : []);
        files.forEach((fileName) => {
            archiver.addFileFrom(fileName, fileName);
        });
        return moduleList;
    }
}
exports.NodeRuntimeBundler = NodeRuntimeBundler;
