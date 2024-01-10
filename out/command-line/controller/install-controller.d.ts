/// <reference types="node" />
import { AppConfigProvider, ConfigFile, UI, FeatureFlagReader } from '@forge/cli-shared';
import { URL } from 'url';
import { InstallAppSiteCommand } from '../../installations/install-app-site';
import { InstallationService } from '../../service/installation-service';
import { InstallView } from '../view/install-view';
interface InstallViewProps {
    environment: string;
    site?: URL;
    product?: string;
    upgrade: boolean;
    nonInteractive?: boolean;
    confirmScopes: boolean;
}
export declare class NoDeploymentError extends Error {
    constructor(environment: string);
}
export declare class InstallController {
    private readonly appConfigProvider;
    private readonly configFile;
    private readonly ui;
    private readonly installAppSiteCommand;
    private readonly installationService;
    private readonly installView;
    private readonly featureFlags;
    constructor(appConfigProvider: AppConfigProvider, configFile: ConfigFile, ui: UI, installAppSiteCommand: InstallAppSiteCommand, installationService: InstallationService, installView: InstallView, featureFlags: FeatureFlagReader);
    private securityPrompt;
    private installOrUpgrade;
    private promptForProduct;
    private promptForSite;
    private promptForUpgrade;
    private getUniqueInstallationProductsFromScopes;
    run({ environment, site, product, upgrade, confirmScopes, nonInteractive }: InstallViewProps): Promise<void>;
    private extractAddedScopes;
}
export {};
//# sourceMappingURL=install-controller.d.ts.map