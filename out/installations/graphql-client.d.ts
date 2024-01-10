import { AppUninstallationInput, GraphQLClient, GraphQlMutationError, Pause, BaseError, UserError } from '@forge/cli-shared';
import { AppInstallSiteDetails, InstallAppClient } from './install-app-site';
import { AppEnvironmentVersionData, Installation, ListAppInstallationsClient, UpgradeAppInstallationsClient } from '../service/installation-service';
import { UninstallAppClient, UninstallAppOutput } from './uninstall-app';
import { SiteTranslator } from './site-translation';
export declare const UNINSTALLATION_EVENT_POLL_INTERVAL = 500;
export declare const ALREADY_UPGRADED_CODE = "INSTALLATION_ALREADY_UPGRADED";
export declare class PermissionDeniedError extends GraphQlMutationError {
    constructor(requestId: string | undefined, appId: string | undefined, statusCode: number | undefined);
}
export declare class AlreadyInstalledError extends GraphQlMutationError {
    constructor(requestId: string | undefined, statusCode: number | undefined);
}
export declare class InstallationError extends GraphQlMutationError {
    constructor(message: string, { requestId, code, statusCode }: {
        requestId: string | undefined;
        code: string | undefined;
        statusCode: number | undefined;
    });
}
export declare class UpgradeError extends GraphQlMutationError {
    constructor(message: string, { requestId, code, statusCode }: {
        requestId: string | undefined;
        code: string | undefined;
        statusCode: number | undefined;
    });
}
export declare class EnvironmentNotFoundError extends UserError {
    constructor(environmentKey: string);
}
export declare class MissingTaskIdError extends Error {
}
export declare class InstallationRequestFailedError extends BaseError {
    private readonly userError;
    readonly code?: string | undefined;
    constructor(userError: boolean, code?: string | undefined, message?: string, requestId?: string | undefined);
    isUserError(): boolean;
}
export declare class MissingAppError extends UserError {
}
export declare class MissingAppEnvironmentError extends Error {
}
export declare class MissingAppUninstallTask extends Error {
}
export declare class InstallationNotFoundError extends UserError {
}
export declare class UnknownSiteWithoutResourceIdError extends Error {
    constructor();
}
export declare class InstallationsGraphqlClient implements InstallAppClient, ListAppInstallationsClient, UninstallAppClient, UpgradeAppInstallationsClient {
    private readonly graphqlClient;
    private readonly cloudIdTranslator;
    private readonly bitbucketTranslator;
    private readonly pause;
    SITE_RESOURCE_TYPE: string;
    WORKSPACE_RESOURCE_TYPE: string;
    static buildInstallationContext(product: string, resourceId: string, resourceType: string): string;
    constructor(graphqlClient: GraphQLClient, cloudIdTranslator: SiteTranslator, bitbucketTranslator: SiteTranslator, pause: Pause);
    private buildInstallationContext;
    private getProductTranslation;
    installAppIntoSite({ environmentKey, site, product, appId }: AppInstallSiteDetails): Promise<void>;
    upgradeInstallation({ site, product, environmentKey, appId }: AppInstallSiteDetails): Promise<void>;
    private monitorAppInstallOrUpgrade;
    uninstallApp(input: AppUninstallationInput): Promise<boolean>;
    uninstallMultipleApps(apps: AppUninstallationInput[]): Promise<Partial<UninstallAppOutput>[]>;
    listInstallations(appId: string): Promise<Installation[]>;
    getInstallation(appId: string, installationId: string): Promise<Installation>;
    private getAppInstallationTask;
    private monitorUninstallApp;
    private getResourceArisForProduct;
    private getCombinedHostnameMap;
    private resolveInstallationsHostnames;
    private getAllInstallations;
    getVersions(appId: string, environmentKey: string, firstN?: number): Promise<AppEnvironmentVersionData>;
}
//# sourceMappingURL=graphql-client.d.ts.map