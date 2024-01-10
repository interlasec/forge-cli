import { Handler, ResourceDetails } from '@forge/cli-shared';
import { App } from '@forge/manifest';
import { Deployer } from './deployer/deployer';
import { Packager } from './packager/packager';
import { ArchiveUploader } from './uploader/uploader';
import { DeploymentResult } from '../command-line/register-deployment-commands';
import { ResourcePackagingService } from '../service/resource-packaging-service';
export interface Details {
    handlers: Array<Handler>;
    environmentKey: string;
    resources: ResourceDetails[];
    packageConfig: App['package'];
}
export declare class PackageUploadDeployCommand {
    private readonly packager;
    private readonly archiveUploader;
    private readonly deployer;
    private readonly resourcePackagingService;
    constructor(packager: Packager, archiveUploader: ArchiveUploader, deployer: Deployer, resourcePackagingService: ResourcePackagingService);
    execute(details: Details): Promise<DeploymentResult>;
}
//# sourceMappingURL=package-upload-deploy.d.ts.map