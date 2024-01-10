/// <reference types="node" />
import { URL } from 'url';
import { Ari } from '@forge/util/packages/ari';
export interface SiteTranslator {
    buildInstallationContext: (product: string, site: URL) => Promise<Ari>;
    getSitesForResourceAris: (ari: ResourcefulAri[]) => Promise<Record<string, string>>;
    ariBelongsToProduct: (ari: ResourcefulAri) => boolean;
}
export interface ResourcefulAri extends Ari {
    resourceId: string;
}
//# sourceMappingURL=site-translation.d.ts.map