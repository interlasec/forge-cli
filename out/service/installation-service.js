"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallationService = void 0;
const cli_shared_1 = require("@forge/cli-shared");
const egress_1 = require("@forge/egress");
const lodash_1 = require("lodash");
const graphql_client_1 = require("../installations/graphql-client");
const IDENTITY_PRODUCT_NAME = 'identity';
const JIRA_SERVICE_DESK_PRODUCT_NAME = 'jira-servicedesk';
class InstallationService {
    constructor(getAppConfig, listInstallationsClient, upgradeAppInstallationsClient) {
        this.getAppConfig = getAppConfig;
        this.listInstallationsClient = listInstallationsClient;
        this.upgradeAppInstallationsClient = upgradeAppInstallationsClient;
    }
    filterInstallations(installations, { site: filterSite, product: filterProduct, environment: filterEnvironment }) {
        const isDefaultEnvironment = (env) => env === (0, cli_shared_1.optionToEnvironment)(cli_shared_1.DEFAULT_ENVIRONMENT_OPTION);
        return installations.filter(({ product, site, environmentKey }) => {
            const matchProduct = !filterProduct || filterProduct === (0, cli_shared_1.productDisplayName)(product);
            const matchSite = !filterSite || filterSite === site;
            const matchEnvironment = filterEnvironment
                ? isDefaultEnvironment(filterEnvironment) || filterEnvironment === (0, cli_shared_1.environmentToOption)(environmentKey)
                : true;
            return matchProduct && matchSite && matchEnvironment;
        });
    }
    async listAppInstallations(filter) {
        const { id: appId } = await this.getAppConfig();
        const installations = await this.listInstallationsClient.listInstallations(appId);
        return { installations: this.filterInstallations(installations, Object.assign({}, filter)) };
    }
    async listNonTechnicalAppInstallations(filter) {
        const { installations } = await this.listAppInstallations(filter);
        return {
            installations: installations.filter(({ product }) => product !== IDENTITY_PRODUCT_NAME && product !== JIRA_SERVICE_DESK_PRODUCT_NAME)
        };
    }
    async hasOutdatedProductInstallation(environment) {
        const { installations } = await this.listNonTechnicalAppInstallations({
            environment
        });
        return installations.some((installation) => !installation.version.isLatest);
    }
    async upgradeInstallation(site, product, environmentKey, appId) {
        try {
            await this.upgradeAppInstallationsClient.upgradeInstallation({
                site,
                product,
                environmentKey,
                appId
            });
            return false;
        }
        catch (e) {
            if (e.code === graphql_client_1.ALREADY_UPGRADED_CODE) {
                return true;
            }
            else {
                throw e;
            }
        }
    }
    getPermissionsFromAppEnvironmentVersion(appEnvironmentVersion) {
        const permissions = appEnvironmentVersion === null || appEnvironmentVersion === void 0 ? void 0 : appEnvironmentVersion.permissions[0];
        if (!permissions) {
            return { scopes: [], egressAddresses: [] };
        }
        const scopes = permissions.scopes.map((s) => s.key);
        const egressAddresses = (permissions === null || permissions === void 0 ? void 0 : permissions.egress) ? (0, cli_shared_1.flatMap)(permissions.egress, ({ addresses }) => addresses !== null && addresses !== void 0 ? addresses : []) : [];
        return { scopes, egressAddresses };
    }
    async getAppEnvironmentPermissions(appId, environmentKey) {
        const versionDetails = await this.listInstallationsClient.getVersions(appId, environmentKey, 2);
        const versions = versionDetails === null || versionDetails === void 0 ? void 0 : versionDetails.nodes;
        if (!versions || versions.length === 0)
            return;
        const [{ scopes, egressAddresses }, oldVersion] = versions.map((appEnvironmentVersion) => this.getPermissionsFromAppEnvironmentVersion(appEnvironmentVersion));
        const groupedEgressAddresses = (0, egress_1.sortAndGroupEgressPermissionsByDomain)(egressAddresses);
        if (!oldVersion) {
            return {
                scopes,
                hasDeployments: false,
                egressAddresses: groupedEgressAddresses,
                addedScopes: scopes,
                environmentType: versionDetails.environmentType
            };
        }
        const { scopes: oldScopes } = oldVersion;
        const addedScopes = (0, lodash_1.difference)(scopes, oldScopes);
        return {
            scopes,
            hasDeployments: true,
            egressAddresses: groupedEgressAddresses,
            addedScopes,
            environmentType: versionDetails.environmentType
        };
    }
}
exports.InstallationService = InstallationService;
