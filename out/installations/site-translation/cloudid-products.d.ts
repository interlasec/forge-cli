/// <reference types="node" />
import { SiteTranslator, ResourcefulAri } from './site-translation';
import { URL } from 'url';
import { Ari } from '@forge/util/packages/ari';
import { GraphQLClient, UserError } from '@forge/cli-shared';
export declare class InvalidAtlassianSiteError extends UserError {
    constructor(url: URL);
}
export declare class CloudIdTranslator implements SiteTranslator {
    private graphqlClient;
    constructor(graphqlClient: GraphQLClient);
    ariBelongsToProduct(ari: ResourcefulAri): boolean;
    buildInstallationContext(product: string, site: URL): Promise<Ari>;
    getSitesForResourceAris(aris: ResourcefulAri[]): Promise<Record<string, string>>;
    private getCloudId;
}
//# sourceMappingURL=cloudid-products.d.ts.map