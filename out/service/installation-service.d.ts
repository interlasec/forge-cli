/// <reference types="node" />
import { AppConfigProvider, AppEnvironmentType, AppEnvironmentVersion, Maybe } from '@forge/cli-shared';
import { URL } from 'url';
import { AppInstallSiteDetails } from '../installations/install-app-site';
export interface Installation {
    id: string;
    product: string;
    site: string;
    environmentKey: string;
    environmentType: AppEnvironmentType;
    context: string;
    version: {
        isLatest: boolean;
    };
}
export interface AppInstallation {
    installations: Installation[];
}
export interface AppEnvironmentVersionPermissions {
    scopes: string[];
    egressAddresses: string[];
}
export interface AppEnvironmentPermissions extends AppEnvironmentVersionPermissions {
    addedScopes: string[];
    environmentType: AppEnvironmentType;
    hasDeployments: boolean;
}
interface InstallationFilterOptions {
    site?: string;
    product?: 'Jira' | 'Confluence';
    environment?: string;
}
export interface AppEnvironmentVersionData {
    nodes?: Array<Maybe<AppEnvironmentVersion>> | null;
    environmentType: AppEnvironmentType;
}
export interface ListAppInstallationsClient {
    listInstallations(appId: string): Promise<Installation[]>;
    getVersions(appId: string, environmentKey: string, firstN: number): Promise<AppEnvironmentVersionData>;
}
export interface UpgradeAppInstallationsClient {
    upgradeInstallation({ site, product, environmentKey, appId }: AppInstallSiteDetails): Promise<void>;
}
export declare class InstallationService {
    private readonly getAppConfig;
    private readonly listInstallationsClient;
    private readonly upgradeAppInstallationsClient;
    constructor(getAppConfig: AppConfigProvider, listInstallationsClient: ListAppInstallationsClient, upgradeAppInstallationsClient: UpgradeAppInstallationsClient);
    private filterInstallations;
    listAppInstallations(filter?: InstallationFilterOptions): Promise<AppInstallation>;
    listNonTechnicalAppInstallations(filter?: InstallationFilterOptions): Promise<AppInstallation>;
    hasOutdatedProductInstallation(environment: string): Promise<boolean>;
    upgradeInstallation(site: URL, product: string, environmentKey: string, appId: string): Promise<boolean>;
    private getPermissionsFromAppEnvironmentVersion;
    getAppEnvironmentPermissions(appId: string, environmentKey: string): Promise<AppEnvironmentPermissions | undefined>;
}
export {};
//# sourceMappingURL=installation-service.d.ts.map