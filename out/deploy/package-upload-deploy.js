"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageUploadDeployCommand = void 0;
const lodash_1 = require("lodash");
class PackageUploadDeployCommand {
    constructor(packager, archiveUploader, deployer, resourcePackagingService) {
        this.packager = packager;
        this.archiveUploader = archiveUploader;
        this.deployer = deployer;
        this.resourcePackagingService = resourcePackagingService;
    }
    async execute(details) {
        const [resourcesToBeBundled, preBundledResources] = (0, lodash_1.partition)(details.resources, (res) => res.resourceType === 'nativeUI');
        const { runtimeArchivePath, nativeUiBundlesDetails, moduleList } = await this.packager.package(details.handlers, resourcesToBeBundled, details.packageConfig);
        const resourcesArchives = await this.resourcePackagingService.zipResources([
            ...preBundledResources,
            ...nativeUiBundlesDetails
        ]);
        const [uploadUrl, hostedResourceUploadId] = await Promise.all([
            this.archiveUploader.uploadArchive(runtimeArchivePath),
            this.archiveUploader.uploadHostedResources(details.environmentKey, resourcesArchives)
        ]);
        await this.deployer.deploy(details.environmentKey, uploadUrl, hostedResourceUploadId);
        return {
            analytics: {
                moduleList,
                hostedResourceList: Object.values(resourcesArchives).map((a) => ({
                    extensionList: a.extensions,
                    fileCount: a.fileCount,
                    rawSize: a.rawSize,
                    zipSize: a.zipSize
                }))
            }
        };
    }
}
exports.PackageUploadDeployCommand = PackageUploadDeployCommand;
