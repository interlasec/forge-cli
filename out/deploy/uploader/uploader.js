"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppArchiveUploader = void 0;
const cli_shared_1 = require("@forge/cli-shared");
class AppArchiveUploader {
    constructor(getConfiguredApp, artifact, uploader, logger, uploaderService) {
        this.getConfiguredApp = getConfiguredApp;
        this.artifact = artifact;
        this.uploader = uploader;
        this.logger = logger;
        this.uploaderService = uploaderService;
    }
    async uploadArchive(archivePath) {
        this.logger.info(cli_shared_1.Text.deploy.taskUpload.title);
        const appDetails = await this.getConfiguredApp();
        const uploadUrl = await this.artifact.getUploadUrl(appDetails);
        this.logger.debug(cli_shared_1.Text.deploy.taskUpload.uploadingArchive(uploadUrl));
        await this.uploader.uploadFromPath(uploadUrl, archivePath);
        return uploadUrl;
    }
    async uploadHostedResources(environmentKey, resourceArchives) {
        const appDetails = await this.getConfiguredApp();
        const resourceKeys = Object.keys(resourceArchives);
        if (resourceKeys.length === 0) {
            return undefined;
        }
        const { preSignedUrls, uploadId } = await this.artifact.getHostedResourcesUploadUrls(appDetails, environmentKey, Object.keys(resourceArchives));
        const uploadDetails = resourceKeys.map((resourceKey, i) => {
            const preSignedUrl = preSignedUrls[i];
            const archive = resourceArchives[resourceKey].zipPath;
            return {
                archive,
                preSignedUrl
            };
        });
        this.logger.debug(cli_shared_1.Text.deploy.taskUpload.uploadingResources());
        await Promise.all(uploadDetails.map((uploadDetails) => {
            return this.uploaderService.upload(uploadDetails);
        }));
        return uploadId;
    }
}
exports.AppArchiveUploader = AppArchiveUploader;
