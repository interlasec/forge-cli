"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePackagingService = exports.DetailedMalformedHtmlEntrypointError = exports.DetailedMissingHtmlEntrypointError = exports.MissingHtmlEntrypointError = exports.MalformedHtmlEntrypointError = exports.ResourceDirectoryEmptyError = exports.ResourceDirectoryMissingError = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const path_1 = require("path");
const hidefile_1 = require("hidefile");
const CUSTOM_UI_ENTRYPOINT = 'index.html';
class ResourceDirectoryMissingError extends cli_shared_1.UserError {
    constructor(key, dir) {
        super(cli_shared_1.Text.error.resourceDirectoryMissing(key, dir));
    }
}
exports.ResourceDirectoryMissingError = ResourceDirectoryMissingError;
class ResourceDirectoryEmptyError extends cli_shared_1.UserError {
    constructor(key, dir) {
        super(cli_shared_1.Text.error.resourceDirectoryEmpty(key, dir));
    }
}
exports.ResourceDirectoryEmptyError = ResourceDirectoryEmptyError;
class MalformedHtmlEntrypointError extends cli_shared_1.UserError {
    constructor() {
        super(cli_shared_1.Text.hostedResources.malformedEntrypoint);
    }
}
exports.MalformedHtmlEntrypointError = MalformedHtmlEntrypointError;
class MissingHtmlEntrypointError extends cli_shared_1.UserError {
    constructor() {
        super(cli_shared_1.Text.hostedResources.missingEntrypoint);
    }
}
exports.MissingHtmlEntrypointError = MissingHtmlEntrypointError;
class DetailedMissingHtmlEntrypointError extends cli_shared_1.UserError {
    constructor(resourceKey, directory) {
        super(cli_shared_1.Text.hostedResources.missingEntrypointWithResourceDetails(resourceKey, directory));
    }
}
exports.DetailedMissingHtmlEntrypointError = DetailedMissingHtmlEntrypointError;
class DetailedMalformedHtmlEntrypointError extends cli_shared_1.UserError {
    constructor(resourceKey) {
        super(cli_shared_1.Text.hostedResources.malformedEntrypointWithKey(resourceKey));
    }
}
exports.DetailedMalformedHtmlEntrypointError = DetailedMalformedHtmlEntrypointError;
class ResourcePackagingService {
    constructor(archiverFactory, fileSystemReader, appDir, bridgeScriptService, iframeResizerScriptService) {
        this.archiverFactory = archiverFactory;
        this.fileSystemReader = fileSystemReader;
        this.appDir = appDir;
        this.bridgeScriptService = bridgeScriptService;
        this.iframeResizerScriptService = iframeResizerScriptService;
    }
    async getResourcesInformation(resources) {
        return await Promise.all(resources.map(async ({ key, directory, resourceType }) => {
            if (!this.fileSystemReader.fileExists(directory)) {
                throw new ResourceDirectoryMissingError(key, directory);
            }
            const filePaths = await this.fileSystemReader.recursiveReadDir(directory, [hidefile_1.isHiddenSync]);
            if (filePaths.length === 0) {
                throw new ResourceDirectoryEmptyError(key, directory);
            }
            return { key, filePaths, directory, resourceType };
        }));
    }
    transformRelativeResourcePathsToAbsolute(appDir, resources) {
        return resources.map(({ key, path, resourceType }) => ({
            key,
            directory: resourceType === 'nativeUI' ? path : (0, path_1.join)(appDir, path),
            resourceType
        }));
    }
    processFile(filePath, content) {
        if (filePath === CUSTOM_UI_ENTRYPOINT) {
            const contentWithIframeResizerScript = this.iframeResizerScriptService.injectIframeResizer(content, () => {
                throw new MalformedHtmlEntrypointError();
            });
            return this.bridgeScriptService.injectBridgeCore(contentWithIframeResizerScript, () => {
                throw new MalformedHtmlEntrypointError();
            });
        }
        return content;
    }
    validateResourceContents({ directory, filePaths, resourceType }) {
        if (resourceType === 'customUI' || resourceType === 'nativeUI') {
            this.assertDirectoryIncludesEntrypoint(directory, filePaths);
        }
    }
    assertDirectoryIncludesEntrypoint(directory, filePaths) {
        if (!filePaths.map((path) => (0, path_1.relative)(directory, path)).includes(CUSTOM_UI_ENTRYPOINT)) {
            throw new MissingHtmlEntrypointError();
        }
    }
    async createResourceArchive(archiver, filePaths, directory) {
        await Promise.all(filePaths.map(async (filePath) => {
            const file = await this.fileSystemReader.readBinaryFileAsync(filePath);
            if (file) {
                const relativePathToArchiveRoot = (0, path_1.relative)(directory, filePath);
                archiver.addFile(relativePathToArchiveRoot, this.processFile(relativePathToArchiveRoot, file));
            }
        }));
        return archiver.finalise();
    }
    async zipResources(resources, modules) {
        const transformedResources = this.transformRelativeResourcePathsToAbsolute(this.appDir, resources);
        const resourcesInformation = await this.getResourcesInformation(transformedResources);
        const archives = {};
        await Promise.all(resourcesInformation.map(async ({ key, filePaths, directory, resourceType }) => {
            try {
                this.validateResourceContents({ key, directory, filePaths, resourceType });
                const archiver = this.archiverFactory();
                const archivePath = await this.createResourceArchive(archiver, filePaths, directory);
                archives[key] = {
                    zipPath: archivePath,
                    rawSize: this.fileSystemReader.bytesToMb(await this.fileSystemReader.getFolderSizeAsync(directory)),
                    zipSize: this.fileSystemReader.bytesToMb(this.fileSystemReader.getSize(archivePath)),
                    extensions: [...new Set(filePaths.map((file) => (0, path_1.extname)(file)))],
                    fileCount: filePaths.length
                };
            }
            catch (err) {
                if (err instanceof MalformedHtmlEntrypointError) {
                    throw new DetailedMalformedHtmlEntrypointError(key);
                }
                if (err instanceof MissingHtmlEntrypointError) {
                    throw new DetailedMissingHtmlEntrypointError(key, directory);
                }
                throw err;
            }
        }));
        return archives;
    }
}
exports.ResourcePackagingService = ResourcePackagingService;
