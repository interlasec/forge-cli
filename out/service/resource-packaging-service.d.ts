import { Modules } from '@forge/manifest';
import { FileSystemReader, ResourceDetails, BridgeScriptService, IframeResizerScriptService, UserError } from '@forge/cli-shared';
import { Archiver } from '../deploy';
export declare class ResourceDirectoryMissingError extends UserError {
    constructor(key: string, dir: string);
}
export declare class ResourceDirectoryEmptyError extends UserError {
    constructor(key: string, dir: string);
}
export interface ResourceArchives {
    [key: string]: {
        zipPath: string;
        extensions: string[];
        rawSize: string;
        zipSize: string;
        fileCount: number;
    };
}
export declare class MalformedHtmlEntrypointError extends UserError {
    constructor();
}
export declare class MissingHtmlEntrypointError extends UserError {
    constructor();
}
export declare class DetailedMissingHtmlEntrypointError extends UserError {
    constructor(resourceKey: string, directory: string);
}
export declare class DetailedMalformedHtmlEntrypointError extends UserError {
    constructor(resourceKey: string);
}
export declare class ResourcePackagingService {
    private readonly archiverFactory;
    private readonly fileSystemReader;
    private readonly appDir;
    private readonly bridgeScriptService;
    private readonly iframeResizerScriptService;
    constructor(archiverFactory: () => Archiver, fileSystemReader: FileSystemReader, appDir: string, bridgeScriptService: BridgeScriptService, iframeResizerScriptService: IframeResizerScriptService);
    private getResourcesInformation;
    private transformRelativeResourcePathsToAbsolute;
    private processFile;
    private validateResourceContents;
    private assertDirectoryIncludesEntrypoint;
    private createResourceArchive;
    zipResources(resources: ResourceDetails[], modules?: Modules): Promise<ResourceArchives>;
}
//# sourceMappingURL=resource-packaging-service.d.ts.map