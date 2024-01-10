"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudIdTranslator = exports.InvalidAtlassianSiteError = void 0;
const ari_1 = require("@forge/util/packages/ari");
const cli_shared_1 = require("@forge/cli-shared");
class InvalidAtlassianSiteError extends cli_shared_1.UserError {
    constructor(url) {
        super(cli_shared_1.Text.install.error.invalidAtlassianSite(url));
    }
}
exports.InvalidAtlassianSiteError = InvalidAtlassianSiteError;
const RESOURCE_TYPE = 'site';
const tenantContextsToCloudId = (url, contexts) => {
    if (!contexts.length) {
        throw new InvalidAtlassianSiteError(url);
    }
    const context = contexts[0];
    if (!context || !context.cloudId) {
        throw new InvalidAtlassianSiteError(url);
    }
    return context.cloudId;
};
const tenantToHostname = (tenantInfo) => {
    if (!tenantInfo) {
        return null;
    }
    return tenantInfo.hostName || null;
};
class CloudIdTranslator {
    constructor(graphqlClient) {
        this.graphqlClient = graphqlClient;
    }
    ariBelongsToProduct(ari) {
        return ari.resourceType === RESOURCE_TYPE;
    }
    async buildInstallationContext(product, site) {
        const cloudId = await this.getCloudId(site);
        const ari = ari_1.AnyAri.create({
            resourceOwner: (0, cli_shared_1.ariResourceOwner)(product),
            resourceType: RESOURCE_TYPE,
            resourceId: cloudId
        });
        return ari;
    }
    async getSitesForResourceAris(aris) {
        const MAX_CLOUD_IDS_AT_ONCE = 20;
        const cloudIds = [...new Set(aris.map((ari) => ari.resourceId))];
        const cloudIdsChunks = [];
        for (let i = 0; i < cloudIds.length; i += MAX_CLOUD_IDS_AT_ONCE) {
            cloudIdsChunks.push(cloudIds.slice(i, i + MAX_CLOUD_IDS_AT_ONCE));
        }
        const query = `
        query forge_cli_getHostnameForTenantContexts($cloudIds: [ID!]!) {
            tenantContexts(cloudIds: $cloudIds) {
            hostName
            }
        }
        `;
        const results = await Promise.all(cloudIdsChunks.map((cloudIdsChunk) => this.graphqlClient.query(query, {
            cloudIds: cloudIdsChunk
        })));
        const tenantContexts = [].concat(...results.map((result) => result.tenantContexts || []));
        const cloudIdToHostname = {};
        const ariToHostname = {};
        cloudIds.forEach((cloudId, index) => {
            const maybeHostname = tenantToHostname(tenantContexts[index]);
            cloudIdToHostname[cloudId] = maybeHostname || cloudId;
        });
        aris.forEach((ari) => {
            ariToHostname[ari.toString()] = cloudIdToHostname[ari.resourceId];
        });
        return ariToHostname;
    }
    async getCloudId(site) {
        const query = `
          query forge_cli_getCloudIfForTenantContexts($hostNames: [String!]) {
            tenantContexts(hostNames: $hostNames) {
              cloudId
            }
          }
        `;
        const result = await this.graphqlClient.query(query, {
            hostNames: [site.hostname]
        });
        const tenantContexts = result.tenantContexts || [];
        return tenantContextsToCloudId(site, tenantContexts);
    }
}
exports.CloudIdTranslator = CloudIdTranslator;
