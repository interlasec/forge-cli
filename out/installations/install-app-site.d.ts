/// <reference types="node" />
import { URL } from 'url';
import { AppConfigProvider } from '@forge/cli-shared';
export interface TriggerAppSiteInstallDetails {
    site: URL;
    product: string;
    environmentKey: string;
}
export interface AppInstallSiteDetails extends TriggerAppSiteInstallDetails {
    appId: string;
}
export interface InstallAppClient {
    installAppIntoSite(appInstallDetails: AppInstallSiteDetails): Promise<void>;
}
export declare class InstallAppSiteCommand {
    private readonly getAppConfig;
    private readonly installAppClient;
    constructor(getAppConfig: AppConfigProvider, installAppClient: InstallAppClient);
    execute({ environmentKey, site, product }: TriggerAppSiteInstallDetails): Promise<void>;
}
//# sourceMappingURL=install-app-site.d.ts.map