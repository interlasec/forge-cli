/// <reference types="node" />
import { SiteTranslator, ResourcefulAri } from './site-translation';
import { URL } from 'url';
import { Ari } from '@forge/util/packages/ari';
export declare class InvalidWorkspaceError extends Error {
    constructor(url: URL);
}
export declare const getBitbucketEndpoint: () => string;
export declare class BitbucketTranslator implements SiteTranslator {
    ariBelongsToProduct(ari: ResourcefulAri): boolean;
    buildInstallationContext(product: string, site: URL): Promise<Ari>;
    getSitesForResourceAris(aris: ResourcefulAri[]): Promise<Record<string, string>>;
    private getWorkspaceId;
    getWorkspaceUrl(workspaceId: string): Promise<URL | null>;
    private decorateWorkspaceId;
    private extractWorkspaceId;
    private buildFetchUrl;
    private extractWorkspaceName;
    private buildWorkspaceUrl;
}
//# sourceMappingURL=bitbucket.d.ts.map