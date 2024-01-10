import { AppConfigProvider, FileUploader, Logger } from '@forge/cli-shared';
import { ArtifactClient } from './artifact-graphql-client';
import { ResourceArchives } from '../../service/resource-packaging-service';
import { UploaderService } from '../../service/resources-uploader-service';
export interface ArchiveUploader {
    uploadArchive(archivePath: string): Promise<string>;
    uploadHostedResources(environmentKey: string, resourceArchives: ResourceArchives): Promise<string | undefined>;
}
export declare class AppArchiveUploader implements ArchiveUploader {
    private readonly getConfiguredApp;
    private readonly artifact;
    private readonly uploader;
    private readonly logger;
    private readonly uploaderService;
    constructor(getConfiguredApp: AppConfigProvider, artifact: ArtifactClient, uploader: FileUploader, logger: Logger, uploaderService: UploaderService);
    uploadArchive(archivePath: string): Promise<string>;
    uploadHostedResources(environmentKey: string, resourceArchives: ResourceArchives): Promise<string | undefined>;
}
//# sourceMappingURL=uploader.d.ts.map