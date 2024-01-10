"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallationsGraphqlClient = exports.UnknownSiteWithoutResourceIdError = exports.InstallationNotFoundError = exports.MissingAppUninstallTask = exports.MissingAppEnvironmentError = exports.MissingAppError = exports.InstallationRequestFailedError = exports.MissingTaskIdError = exports.EnvironmentNotFoundError = exports.UpgradeError = exports.InstallationError = exports.AlreadyInstalledError = exports.PermissionDeniedError = exports.ALREADY_UPGRADED_CODE = exports.UNINSTALLATION_EVENT_POLL_INTERVAL = void 0;
const ari_1 = require("@forge/util/packages/ari");
const cli_shared_1 = require("@forge/cli-shared");
exports.UNINSTALLATION_EVENT_POLL_INTERVAL = 500;
exports.ALREADY_UPGRADED_CODE = 'INSTALLATION_ALREADY_UPGRADED';
const ALREADY_INSTALLED_CODE = 'APP_ALREADY_INSTALLED';
const PERMISSION_DENIED = 'PERMISSION_DENIED';
class PermissionDeniedError extends cli_shared_1.GraphQlMutationError {
    constructor(requestId = 'unknown', appId = 'unknown', statusCode) {
        super(cli_shared_1.Text.install.error.permissionsDeniedInstructions(requestId, appId), {
            requestId,
            code: PERMISSION_DENIED,
            statusCode
        });
    }
}
exports.PermissionDeniedError = PermissionDeniedError;
class AlreadyInstalledError extends cli_shared_1.GraphQlMutationError {
    constructor(requestId, statusCode) {
        super(cli_shared_1.Text.install.error.alreadyInstalledError, { requestId, code: ALREADY_INSTALLED_CODE, statusCode });
    }
}
exports.AlreadyInstalledError = AlreadyInstalledError;
class InstallationError extends cli_shared_1.GraphQlMutationError {
    constructor(message, { requestId, code, statusCode }) {
        super(cli_shared_1.Text.install.error.serverSideInstallationError(message), { requestId, code, statusCode });
    }
}
exports.InstallationError = InstallationError;
class UpgradeError extends cli_shared_1.GraphQlMutationError {
    constructor(message, { requestId, code, statusCode }) {
        super(cli_shared_1.Text.upgrade.error.serverSideInstallationError(message), { requestId, code, statusCode });
    }
}
exports.UpgradeError = UpgradeError;
class EnvironmentNotFoundError extends cli_shared_1.UserError {
    constructor(environmentKey) {
        super(cli_shared_1.Text.env.error.envNotExist(environmentKey));
    }
}
exports.EnvironmentNotFoundError = EnvironmentNotFoundError;
class MissingTaskIdError extends Error {
}
exports.MissingTaskIdError = MissingTaskIdError;
class InstallationRequestFailedError extends cli_shared_1.BaseError {
    constructor(userError, code, message, requestId) {
        super(requestId, message);
        this.userError = userError;
        this.code = code;
    }
    isUserError() {
        return this.userError;
    }
}
exports.InstallationRequestFailedError = InstallationRequestFailedError;
class MissingAppError extends cli_shared_1.UserError {
}
exports.MissingAppError = MissingAppError;
class MissingAppEnvironmentError extends Error {
}
exports.MissingAppEnvironmentError = MissingAppEnvironmentError;
class MissingAppUninstallTask extends Error {
}
exports.MissingAppUninstallTask = MissingAppUninstallTask;
class InstallationNotFoundError extends cli_shared_1.UserError {
}
exports.InstallationNotFoundError = InstallationNotFoundError;
class UnknownSiteWithoutResourceIdError extends Error {
    constructor() {
        super(cli_shared_1.Text.installList.noResourceId);
    }
}
exports.UnknownSiteWithoutResourceIdError = UnknownSiteWithoutResourceIdError;
class InstallationsGraphqlClient {
    constructor(graphqlClient, cloudIdTranslator, bitbucketTranslator, pause) {
        this.graphqlClient = graphqlClient;
        this.cloudIdTranslator = cloudIdTranslator;
        this.bitbucketTranslator = bitbucketTranslator;
        this.pause = pause;
        this.SITE_RESOURCE_TYPE = 'site';
        this.WORKSPACE_RESOURCE_TYPE = 'workspace';
    }
    static buildInstallationContext(product, resourceId, resourceType) {
        const ari = ari_1.AnyAri.create({
            resourceOwner: (0, cli_shared_1.ariResourceOwner)(product),
            resourceType: resourceType,
            resourceId: resourceId
        });
        return ari.toString();
    }
    async buildInstallationContext(product, site) {
        const ari = await this.getProductTranslation(product).buildInstallationContext(product, site);
        return ari.toString();
    }
    getProductTranslation(product) {
        if (product && (0, cli_shared_1.isBitbucketProduct)(product)) {
            return this.bitbucketTranslator;
        }
        return this.cloudIdTranslator;
    }
    async installAppIntoSite({ environmentKey, site, product, appId }) {
        const installationContext = await this.buildInstallationContext(product, site);
        const query = `
      mutation forge_cli_installApplication($input: AppInstallationInput!) {
        installApp(input: $input) {
          success
          taskId
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
        }
      }
    `;
        const variables = {
            input: {
                installationContext,
                appId,
                environmentKey,
                async: true
            }
        };
        const { response: { installApp: { success, taskId, errors } }, requestId } = await this.graphqlClient.mutate(query, variables);
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            if (error.code === ALREADY_INSTALLED_CODE) {
                throw new AlreadyInstalledError(requestId, error.statusCode);
            }
            if (error.code === PERMISSION_DENIED) {
                throw new PermissionDeniedError(requestId, ari_1.AnyAri.parse(appId).resourceId, error.statusCode);
            }
            throw new InstallationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
        if (!taskId) {
            throw new MissingTaskIdError(error.message);
        }
        await this.monitorAppInstallOrUpgrade(taskId);
    }
    async upgradeInstallation({ site, product, environmentKey, appId }) {
        const installationContext = await this.buildInstallationContext(product, site);
        const query = `
      mutation forge_cli_upgradeApplication($input: AppInstallationUpgradeInput!) {
        upgradeApp(input: $input) {
          success
          taskId
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
        }
      }
    `;
        const variables = {
            input: {
                installationContext,
                appId,
                environmentKey,
                async: true
            }
        };
        const { response: { upgradeApp: { success, errors, taskId } }, requestId } = await this.graphqlClient.mutate(query, variables);
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new UpgradeError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
        if (!taskId) {
            throw new MissingTaskIdError(error.message);
        }
        await this.monitorAppInstallOrUpgrade(taskId);
    }
    async monitorAppInstallOrUpgrade(taskId) {
        var _a, _b, _c, _d;
        let status = cli_shared_1.AppTaskState.Pending;
        while (status !== cli_shared_1.AppTaskState.Complete) {
            const { state, errors, requestId } = await this.getAppInstallationTask(taskId);
            status = state;
            if (status === cli_shared_1.AppTaskState.Failed) {
                const error = errors === null || errors === void 0 ? void 0 : errors[0];
                const statusCode = (_a = error === null || error === void 0 ? void 0 : error.extensions) === null || _a === void 0 ? void 0 : _a.statusCode;
                const isUserError = statusCode && statusCode >= 400 && statusCode < 500 ? true : false;
                const code = (_c = (_b = error === null || error === void 0 ? void 0 : error.extensions) === null || _b === void 0 ? void 0 : _b.errorType) !== null && _c !== void 0 ? _c : undefined;
                throw new InstallationRequestFailedError(isUserError, code, (_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : undefined, requestId);
            }
            if (status !== cli_shared_1.AppTaskState.Complete)
                await this.pause(exports.UNINSTALLATION_EVENT_POLL_INTERVAL);
        }
    }
    async uninstallApp(input) {
        const query = `
      mutation forge_cli_uninstallApplication($input: AppUninstallationInput!) {
        uninstallApp(input: $input) {
          success
          taskId
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
        }
      }
    `;
        const { response: { uninstallApp: { success, errors, taskId } }, requestId } = await this.graphqlClient.mutate(query, { input });
        const error = (0, cli_shared_1.getError)(errors);
        if (!success) {
            throw new cli_shared_1.GraphQlMutationError(`${error.message} (requestId: ${requestId || 'unknown'})`, {
                requestId,
                code: error.code,
                statusCode: error.statusCode
            });
        }
        return this.monitorUninstallApp(taskId);
    }
    async uninstallMultipleApps(apps) {
        const uninstallsResult = [];
        for (const app of apps) {
            try {
                const [success] = await Promise.all([
                    this.uninstallApp(app),
                    new Promise((resolve) => setTimeout(resolve, 1000))
                ]);
                uninstallsResult.push(Object.assign(Object.assign({}, app), { successful: success }));
            }
            catch (err) {
                uninstallsResult.push(Object.assign(Object.assign({}, app), { successful: false }));
            }
        }
        return uninstallsResult;
    }
    async listInstallations(appId) {
        const installations = await this.getAllInstallations(appId);
        return await this.resolveInstallationsHostnames(installations);
    }
    async getInstallation(appId, installationId) {
        const installations = await this.listInstallations(appId);
        const matchedInstallation = installations.find(({ id }) => id === installationId);
        if (matchedInstallation) {
            return matchedInstallation;
        }
        throw new InstallationNotFoundError(cli_shared_1.Text.installationId.errors.notFound(installationId));
    }
    async getAppInstallationTask(taskId) {
        const query = `
      query forge_cli_getInstallationTask($id: ID!) {
        appInstallationTask(id: $id) {
          state
          errors {
            message
            extensions {
              errorType
              statusCode
            }
          }
        }
      }
    `;
        const { appInstallationTask, requestId } = await this.graphqlClient.query(query, {
            id: taskId
        });
        if (!appInstallationTask) {
            throw new MissingAppUninstallTask(cli_shared_1.Text.uninstall.missingUninstallTask);
        }
        const { state, errors } = appInstallationTask;
        return {
            errors,
            state,
            requestId
        };
    }
    async monitorUninstallApp(taskId) {
        let status = cli_shared_1.AppTaskState.Pending;
        while (status !== cli_shared_1.AppTaskState.Complete) {
            const { state } = await this.getAppInstallationTask(taskId);
            status = state;
            if (status === cli_shared_1.AppTaskState.Failed) {
                return false;
            }
            if (status !== cli_shared_1.AppTaskState.Complete)
                await this.pause(exports.UNINSTALLATION_EVENT_POLL_INTERVAL);
        }
        return true;
    }
    getResourceArisForProduct(installationContexts, condition) {
        return [...new Set(installationContexts.filter((context) => condition(context)))];
    }
    async getCombinedHostnameMap(installationContexts) {
        const bitbucketAris = this.getResourceArisForProduct(installationContexts, this.bitbucketTranslator.ariBelongsToProduct);
        const workspaceAriToHostname = await this.bitbucketTranslator.getSitesForResourceAris(bitbucketAris);
        const cloudIdAris = this.getResourceArisForProduct(installationContexts, this.cloudIdTranslator.ariBelongsToProduct);
        const siteAriToHostname = await this.cloudIdTranslator.getSitesForResourceAris(cloudIdAris);
        const combinedAriToHostname = Object.assign(Object.assign({}, siteAriToHostname), workspaceAriToHostname);
        return combinedAriToHostname;
    }
    async resolveInstallationsHostnames(installations) {
        if (!installations.length) {
            return [];
        }
        const installationContexts = installations.map(({ installation }) => {
            const context = ari_1.AnyAri.parse(installation.installationContext);
            const resourceId = context.resourceId;
            if (!resourceId) {
                throw new UnknownSiteWithoutResourceIdError();
            }
            return context;
        });
        const combinedAriToHostname = await this.getCombinedHostnameMap(installationContexts);
        return installationContexts.map((context, i) => {
            const { environment, environmentType, installation } = installations[i];
            const site = combinedAriToHostname[context.toString()];
            return {
                id: installation.id,
                product: context.resourceOwner,
                environmentKey: environment,
                environmentType,
                context: installation.installationContext,
                site,
                version: installation.appEnvironmentVersion || {
                    isLatest: false
                }
            };
        });
    }
    async getAllInstallations(appId) {
        var _a, _b;
        const query = `
      query forge_cli_getEcosystemInstallationsByApp($filter: AppInstallationsByAppFilter!, $first: Int, $after: String) {
        ecosystem {
          appInstallationsByApp(filter: $filter, first: $first, after: $after) {
            nodes {
              id
              installationContext
              appEnvironment {
                key
                type
              }
              appEnvironmentVersion {
                isLatest
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
        const output = [];
        let cursor = undefined;
        let hasNext = undefined;
        do {
            const result = (await this.graphqlClient.query(query, {
                filter: {
                    apps: {
                        ids: [appId]
                    }
                },
                first: 100,
                after: cursor
            }));
            if (!((_b = (_a = result === null || result === void 0 ? void 0 : result.ecosystem) === null || _a === void 0 ? void 0 : _a.appInstallationsByApp) === null || _b === void 0 ? void 0 : _b.nodes)) {
                throw new MissingAppError();
            }
            const { nodes, pageInfo } = result.ecosystem.appInstallationsByApp;
            for (const node of nodes) {
                if (node) {
                    if (!node.appEnvironment) {
                        throw new MissingAppEnvironmentError();
                    }
                    output.push({
                        environment: node.appEnvironment.key,
                        environmentType: node.appEnvironment.type,
                        installation: node
                    });
                }
            }
            cursor = pageInfo.endCursor;
            hasNext = pageInfo.hasNextPage;
        } while (hasNext && cursor);
        return output;
    }
    async getVersions(appId, environmentKey, firstN = 1) {
        var _a;
        const query = `
      query forge_cli_getApplicationEnvironmentLatestVersions($appId: ID!, $environmentKey: String!, $firstN: Int!) {
        app(id: $appId) {
          environmentByKey(key: $environmentKey) {
            type
            versions(first: $firstN) {
              nodes {
                permissions {
                  egress {
                    addresses
                  }
                  scopes {
                    key
                  }
                }
              }
            }
          }
        }
      }
    `;
        const result = await this.graphqlClient.query(query, {
            appId,
            environmentKey,
            firstN
        });
        if (!result.app) {
            throw new MissingAppError();
        }
        if (!result.app.environmentByKey) {
            throw new EnvironmentNotFoundError(environmentKey);
        }
        return {
            nodes: (_a = result.app.environmentByKey.versions) === null || _a === void 0 ? void 0 : _a.nodes,
            environmentType: result.app.environmentByKey.type
        };
    }
}
exports.InstallationsGraphqlClient = InstallationsGraphqlClient;
